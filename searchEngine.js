(function () {
  function normalizeValue(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  function normalizeWithMap(value) {
    const source = String(value || "");
    let normalized = "";
    const map = [];

    for (let index = 0; index < source.length; index += 1) {
      const normalizedChar = source[index]
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

      for (const entry of normalizedChar) {
        normalized += entry;
        map.push(index);
      }
    }

    return { original: source, normalized, map };
  }

  function tokenizeQuery(query) {
    return normalizeValue(query)
      .split(/\s+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function mergeRanges(ranges) {
    if (!ranges.length) return [];
    const ordered = [...ranges].sort((a, b) => a[0] - b[0]);
    const merged = [ordered[0]];

    for (let index = 1; index < ordered.length; index += 1) {
      const current = ordered[index];
      const previous = merged[merged.length - 1];
      if (current[0] <= previous[1] + 1) {
        previous[1] = Math.max(previous[1], current[1]);
      } else {
        merged.push(current);
      }
    }

    return merged;
  }

  function findRangesForToken(mappedValue, token) {
    if (!token) return [];

    const ranges = [];
    let startIndex = 0;
    while (startIndex < mappedValue.normalized.length) {
      const matchIndex = mappedValue.normalized.indexOf(token, startIndex);
      if (matchIndex === -1) break;

      const endIndex = matchIndex + token.length - 1;
      const originalStart = mappedValue.map[matchIndex];
      const originalEnd = mappedValue.map[endIndex];

      if (typeof originalStart === "number" && typeof originalEnd === "number") {
        ranges.push([originalStart, originalEnd]);
      }

      startIndex = matchIndex + token.length;
    }

    return ranges;
  }

  function createHighlights(item, queryTokens) {
    const sourceByField = {
      term: normalizeWithMap(item.term || ""),
      slug: normalizeWithMap(item.slug || ""),
      definition: normalizeWithMap(item.definition || ""),
      category: normalizeWithMap(item.category || ""),
      related: normalizeWithMap(Array.isArray(item.related) ? item.related.join(", ") : "")
    };

    const highlights = {};
    for (const [field, mappedValue] of Object.entries(sourceByField)) {
      const ranges = [];
      for (const token of queryTokens) {
        ranges.push(...findRangesForToken(mappedValue, token));
      }
      const merged = mergeRanges(ranges);
      if (merged.length) highlights[field] = merged;
    }

    return highlights;
  }

  function isSubsequence(query, candidate) {
    if (!query || !candidate) return false;
    let queryIndex = 0;
    for (let index = 0; index < candidate.length; index += 1) {
      if (candidate[index] === query[queryIndex]) queryIndex += 1;
      if (queryIndex === query.length) return true;
    }
    return false;
  }

  function scoreField(normalizedValue, queryTokens) {
    if (!normalizedValue) return Number.POSITIVE_INFINITY;

    let total = 0;
    let matched = 0;

    for (const token of queryTokens) {
      if (!token) continue;

      if (normalizedValue === token) {
        matched += 1;
        total += 0.001;
        continue;
      }

      if (normalizedValue.startsWith(token)) {
        matched += 1;
        total += 0.04;
        continue;
      }

      const includesIndex = normalizedValue.indexOf(token);
      if (includesIndex !== -1) {
        matched += 1;
        total += 0.12 + (includesIndex / Math.max(normalizedValue.length, 1)) * 0.08;
        continue;
      }

      if (isSubsequence(token, normalizedValue)) {
        matched += 1;
        total += 0.32;
      }
    }

    if (!matched) return Number.POSITIVE_INFINITY;
    return total / matched;
  }

  class MiniFuse {
    constructor(items, options) {
      this.items = Array.isArray(items) ? items : [];
      this.keys = Array.isArray(options?.keys) ? options.keys : [];
    }

    search(query, options) {
      const queryTokens = tokenizeQuery(query);
      const limit = typeof options?.limit === "number" ? options.limit : this.items.length;

      const results = [];
      for (const entry of this.items) {
        let bestScore = Number.POSITIVE_INFINITY;

        for (const keyConfig of this.keys) {
          const key = typeof keyConfig === "string" ? keyConfig : keyConfig.name;
          const weight = typeof keyConfig === "object" && typeof keyConfig.weight === "number"
            ? keyConfig.weight
            : 1;
          const score = scoreField(entry[key], queryTokens);
          if (Number.isFinite(score)) {
            bestScore = Math.min(bestScore, score / Math.max(weight, 0.01));
          }
        }

        if (Number.isFinite(bestScore)) {
          results.push({
            item: entry,
            score: bestScore
          });
        }
      }

      return results
        .sort((a, b) => a.score - b.score)
        .slice(0, limit);
    }
  }

  function createEngine(items) {
    const indexedItems = (Array.isArray(items) ? items : []).map((item) => ({
      ref: item,
      term: normalizeValue(item.term || ""),
      slug: normalizeValue(item.slug || item.term || ""),
      definition: normalizeValue(item.definition || ""),
      category: normalizeValue(item.category || ""),
      related: normalizeValue(Array.isArray(item.related) ? item.related.join(" ") : "")
    }));

    const FuseImpl = window.Fuse || MiniFuse;
    const fuse = new FuseImpl(indexedItems, {
      includeScore: true,
      includeMatches: false,
      ignoreLocation: true,
      threshold: 0.35,
      minMatchCharLength: 2,
      keys: [
        { name: "term", weight: 4 },
        { name: "slug", weight: 3 },
        { name: "category", weight: 2 },
        { name: "related", weight: 2 },
        { name: "definition", weight: 1.5 }
      ]
    });

    return {
      size: indexedItems.length,
      search(query, { limit = indexedItems.length } = {}) {
        const queryTokens = tokenizeQuery(query);
        if (!queryTokens.length) return [];

        const results = fuse.search(query, { limit });
        return results.map((result, index) => {
          const item = result.item?.ref || result.item;
          const score = typeof result.score === "number" ? result.score : index;
          return {
            item,
            score,
            highlights: createHighlights(item, queryTokens)
          };
        });
      }
    };
  }

  function highlightText(text, ranges) {
    const source = String(text || "");
    if (!Array.isArray(ranges) || !ranges.length) return [{ text: source, match: false }];

    const segments = [];
    let cursor = 0;

    for (const [start, end] of mergeRanges(ranges)) {
      if (start > cursor) {
        segments.push({ text: source.slice(cursor, start), match: false });
      }
      segments.push({ text: source.slice(start, end + 1), match: true });
      cursor = end + 1;
    }

    if (cursor < source.length) {
      segments.push({ text: source.slice(cursor), match: false });
    }

    return segments.filter((segment) => segment.text);
  }

  window.DicoArchiSearchEngine = {
    normalizeValue,
    createEngine,
    highlightText
  };
})();
