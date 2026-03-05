import math
import pygame


_FONT_CACHE = {}


def _font(size, weight="normal"):
    key = (size, weight)
    if key not in _FONT_CACHE:
        _FONT_CACHE[key] = pygame.font.SysFont(None, size, bold=(weight in ("bold", "heavy")))
    return _FONT_CACHE[key]


def lerp(a, b, t):
    return a + (b - a) * t


def ease_out_cubic(t):
    t = max(0.0, min(1.0, t))
    return 1.0 - (1.0 - t) ** 3


def draw_vignette(surface, alpha=64):
    w, h = surface.get_size()
    overlay = pygame.Surface((w, h), pygame.SRCALPHA)
    for i in range(5):
        pad = i * 14
        val = int(alpha * (i + 1) / 5)
        pygame.draw.rect(overlay, (0, 0, 0, val), (pad, pad, w - pad * 2, h - pad * 2), 40)
    surface.blit(overlay, (0, 0))


def draw_soft_glow(surface, center, color, radius, alpha=40):
    glow = pygame.Surface((radius * 2, radius * 2), pygame.SRCALPHA)
    pygame.draw.circle(glow, (*color, alpha), (radius, radius), radius)
    pygame.draw.circle(glow, (*color, max(10, alpha // 2)), (radius, radius), int(radius * 1.35))
    surface.blit(glow, (center[0] - radius, center[1] - radius))


def ui_panel(surface, rect, style):
    glow_color = style.get("glow_color", (90, 210, 255))
    fill = style.get("fill", (20, 26, 44, 175))
    border = style.get("border", (110, 130, 180, 220))
    radius = style.get("radius", 18)
    draw_soft_glow(surface, rect.center, glow_color, int(max(rect.width, rect.height) * 0.42), alpha=22)
    panel = pygame.Surface((rect.width, rect.height), pygame.SRCALPHA)
    pygame.draw.rect(panel, fill, (0, 0, rect.width, rect.height), border_radius=radius)
    pygame.draw.rect(panel, border, (0, 0, rect.width, rect.height), 2, border_radius=radius)
    surface.blit(panel, rect.topleft)


def ui_text(surface, text, pos, size, weight, color, shadow=True, glow=False, align="topleft", alpha=255):
    font = _font(size, weight)
    txt = font.render(text, True, color)
    txt.set_alpha(alpha)
    rect = txt.get_rect()
    setattr(rect, align, pos)
    if glow:
        glow_color = (color[0], color[1], color[2], 72)
        glow_layer = font.render(text, True, color)
        glow_layer.set_alpha(72)
        for ox, oy in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            surface.blit(glow_layer, rect.move(ox, oy))
    if shadow:
        sh = font.render(text, True, (0, 0, 0))
        sh.set_alpha(95 if alpha > 140 else alpha)
        surface.blit(sh, rect.move(1, 2))
    surface.blit(txt, rect)
    return rect


def ui_keybadge(surface, label, rect):
    bg = (34, 44, 72, 212)
    border = (116, 148, 206, 225)
    pygame.draw.rect(surface, bg, rect, border_radius=11)
    pygame.draw.rect(surface, border, rect, 2, border_radius=11)
    ui_text(surface, label, rect.center, 20, "bold", (238, 244, 255), shadow=False, align="center")


def ui_chip(surface, label, rect):
    bg = (32, 40, 66, 208)
    border = (102, 130, 194, 212)
    pygame.draw.rect(surface, bg, rect, border_radius=14)
    pygame.draw.rect(surface, border, rect, 1, border_radius=14)
    ui_text(surface, label, rect.center, 22, "bold", (226, 236, 252), shadow=False, align="center")


def ui_button(surface, rect, label, badges=None, state="normal"):
    badges = badges or []
    if state == "primary":
        fill = (30, 58, 84, 224)
        border = (106, 224, 255, 234)
        label_col = (240, 250, 255)
    else:
        fill = (34, 34, 52, 212)
        border = (138, 128, 172, 214)
        label_col = (230, 230, 244)
    pygame.draw.rect(surface, fill, rect, border_radius=14)
    pygame.draw.rect(surface, border, rect, 2, border_radius=14)
    ui_text(surface, label, (rect.x + 18, rect.centery), 24, "bold", label_col, shadow=False, align="midleft")
    bx = rect.right - 12
    for badge in reversed(badges):
        w = max(54, 16 + len(badge) * 11)
        brect = pygame.Rect(bx - w, rect.y + 8, w, rect.height - 16)
        ui_keybadge(surface, badge, brect)
        bx -= w + 8


def ui_statrow(surface, label, value, y, left, right):
    ui_text(surface, label, (left, y), 24, "normal", (200, 212, 236), shadow=False)
    ui_text(surface, value, (right, y), 24, "bold", (242, 248, 255), shadow=False, align="topright")


def draw_vertical_gradient(surface, top_color, bottom_color):
    w, h = surface.get_size()
    for y in range(h):
        k = y / max(1, h - 1)
        r = int(lerp(top_color[0], bottom_color[0], k))
        g = int(lerp(top_color[1], bottom_color[1], k))
        b = int(lerp(top_color[2], bottom_color[2], k))
        pygame.draw.line(surface, (r, g, b), (0, y), (w, y))

