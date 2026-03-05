import sys
import random
import json
import math
from array import array
import pygame
from visuals import make_visual_assets
import ui_components as ui
from ui_theme import (
    ACCENT_CYAN,
    ACCENT_DANGER,
    ACCENT_MAGENTA,
    BG_BOTTOM,
    BG_TOP,
    GAMEOVER_FADE_DURATION,
    GAMEOVER_SCALE_DURATION,
    MENU_COL_GAP,
    MENU_FADE_DURATION,
    MENU_HEIGHT,
    MENU_LEFT_RATIO,
    MENU_SLIDE_DURATION,
    MENU_TOP,
    OUTER_MARGIN,
    SIZE_BODY,
    SIZE_H2,
    SIZE_HERO,
    SIZE_MICRO,
    SIZE_SUBTITLE,
    TEXT_MUTED,
    TEXT_PRIMARY,
    TEXT_SECONDARY,
    CTA_PULSE_SPEED,
)
from settings import (
    WIDTH,
    HEIGHT,
    FPS,
    TITLE,
    SAVE_PATH,
    GROUND_Y,
    PLAYER_W,
    PLAYER_H,
    GRAVITY,
    JUMP_VELOCITY,
    LANES,
    OBSTACLE_W,
    OBSTACLE_H,
    HIGH_OBSTACLE_H,
    HIGH_OBSTACLE_CHANCE,
    WORLD_SPEED,
    SPAWN_INTERVAL,
    MIN_SPAWN_INTERVAL,
    SPEED_ACCEL,
    MAX_SPEED,
    COIN_RADIUS,
    COIN_SPAWN_INTERVAL,
    COIN_SCORE,
    DASH_DURATION,
    DASH_COOLDOWN,
    DASH_PLAYER_H,
    DASH_SPEED_BOOST,
    POWERUP_RADIUS,
    POWERUP_SPAWN_INTERVAL,
    SHIELD_DURATION,
    OUTLINE_WIDTH_PLAYER,
    OUTLINE_WIDTH_OBSTACLE,
    OUTLINE_WIDTH_COIN,
    OUTLINE_WIDTH_POWERUP,
    PARALLAX_NEAR_FACTOR,
    PARALLAX_FAR_FACTOR,
    PARALLAX_NEAR_LOOP,
    PARALLAX_FAR_LOOP,
)

# --- Derived config ---
LANE_X = {
    -1: WIDTH // 2 - 180,
    0: WIDTH // 2,
    1: WIDTH // 2 + 180,
}

# --- Game States ---
STATE_MENU = "menu"
STATE_RUN = "run"
STATE_PAUSE = "pause"
STATE_GAMEOVER = "gameover"


# Cache d'outline par surface pour eviter un mask.from_surface a chaque frame.
OUTLINE_CACHE = {}


def new_run_data():
    return {
        "lane": 0,
        "y": float(GROUND_Y - PLAYER_H),
        "vy": 0.0,
        "speed": WORLD_SPEED,
        "spawn_timer": 0.0,
        "obstacles": [],
        "coin_spawn_timer": 0.0,
        "coins": [],
        "powerup_spawn_timer": 0.0,
        "powerups": [],
        "road_offset": 0.0,
        "score": 0,
        "coins_collected": 0,
        "obstacles_avoided": 0,
        "coin_flash": 0.0,
        "shield_timer": 0.0,
        "dash_timer": 0.0,
        "dash_cooldown": 0.0,
        "popups": [],
    }


def choose_obstacle_lanes():
    # Pattern simple: obstacle unique ou double (en laissant toujours 1 voie libre).
    if random.random() < 0.65:
        return [random.choice(LANES)]
    free_lane = random.choice(LANES)
    return [lane for lane in LANES if lane != free_lane]


def choose_obstacle_type():
    return "high" if random.random() < HIGH_OBSTACLE_CHANCE else "low"


def choose_obstacle_kind(obstacle_type):
    if obstacle_type == "high":
        return "chair"
    return random.choice(["box", "binbag", "plant"])


def init_audio():
    sounds = {
        "coin": None,
        "hit": None,
        "shield": None,
        "jump": None,
        "dash": None,
        "shield_end": None,
    }
    try:
        pygame.mixer.init(frequency=22050, size=-16, channels=1)
        sounds["coin"] = make_beep(900, 80, 0.25)
        sounds["hit"] = make_beep(180, 220, 0.35)
        sounds["shield"] = make_beep(520, 160, 0.30)
        sounds["jump"] = make_sweep(780, 1120, 85, 0.22)
        sounds["dash"] = make_sweep(260, 620, 110, 0.28)
        sounds["shield_end"] = make_sweep(520, 340, 140, 0.20)
    except pygame.error:
        pass
    return sounds


def set_sfx_enabled(enabled):
    if pygame.mixer.get_init():
        pygame.mixer.set_num_channels(8)
        pygame.mixer.pause() if not enabled else pygame.mixer.unpause()


def make_beep(freq_hz, duration_ms, volume):
    if not pygame.mixer.get_init():
        return None
    sample_rate = pygame.mixer.get_init()[0]
    n_samples = max(1, int(sample_rate * duration_ms / 1000))
    amplitude = int(32767 * max(0.0, min(volume, 1.0)))
    buf = array("h")
    for i in range(n_samples):
        t = i / sample_rate
        env = 1.0 - (i / n_samples)
        sample = int(amplitude * env * math.sin(2.0 * math.pi * freq_hz * t))
        buf.append(sample)
    return pygame.mixer.Sound(buffer=buf.tobytes())


def make_sweep(freq_start_hz, freq_end_hz, duration_ms, volume):
    if not pygame.mixer.get_init():
        return None
    sample_rate = pygame.mixer.get_init()[0]
    n_samples = max(1, int(sample_rate * duration_ms / 1000))
    amplitude = int(32767 * max(0.0, min(volume, 1.0)))
    buf = array("h")
    for i in range(n_samples):
        progress = i / max(1, n_samples - 1)
        freq = freq_start_hz + (freq_end_hz - freq_start_hz) * progress
        t = i / sample_rate
        env = 1.0 - progress
        sample = int(amplitude * env * math.sin(2.0 * math.pi * freq * t))
        buf.append(sample)
    return pygame.mixer.Sound(buffer=buf.tobytes())


def load_best_score():
    try:
        if SAVE_PATH.exists():
            data = json.loads(SAVE_PATH.read_text(encoding="utf-8"))
            return int(data.get("best_score", 0))
    except (ValueError, OSError):
        pass
    return 0


def save_best_score(best_score):
    try:
        SAVE_PATH.parent.mkdir(parents=True, exist_ok=True)
        payload = {"best_score": int(best_score)}
        SAVE_PATH.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    except OSError:
        pass


def current_player_h(run_data):
    return DASH_PLAYER_H if run_data["dash_timer"] > 0.0 else PLAYER_H


def current_world_speed(run_data):
    boost = DASH_SPEED_BOOST if run_data["dash_timer"] > 0.0 else 0.0
    return run_data["speed"] + boost


def get_player_rect(run_data):
    player_h = current_player_h(run_data)
    return pygame.Rect(
        LANE_X[run_data["lane"]] - PLAYER_W // 2,
        int(run_data["y"]),
        PLAYER_W,
        player_h,
    )


def get_obstacle_rect(obs):
    obs_h = HIGH_OBSTACLE_H if obs["type"] == "high" else OBSTACLE_H
    return pygame.Rect(
        LANE_X[obs["lane"]] - OBSTACLE_W // 2,
        int(obs["y"]),
        OBSTACLE_W,
        obs_h,
    )


def main():
    pygame.init()
    sounds = init_audio()
    screen = pygame.display.set_mode((WIDTH, HEIGHT))
    pygame.display.set_caption(TITLE)
    font = pygame.font.SysFont(None, 36)
    small_font = pygame.font.SysFont(None, 28)
    assets = make_visual_assets(
        PLAYER_W,
        PLAYER_H,
        DASH_PLAYER_H,
        OBSTACLE_W,
        OBSTACLE_H,
        HIGH_OBSTACLE_H,
        COIN_RADIUS,
        POWERUP_RADIUS,
    )

    clock = pygame.time.Clock()
    running = True
    state = STATE_MENU
    state_age = 0.0
    run_data = new_run_data()
    best_score = load_best_score()
    hit_flash_timer = 0.0
    sfx_enabled = True
    debug_visible = False

    def switch_state(next_state):
        nonlocal state, state_age
        if next_state != state:
            state = next_state
            state_age = 0.0

    while running:
        dt = clock.tick(FPS) / 1000
        hit_flash_timer = max(0.0, hit_flash_timer - dt)

        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            elif event.type == pygame.KEYDOWN and event.key == pygame.K_F1:
                debug_visible = not debug_visible
            elif event.type == pygame.KEYDOWN and event.key == pygame.K_ESCAPE:
                running = False

            if state == STATE_MENU:
                if event.type == pygame.KEYDOWN and event.key in (pygame.K_RETURN, pygame.K_SPACE):
                    run_data = new_run_data()
                    switch_state(STATE_RUN)

            elif state == STATE_RUN:
                if event.type == pygame.KEYDOWN:
                    if event.key == pygame.K_LEFT:
                        run_data["lane"] = max(-1, run_data["lane"] - 1)
                    elif event.key == pygame.K_RIGHT:
                        run_data["lane"] = min(1, run_data["lane"] + 1)
                    elif event.key == pygame.K_SPACE:
                        if run_data["y"] >= GROUND_Y - current_player_h(run_data):
                            run_data["vy"] = JUMP_VELOCITY
                            if sfx_enabled and sounds["jump"] is not None:
                                sounds["jump"].play()
                    elif event.key in (pygame.K_DOWN, pygame.K_LSHIFT, pygame.K_RSHIFT):
                        if run_data["dash_cooldown"] <= 0.0 and run_data["dash_timer"] <= 0.0:
                            run_data["dash_timer"] = DASH_DURATION
                            run_data["dash_cooldown"] = DASH_COOLDOWN
                            if run_data["vy"] == 0.0:
                                run_data["y"] = float(GROUND_Y - DASH_PLAYER_H)
                            if sfx_enabled and sounds["dash"] is not None:
                                sounds["dash"].play()
                    elif event.key == pygame.K_p:
                        switch_state(STATE_PAUSE)
                    elif event.key == pygame.K_m:
                        sfx_enabled = not sfx_enabled
                        set_sfx_enabled(sfx_enabled)

            elif state == STATE_PAUSE:
                if event.type == pygame.KEYDOWN:
                    if event.key == pygame.K_p:
                        switch_state(STATE_RUN)
                    elif event.key == pygame.K_m:
                        sfx_enabled = not sfx_enabled
                        set_sfx_enabled(sfx_enabled)

            elif state == STATE_GAMEOVER:
                if event.type == pygame.KEYDOWN:
                    if event.key == pygame.K_r:
                        run_data = new_run_data()
                        switch_state(STATE_RUN)
                    elif event.key == pygame.K_m:
                        sfx_enabled = not sfx_enabled
                        set_sfx_enabled(sfx_enabled)

        if state == STATE_RUN:
            active_sounds = (
                sounds
                if sfx_enabled
                else {
                    "coin": None,
                    "hit": None,
                    "shield": None,
                    "jump": None,
                    "dash": None,
                    "shield_end": None,
                }
            )
            alive, got_hit = update_game(run_data, dt, active_sounds)
            if got_hit and sfx_enabled and sounds["hit"] is not None:
                sounds["hit"].play()
                if not alive:
                    new_best = max(best_score, run_data["score"])
                    if new_best != best_score:
                        best_score = new_best
                        save_best_score(best_score)
                    hit_flash_timer = 0.22
                    switch_state(STATE_GAMEOVER)

        draw(
            screen,
            state,
            run_data,
            best_score,
            font,
            small_font,
            hit_flash_timer,
            sfx_enabled,
            debug_visible,
            assets,
            clock.get_fps(),
            state_age,
        )
        pygame.display.flip()
        state_age += dt

    pygame.quit()
    sys.exit()


def update_game(run_data, dt, sounds):
    shield_was_active = run_data["shield_timer"] > 0.0
    run_data["dash_timer"] = max(0.0, run_data["dash_timer"] - dt)
    run_data["dash_cooldown"] = max(0.0, run_data["dash_cooldown"] - dt)
    run_data["shield_timer"] = max(0.0, run_data["shield_timer"] - dt)
    if shield_was_active and run_data["shield_timer"] <= 0.0:
        if sounds.get("shield_end") is not None:
            sounds["shield_end"].play()

    if run_data["dash_timer"] <= 0.0 and run_data["vy"] == 0.0:
        run_data["y"] = float(min(run_data["y"], GROUND_Y - PLAYER_H))

    run_data["score"] += int(100 * dt)
    run_data["speed"] = min(MAX_SPEED, run_data["speed"] + SPEED_ACCEL * dt)
    world_speed = current_world_speed(run_data)
    run_data["vy"] += GRAVITY * dt
    run_data["y"] += run_data["vy"] * dt

    ground_top = GROUND_Y - current_player_h(run_data)
    if run_data["y"] >= ground_top:
        run_data["y"] = ground_top
        run_data["vy"] = 0.0

    run_data["road_offset"] = (run_data["road_offset"] + world_speed * dt) % 40

    speed_ratio = (run_data["speed"] - WORLD_SPEED) / (MAX_SPEED - WORLD_SPEED)
    speed_ratio = max(0.0, min(1.0, speed_ratio))
    obstacle_interval = SPAWN_INTERVAL - (SPAWN_INTERVAL - MIN_SPAWN_INTERVAL) * (speed_ratio ** 1.15)

    run_data["spawn_timer"] += dt
    if run_data["spawn_timer"] >= obstacle_interval:
        run_data["spawn_timer"] = 0.0
        for lane in choose_obstacle_lanes():
            obs_type = choose_obstacle_type()
            obs_h = HIGH_OBSTACLE_H if obs_type == "high" else OBSTACLE_H
            run_data["obstacles"].append(
                {
                    "lane": lane,
                    "type": obs_type,
                    "kind": choose_obstacle_kind(obs_type),
                    "y": -obs_h,
                }
            )

    coin_interval = COIN_SPAWN_INTERVAL + 0.18 * speed_ratio
    run_data["coin_spawn_timer"] += dt
    if run_data["coin_spawn_timer"] >= coin_interval:
        run_data["coin_spawn_timer"] = 0.0
        run_data["coins"].append({"lane": random.choice(LANES), "y": -COIN_RADIUS * 2})

    run_data["powerup_spawn_timer"] += dt
    if run_data["powerup_spawn_timer"] >= POWERUP_SPAWN_INTERVAL:
        run_data["powerup_spawn_timer"] = 0.0
        run_data["powerups"].append(
            {"lane": random.choice(LANES), "y": -POWERUP_RADIUS * 2, "kind": "shield"}
        )

    for obs in run_data["obstacles"]:
        obs["y"] += world_speed * dt
    kept_obstacles_scroll = []
    for obs in run_data["obstacles"]:
        if obs["y"] < HEIGHT + OBSTACLE_H:
            kept_obstacles_scroll.append(obs)
        else:
            run_data["obstacles_avoided"] += 1
    run_data["obstacles"] = kept_obstacles_scroll

    for coin in run_data["coins"]:
        coin["y"] += world_speed * dt
    run_data["coins"] = [c for c in run_data["coins"] if c["y"] < HEIGHT + COIN_RADIUS * 2]

    for powerup in run_data["powerups"]:
        powerup["y"] += world_speed * dt
    run_data["powerups"] = [p for p in run_data["powerups"] if p["y"] < HEIGHT + POWERUP_RADIUS * 2]

    player_rect = get_player_rect(run_data)

    kept_obstacles = []
    for obs in run_data["obstacles"]:
        if player_rect.colliderect(get_obstacle_rect(obs)):
            if run_data["shield_timer"] > 0.0:
                continue
            return False, True
        kept_obstacles.append(obs)
    run_data["obstacles"] = kept_obstacles

    kept_coins = []
    collected = 0
    for coin in run_data["coins"]:
        coin_rect = pygame.Rect(
            LANE_X[coin["lane"]] - COIN_RADIUS,
            int(coin["y"]),
            COIN_RADIUS * 2,
            COIN_RADIUS * 2,
        )
        if player_rect.colliderect(coin_rect):
            collected += 1
            run_data["coins_collected"] += 1
            run_data["popups"].append(
                {
                    "x": LANE_X[coin["lane"]],
                    "y": int(run_data["y"]) - 12,
                    "ttl": 0.45,
                    "text": f"+{COIN_SCORE}",
                }
            )
        else:
            kept_coins.append(coin)
    run_data["coins"] = kept_coins
    if collected > 0:
        run_data["score"] += COIN_SCORE * collected
        run_data["coin_flash"] = 0.12
        if sounds["coin"] is not None:
            sounds["coin"].play()

    kept_powerups = []
    for powerup in run_data["powerups"]:
        p_rect = pygame.Rect(
            LANE_X[powerup["lane"]] - POWERUP_RADIUS,
            int(powerup["y"]),
            POWERUP_RADIUS * 2,
            POWERUP_RADIUS * 2,
        )
        if player_rect.colliderect(p_rect):
            if powerup["kind"] == "shield":
                run_data["shield_timer"] = SHIELD_DURATION
                run_data["popups"].append(
                    {
                        "x": LANE_X[powerup["lane"]],
                        "y": int(run_data["y"]) - 22,
                        "ttl": 0.65,
                        "text": "SHIELD",
                    }
                )
                if sounds.get("shield") is not None:
                    sounds["shield"].play()
        else:
            kept_powerups.append(powerup)
    run_data["powerups"] = kept_powerups

    run_data["coin_flash"] = max(0.0, run_data["coin_flash"] - dt)
    for popup in run_data["popups"]:
        popup["y"] -= 120 * dt
        popup["ttl"] -= dt
    run_data["popups"] = [p for p in run_data["popups"] if p["ttl"] > 0]

    return True, False


def draw_player(screen, run_data, assets, t):
    x = LANE_X[run_data["lane"]] - PLAYER_W // 2
    y = int(run_data["y"])
    bob = int(2 * math.sin(t * 10.0))
    if run_data["shield_timer"] > 0.0:
        frames = assets["player"]["shield"]
    elif run_data["dash_timer"] > 0.0:
        frames = assets["player"]["dash"]
    else:
        frames = assets["player"]["normal"]
    frame = frames[int(t * 8) % len(frames)]
    if run_data["shield_timer"] > 0.0:
        outline_color = (120, 240, 255)
    elif run_data["dash_timer"] > 0.0:
        outline_color = (255, 190, 90)
    else:
        outline_color = (220, 220, 235)
    # chat: contour plus fin pour garder le détail du visage
    blit_with_outline(screen, frame, (x, y + bob), outline_color, width=OUTLINE_WIDTH_PLAYER)


def draw_obstacles(screen, run_data, assets):
    for obs in run_data["obstacles"]:
        x = LANE_X[obs["lane"]] - OBSTACLE_W // 2
        y = int(obs["y"])
        sprite = assets["obstacles"][obs["kind"]]
        if obs["kind"] == "box":
            outline_color = (250, 190, 120)
        elif obs["kind"] == "binbag":
            outline_color = (150, 170, 210)
        elif obs["kind"] == "plant":
            outline_color = (130, 230, 140)
        else:  # chair
            outline_color = (255, 140, 140)
        # obstacles: contour plus épais pour lisibilité en mouvement
        blit_with_outline(screen, sprite, (x, y), outline_color, width=OUTLINE_WIDTH_OBSTACLE)


def draw_coins(screen, run_data, assets, t):
    frame = assets["coin"][int(t * 12) % 2]
    for coin in run_data["coins"]:
        x = LANE_X[coin["lane"]]
        y = int(coin["y"] + COIN_RADIUS + 3)
        pos = (x - frame.get_width() // 2, y - frame.get_height() // 2)
        blit_with_outline(screen, frame, pos, (255, 245, 170), width=OUTLINE_WIDTH_COIN)


def draw_powerups(screen, run_data, assets, t):
    frame = assets["powerup"][int(t * 10) % 2]
    for powerup in run_data["powerups"]:
        x = LANE_X[powerup["lane"]]
        y = int(powerup["y"] + POWERUP_RADIUS + 3)
        pos = (x - frame.get_width() // 2, y - frame.get_height() // 2)
        blit_with_outline(screen, frame, pos, (180, 255, 245), width=OUTLINE_WIDTH_POWERUP)


def blit_with_outline(screen, sprite, pos, color, width=2):
    sprite_id = id(sprite)
    outline = OUTLINE_CACHE.get(sprite_id)
    if outline is None:
        outline = pygame.mask.from_surface(sprite).outline()
        OUTLINE_CACHE[sprite_id] = outline
    if outline:
        ox, oy = pos
        pts = [(ox + px, oy + py) for px, py in outline]
        pygame.draw.lines(screen, color, True, pts, width=width)
    screen.blit(sprite, pos)


def draw_popups(screen, run_data, small_font):
    for popup in run_data["popups"]:
        alpha = int(255 * max(0.0, min(1.0, popup["ttl"] / 0.45)))
        text = small_font.render(popup["text"], True, (255, 235, 120))
        text.set_alpha(alpha)
        screen.blit(text, (popup["x"] - text.get_width() // 2, int(popup["y"])))


def draw_debug(screen, run_data, best_score, small_font, fps):
    lines = [
        "DEBUG (F1)",
        f"fps={fps:.1f} target={FPS}",
        f"score={run_data['score']} best={best_score}",
        f"speed={run_data['speed']:.1f} world_speed={current_world_speed(run_data):.1f}",
        f"dash_timer={run_data['dash_timer']:.2f} dash_cd={run_data['dash_cooldown']:.2f}",
        f"shield_timer={run_data['shield_timer']:.2f}",
        f"obstacles={len(run_data['obstacles'])} coins={len(run_data['coins'])} powerups={len(run_data['powerups'])}",
        f"cfg: accel={SPEED_ACCEL} spawn={SPAWN_INTERVAL}->{MIN_SPAWN_INTERVAL}",
        f"cfg: coin={COIN_SPAWN_INTERVAL}s pwr={POWERUP_SPAWN_INTERVAL}s shield={SHIELD_DURATION}s",
    ]
    panel_h = 22 * len(lines) + 14
    panel = pygame.Rect(12, HEIGHT - panel_h - 12, 520, panel_h)
    pygame.draw.rect(screen, (10, 10, 18, 190), panel, border_radius=8)
    pygame.draw.rect(screen, (120, 120, 150), panel, 1, border_radius=8)
    y = panel.y + 8
    for line in lines:
        txt = small_font.render(line, True, (232, 236, 248))
        screen.blit(txt, (panel.x + 10, y))
        y += 22


def draw_cat_logo(screen, cx, cy, scale=1.0, glow=(90, 180, 255)):
    r = int(30 * scale)
    glow_surf = pygame.Surface((r * 6, r * 6), pygame.SRCALPHA)
    pygame.draw.circle(glow_surf, (*glow, 45), (r * 3, r * 3), int(r * 2.3))
    screen.blit(glow_surf, (cx - r * 3, cy - r * 3))

    face = pygame.Color(28, 30, 36)
    edge = pygame.Color(80, 86, 102)
    eye = pygame.Color(180, 230, 140)

    pygame.draw.circle(screen, edge, (cx, cy), r + 2)
    pygame.draw.circle(screen, face, (cx, cy), r)
    ear_l = [(cx - r + 4, cy - r + 6), (cx - int(r * 0.55), cy - int(r * 1.75)), (cx - int(r * 0.1), cy - r + 8)]
    ear_r = [(cx + r - 4, cy - r + 6), (cx + int(r * 0.55), cy - int(r * 1.75)), (cx + int(r * 0.1), cy - r + 8)]
    pygame.draw.polygon(screen, edge, ear_l)
    pygame.draw.polygon(screen, edge, ear_r)
    pygame.draw.polygon(screen, face, [(x, y + 2) for x, y in ear_l])
    pygame.draw.polygon(screen, face, [(x, y + 2) for x, y in ear_r])

    pygame.draw.ellipse(screen, eye, (cx - int(r * 0.42), cy - int(r * 0.15), int(r * 0.22), int(r * 0.36)))
    pygame.draw.ellipse(screen, eye, (cx + int(r * 0.20), cy - int(r * 0.15), int(r * 0.22), int(r * 0.36)))
    pygame.draw.polygon(screen, (220, 150, 165), [(cx, cy + int(r * 0.12)), (cx - 3, cy + int(r * 0.25)), (cx + 3, cy + int(r * 0.25))])
    for dx in (-1, 1):
        pygame.draw.line(screen, (210, 210, 220), (cx + 4 * dx, cy + int(r * 0.22)), (cx + int(r * 0.55) * dx, cy + int(r * 0.16)), 1)
        pygame.draw.line(screen, (210, 210, 220), (cx + 4 * dx, cy + int(r * 0.28)), (cx + int(r * 0.60) * dx, cy + int(r * 0.31)), 1)


def draw_living_world(screen, run_data):
    t = pygame.time.get_ticks() / 1000.0

    # sky gradient (top->bottom)
    for i in range(10):
        c = 16 + i * 4
        pygame.draw.rect(screen, (12, 14 + i * 2, c), (0, i * (GROUND_Y // 10), WIDTH, GROUND_Y // 10 + 1))

    # fixed half-moon
    moon_x = int(WIDTH * 0.82)
    moon_y = 74
    pygame.draw.circle(screen, (246, 246, 230), (moon_x, moon_y), 24)
    # cache la moitié droite pour obtenir une demi-lune fixe
    pygame.draw.circle(screen, (12, 16, 28), (moon_x + 10, moon_y - 1), 23)
    # halo léger
    halo = pygame.Surface((120, 120), pygame.SRCALPHA)
    pygame.draw.circle(halo, (210, 220, 255, 35), (60, 60), 42)
    screen.blit(halo, (moon_x - 60, moon_y - 60))

    # few calm stars (gentle twinkle)
    stars = [
        (90, 42), (160, 72), (240, 58), (330, 94), (420, 48),
        (520, 86), (610, 60), (700, 98), (780, 52), (850, 76),
    ]
    for i, (sx, sy) in enumerate(stars):
        tw = 140 + int(28 * (0.5 + 0.5 * math.sin(t * 0.8 + i * 0.7)))
        pygame.draw.circle(screen, (tw, tw, tw), (sx, sy), 1)

    # occasional shooting star (short window every ~15s)
    cycle = t % 15.0
    if cycle < 0.55:
        prog = cycle / 0.55
        sx = int(WIDTH * 0.15 + prog * 260)
        sy = int(58 + prog * 110)
        ex = sx - 26
        ey = sy - 12
        pygame.draw.line(screen, (235, 235, 255), (sx, sy), (ex, ey), 2)
        pygame.draw.line(screen, (170, 170, 210), (ex, ey), (ex - 20, ey - 8), 1)

    # skyline avec parallax leger pour garder un monde vivant sans agitation.
    near_offset = int((run_data["road_offset"] * PARALLAX_NEAR_FACTOR) % PARALLAX_NEAR_LOOP)
    far_offset = int((run_data["road_offset"] * PARALLAX_FAR_FACTOR) % PARALLAX_FAR_LOOP)

    base_y_far = GROUND_Y - 170
    base_y_near = GROUND_Y - 120

    for x in range(-160, WIDTH + 180, 95):
        h = 60 + ((x // 80) % 4) * 20
        rx = x - far_offset
        pygame.draw.rect(screen, (22, 28, 42), (rx, base_y_far - h, 56, h))

    for x in range(-120, WIDTH + 140, 88):
        h = 70 + ((x // 70) % 5) * 18
        rx = x - near_offset
        pygame.draw.rect(screen, (28, 36, 52), (rx, base_y_near - h, 52, h))
        for wy in range(base_y_near - h + 8, base_y_near - 8, 14):
            if (wy + x) % 5 == 0:
                pygame.draw.rect(screen, (185, 165, 104), (rx + 8, wy, 8, 6))


def draw_key_hint(screen, x, y, key_label, action_label, font):
    key_surf = font.render(key_label, True, (246, 248, 255))
    action_surf = font.render(action_label, True, (206, 214, 234))
    key_rect = pygame.Rect(x, y, key_surf.get_width() + 22, key_surf.get_height() + 12)
    pygame.draw.rect(screen, (42, 50, 74), key_rect, border_radius=10)
    pygame.draw.rect(screen, (112, 130, 180), key_rect, 2, border_radius=10)
    screen.blit(key_surf, (key_rect.x + 11, key_rect.y + 6))
    screen.blit(action_surf, (key_rect.right + 12, key_rect.y + 7))


def draw_menu_backdrop(screen, t, danger=False):
    top = BG_TOP
    bottom = BG_BOTTOM
    halo_color = ACCENT_DANGER if danger else ACCENT_CYAN
    ui.draw_vertical_gradient(screen, top, bottom)
    ui.draw_soft_glow(screen, (WIDTH // 2, 170), halo_color, 220, alpha=34)
    ui.draw_soft_glow(screen, (int(WIDTH * 0.72), 130), ACCENT_MAGENTA, 170, alpha=24)
    for i in range(22):
        px = int((i * 83 + t * (10 + i % 4)) % (WIDTH + 36)) - 18
        py = 62 + ((i * 57) % 430)
        tw = 90 + int(55 * (0.5 + 0.5 * math.sin(t * 1.2 + i * 0.6)))
        pygame.draw.circle(screen, (205, 225, 255, tw), (px, py), 1)
    ui.draw_vignette(screen, alpha=62 if danger else 54)


def get_gameover_feedback(score, best_score):
    if score <= 0:
        return "Première sortie. Le prochain run sera meilleur."
    if score >= best_score:
        return "Belle course. Nouveau sommet."
    if best_score > 0 and score >= int(best_score * 0.8):
        return "Belle course."
    if best_score > 0 and score >= int(best_score * 0.45):
        return "Presque."
    return "Brutal."


def draw(screen, state, run_data, best_score, font, small_font, hit_flash_timer, sfx_enabled, debug_visible, assets, fps, state_age):
    t = pygame.time.get_ticks() / 1000.0
    if state == STATE_MENU:
        draw_menu_backdrop(screen, t, danger=False)
        menu_alpha = ui.ease_out_cubic(min(1.0, state_age / MENU_FADE_DURATION))
        slide = 1.0 - ui.ease_out_cubic(min(1.0, state_age / MENU_SLIDE_DURATION))
        slide_px = int(34 * slide)
        alpha = int(255 * menu_alpha)

        draw_cat_logo(screen, WIDTH // 2, 84, 0.95, glow=(95, 170, 255))
        ui.ui_text(screen, "RUN SHADOW RUN", (WIDTH // 2, 42), SIZE_H2, "bold", TEXT_PRIMARY, glow=True, align="midtop", alpha=alpha)

        container_w = WIDTH - OUTER_MARGIN * 2
        left_w = int((container_w - MENU_COL_GAP) * MENU_LEFT_RATIO)
        right_w = container_w - MENU_COL_GAP - left_w
        left = pygame.Rect(OUTER_MARGIN - slide_px, MENU_TOP, left_w, MENU_HEIGHT)
        right = pygame.Rect(OUTER_MARGIN + left_w + MENU_COL_GAP + slide_px, MENU_TOP, right_w, MENU_HEIGHT)

        ui.ui_panel(
            screen,
            left,
            {
                "fill": (20, 26, 44, 180),
                "border": (106, 136, 194, 210),
                "glow_color": ACCENT_CYAN,
                "radius": 18,
            },
        )
        ui.ui_panel(
            screen,
            right,
            {
                "fill": (22, 24, 40, 178),
                "border": (126, 116, 184, 205),
                "glow_color": ACCENT_MAGENTA,
                "radius": 18,
            },
        )

        ui.ui_text(screen, "RUN SHADOW RUN", (left.x + 30, left.y + 28), SIZE_HERO, "heavy", TEXT_PRIMARY, glow=True, alpha=alpha)
        ui.ui_text(
            screen,
            "Runner de nuit. Réflexes serrés. Zéro erreur.",
            (left.x + 30, left.y + 96),
            SIZE_SUBTITLE,
            "normal",
            TEXT_SECONDARY,
            alpha=alpha,
        )

        chip_w = int((left.width - 80) / 3)
        chips = [
            f"Meilleur : {best_score}",
            "3 voies",
            "Mode : infini",
        ]
        for idx, label in enumerate(chips):
            chip_rect = pygame.Rect(left.x + 30 + idx * (chip_w + 10), left.y + 144, chip_w, 42)
            ui.ui_chip(screen, label, chip_rect)

        start_rect = pygame.Rect(left.x + 30, left.y + 214, left.width - 60, 56)
        quit_rect = pygame.Rect(left.x + 30, left.y + 286, left.width - 60, 52)
        ui.ui_button(screen, start_rect, "DÉMARRER", badges=["ENTRÉE", "ESPACE"], state="primary")
        ui.ui_button(screen, quit_rect, "QUITTER", badges=["ÉCHAP"], state="normal")

        pulse = 172 + int(60 * (0.5 + 0.5 * math.sin(t * CTA_PULSE_SPEED)))
        ui.ui_text(
            screen,
            "Appuie sur ENTRÉE",
            (left.centerx, left.bottom - 20),
            SIZE_BODY,
            "bold",
            (pulse, pulse, 255),
            shadow=False,
            align="midbottom",
            alpha=alpha,
        )

        ui.ui_text(screen, "But", (right.x + 24, right.y + 24), SIZE_SUBTITLE, "bold", TEXT_PRIMARY, alpha=alpha)
        ui.ui_text(
            screen,
            "Évite cartons, sacs, plantes, chaises.",
            (right.x + 24, right.y + 60),
            SIZE_BODY,
            "normal",
            TEXT_SECONDARY,
            alpha=alpha,
        )
        ui.ui_text(
            screen,
            "Survis, collecte, accélère.",
            (right.x + 24, right.y + 90),
            SIZE_BODY,
            "normal",
            TEXT_SECONDARY,
            alpha=alpha,
        )

        ui.ui_text(screen, "Commandes", (right.x + 24, right.y + 138), SIZE_SUBTITLE, "bold", TEXT_PRIMARY, alpha=alpha)
        controls = [
            ("Dash", ["BAS", "SHIFT"]),
            ("Pause", ["P"]),
            ("Son", ["M"]),
            ("Débogage FPS", ["F1"]),
        ]
        row_y = right.y + 172
        for label, badges in controls:
            ui.ui_text(screen, f"{label} :", (right.x + 24, row_y + 6), SIZE_BODY, "normal", TEXT_SECONDARY, alpha=alpha)
            bx = right.right - 22
            for badge in reversed(badges):
                bw = max(60, 18 + len(badge) * 10)
                brect = pygame.Rect(bx - bw, row_y, bw, 34)
                ui.ui_keybadge(screen, badge, brect)
                bx -= bw + 8
            row_y += 42

        ui.ui_text(
            screen,
            "Astuce : déclenche le dash au bon timing pour passer un obstacle.",
            (right.x + 24, right.bottom - 34),
            SIZE_MICRO,
            "normal",
            TEXT_MUTED,
            alpha=alpha,
        )

    elif state == STATE_RUN:
        draw_living_world(screen, run_data)
        pygame.draw.rect(screen, (40, 40, 40), (0, GROUND_Y, WIDTH, HEIGHT - GROUND_Y))
        for lane in LANES:
            x = LANE_X[lane]
            pygame.draw.line(screen, (90, 90, 90), (x, GROUND_Y), (x, HEIGHT), 2)
            y = int(GROUND_Y + run_data["road_offset"])
            while y < HEIGHT:
                pygame.draw.line(screen, (120, 120, 120), (x - 14, y), (x + 14, y), 2)
                y += 40
        draw_coins(screen, run_data, assets, t)
        draw_powerups(screen, run_data, assets, t)
        draw_obstacles(screen, run_data, assets)
        draw_player(screen, run_data, assets, t)
        draw_popups(screen, run_data, small_font)
        if run_data["coin_flash"] > 0.0:
            alpha = int(95 * (run_data["coin_flash"] / 0.12))
            flash = pygame.Surface((WIDTH, HEIGHT), pygame.SRCALPHA)
            flash.fill((255, 242, 160, alpha))
            screen.blit(flash, (0, 0))
        hud = small_font.render(
            f"Score:{run_data['score']} Best:{best_score} Spd:{int(current_world_speed(run_data))} "
            f"Shield:{run_data['shield_timer']:.1f}s DashCD:{run_data['dash_cooldown']:.1f}s "
            f"| LEFT/RIGHT SPACE DOWN(roll) P M F1 ESC",
            True,
            (245, 245, 245),
        )
        hud_bg = pygame.Rect(10, 10, hud.get_width() + 12, hud.get_height() + 10)
        pygame.draw.rect(screen, (0, 0, 0, 90), hud_bg, border_radius=8)
        screen.blit(hud, (16, 15))

    elif state == STATE_PAUSE:
        draw(screen, STATE_RUN, run_data, best_score, font, small_font, 0.0, sfx_enabled, False, assets, fps, state_age)
        overlay = pygame.Surface((WIDTH, HEIGHT), pygame.SRCALPHA)
        overlay.fill((0, 0, 0, 120))
        screen.blit(overlay, (0, 0))
        pause = font.render("PAUSE", True, (255, 255, 255))
        tip = small_font.render("P: reprendre | M: mute/unmute | ESC: quit", True, (235, 235, 235))
        screen.blit(pause, (WIDTH // 2 - pause.get_width() // 2, 240))
        screen.blit(tip, (WIDTH // 2 - tip.get_width() // 2, 290))

    elif state == STATE_GAMEOVER:
        draw_menu_backdrop(screen, t, danger=True)
        ui.draw_vignette(screen, alpha=92)
        go_fade = ui.ease_out_cubic(min(1.0, state_age / GAMEOVER_FADE_DURATION))
        go_scale = 1.0 + 0.02 * (1.0 - ui.ease_out_cubic(min(1.0, state_age / GAMEOVER_SCALE_DURATION)))
        panel_w = int(640 * go_scale)
        panel_h = int(332 * go_scale)
        panel = pygame.Rect(WIDTH // 2 - panel_w // 2, 156 - int((go_scale - 1.0) * 24), panel_w, panel_h)
        ui.ui_panel(
            screen,
            panel,
            {
                "fill": (56, 22, 36, 190),
                "border": (214, 120, 142, 220),
                "glow_color": ACCENT_DANGER,
                "radius": 20,
            },
        )
        draw_cat_logo(screen, WIDTH // 2, 108, 0.88, glow=(220, 92, 118))

        alpha = int(255 * go_fade)
        ui.ui_text(screen, "FIN DE COURSE", (panel.centerx, panel.y + 26), SIZE_H2, "heavy", TEXT_PRIMARY, glow=True, align="midtop", alpha=alpha)
        ui.ui_text(
            screen,
            get_gameover_feedback(run_data["score"], best_score),
            (panel.centerx, panel.y + 68),
            SIZE_BODY,
            "normal",
            TEXT_SECONDARY,
            align="midtop",
            alpha=alpha,
        )
        ui.ui_text(screen, f"{run_data['score']}", (panel.centerx, panel.y + 112), 78, "heavy", TEXT_PRIMARY, align="midtop", alpha=alpha)
        ui.ui_text(
            screen,
            f"Meilleur : {best_score}",
            (panel.centerx, panel.y + 184),
            SIZE_BODY,
            "normal",
            TEXT_SECONDARY,
            align="midtop",
            alpha=alpha,
        )

        dash_status = "prêt" if run_data["dash_cooldown"] <= 0.0 else f"recharge {run_data['dash_cooldown']:.1f} s"
        rows_top = panel.y + 222
        ui.ui_statrow(screen, "Obstacles évités", f"{run_data['obstacles_avoided']}", rows_top, panel.x + 42, panel.right - 42)
        ui.ui_statrow(screen, "Pièces collectées", f"{run_data['coins_collected']}", rows_top + 30, panel.x + 42, panel.right - 42)
        ui.ui_statrow(screen, "Dash", dash_status, rows_top + 60, panel.x + 42, panel.right - 42)

        btn_y = panel.bottom - 86
        btn_w = (panel.width - 122) // 2
        ui.ui_button(screen, pygame.Rect(panel.x + 42, btn_y, btn_w, 50), "REJOUER", badges=["R"], state="primary")
        ui.ui_button(screen, pygame.Rect(panel.x + 80 + btn_w, btn_y, btn_w, 50), "QUITTER", badges=["ÉCHAP"], state="normal")

        son_label = "ACTIVÉ" if sfx_enabled else "DÉSACTIVÉ"
        ui.ui_text(
            screen,
            f"Son : {son_label} (M)",
            (panel.centerx, panel.bottom - 12),
            SIZE_MICRO,
            "normal",
            TEXT_MUTED,
            align="midbottom",
            alpha=alpha,
        )
        if hit_flash_timer > 0.0:
            alpha = int(190 * (hit_flash_timer / 0.22))
            flash = pygame.Surface((WIDTH, HEIGHT), pygame.SRCALPHA)
            flash.fill((255, 255, 255, alpha))
            screen.blit(flash, (0, 0))

    if debug_visible:
        draw_debug(screen, run_data, best_score, small_font, fps)


if __name__ == "__main__":
    main()
