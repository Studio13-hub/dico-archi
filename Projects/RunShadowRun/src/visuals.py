import pygame


def _make_surface(w, h):
    return pygame.Surface((w, h), pygame.SRCALPHA)


def _player_frame(w, h, body, eye=(25, 25, 25), stripe=None, crouch=False):
    surf = _make_surface(w, h)
    pygame.draw.rect(surf, body, (0, 0, w, h), border_radius=10)
    if stripe is not None:
        pygame.draw.rect(surf, stripe, (4, h // 2 - 6, w - 8, 12), border_radius=5)
    if not crouch:
        pygame.draw.circle(surf, eye, (w // 3, h // 3), 4)
        pygame.draw.circle(surf, eye, (2 * w // 3, h // 3), 4)
    return surf


def _shade(c, k):
    return tuple(max(0, min(255, int(v * k))) for v in c)


def _cat_frame(w, h, body, eye=(240, 230, 110), crouch=False, shield=False):
    surf = _make_surface(w, h)
    dark = _shade(body, 0.7)
    light = _shade(body, 1.35)
    chest = (80, 80, 88)

    body_y = h // 3 if not crouch else h // 2 - 6
    body_h = h - body_y - 4
    pygame.draw.ellipse(surf, dark, (6, body_y + 2, w - 12, body_h))
    pygame.draw.ellipse(surf, body, (6, body_y, w - 12, body_h - 2))
    pygame.draw.ellipse(surf, chest, (w // 2 - 7, body_y + 8, 14, body_h - 10))

    head_y = h // 3 if not crouch else h // 2 - 10
    pygame.draw.circle(surf, dark, (w // 2, head_y + 1), h // 5 + 3)
    pygame.draw.circle(surf, body, (w // 2, head_y), h // 5 + 2)

    ear_l = [(w // 2 - 14, head_y - 7), (w // 2 - 4, head_y - 24), (w // 2 + 1, head_y - 5)]
    ear_r = [(w // 2 + 14, head_y - 7), (w // 2 + 4, head_y - 24), (w // 2 - 1, head_y - 5)]
    pygame.draw.polygon(surf, dark, ear_l)
    pygame.draw.polygon(surf, dark, ear_r)
    pygame.draw.polygon(surf, body, [(p[0], p[1] + 2) for p in ear_l])
    pygame.draw.polygon(surf, body, [(p[0], p[1] + 2) for p in ear_r])
    pygame.draw.polygon(surf, (160, 110, 135), [(w // 2 - 10, head_y - 8), (w // 2 - 4, head_y - 20), (w // 2 - 1, head_y - 7)])
    pygame.draw.polygon(surf, (160, 110, 135), [(w // 2 + 10, head_y - 8), (w // 2 + 4, head_y - 20), (w // 2 + 1, head_y - 7)])

    pygame.draw.arc(surf, dark, (w - 8, body_y + 2, 24, body_h + 6), 0.55, 2.7, 5)
    pygame.draw.arc(surf, body, (w - 8, body_y + 2, 24, body_h + 6), 0.55, 2.7, 3)

    if not crouch:
        pygame.draw.ellipse(surf, eye, (w // 2 - 10, head_y - 2, 5, 7))
        pygame.draw.ellipse(surf, eye, (w // 2 + 5, head_y - 2, 5, 7))
        pygame.draw.polygon(surf, (220, 150, 160), [(w // 2, head_y + 4), (w // 2 - 3, head_y + 8), (w // 2 + 3, head_y + 8)])
        for dx in (-1, 1):
            pygame.draw.line(surf, (220, 220, 220), (w // 2 + 3 * dx, head_y + 7), (w // 2 + 11 * dx, head_y + 5), 1)
            pygame.draw.line(surf, (220, 220, 220), (w // 2 + 3 * dx, head_y + 8), (w // 2 + 12 * dx, head_y + 9), 1)
            pygame.draw.line(surf, (220, 220, 220), (w // 2 + 3 * dx, head_y + 9), (w // 2 + 11 * dx, head_y + 12), 1)

    paw_y = h - 7
    pygame.draw.ellipse(surf, light, (w // 2 - 16, paw_y - 3, 10, 6))
    pygame.draw.ellipse(surf, light, (w // 2 + 6, paw_y - 3, 10, 6))

    if shield:
        pygame.draw.circle(surf, (150, 240, 255), (w // 2, h // 2), min(w, h) // 2, 2)
        pygame.draw.circle(surf, (195, 250, 255), (w // 2, h // 2), min(w, h) // 2 - 4, 1)
    return surf


def _obstacle_box(w, h):
    surf = _make_surface(w, h)
    pygame.draw.rect(surf, (120, 78, 48), (0, 0, w, h), border_radius=6)
    pygame.draw.rect(surf, (165, 112, 72), (2, 2, w - 4, h - 4), border_radius=6)
    pygame.draw.rect(surf, (194, 140, 96), (6, 6, w - 12, h - 12), border_radius=4)
    pygame.draw.rect(surf, (230, 204, 126), (w // 2 - 5, 6, 10, h - 12), border_radius=2)
    pygame.draw.line(surf, (108, 70, 45), (10, 16), (w - 10, 16), 1)
    pygame.draw.line(surf, (108, 70, 45), (10, h - 16), (w - 10, h - 16), 1)
    return surf


def _obstacle_binbag(w, h):
    surf = _make_surface(w, h)
    pygame.draw.ellipse(surf, (24, 28, 34), (4, 7, w - 8, h - 10))
    pygame.draw.ellipse(surf, (35, 40, 46), (6, 9, w - 12, h - 14))
    pygame.draw.rect(surf, (20, 24, 30), (w // 2 - 6, 2, 12, 10), border_radius=4)
    pygame.draw.line(surf, (58, 64, 76), (w // 3, h // 3), (w // 2, h // 2), 1)
    pygame.draw.line(surf, (58, 64, 76), (w // 2, h // 4), (w // 2 + 9, h // 2), 1)
    return surf


def _obstacle_plant(w, h):
    surf = _make_surface(w, h)
    pot_h = max(14, h // 3)
    pygame.draw.rect(surf, (165, 78, 48), (8, h - pot_h, w - 16, pot_h), border_radius=4)
    pygame.draw.polygon(surf, (48, 156, 88), [(w // 2, 8), (w // 2 - 10, h - pot_h), (w // 2 + 10, h - pot_h)])
    pygame.draw.polygon(surf, (62, 176, 102), [(w // 2 - 8, 16), (8, h - pot_h + 2), (w // 2 - 2, h - pot_h)])
    pygame.draw.polygon(surf, (62, 176, 102), [(w // 2 + 8, 16), (w - 8, h - pot_h + 2), (w // 2 + 2, h - pot_h)])
    pygame.draw.line(surf, (84, 52, 36), (8, h - pot_h), (w - 8, h - pot_h), 1)
    return surf


def _obstacle_chair(w, h):
    surf = _make_surface(w, h)
    pygame.draw.rect(surf, (58, 72, 90), (8, 4, w - 16, h // 3), border_radius=4)
    pygame.draw.rect(surf, (78, 92, 110), (10, 6, w - 20, h // 3 - 4), border_radius=3)
    pygame.draw.rect(surf, (58, 72, 90), (10, h // 2, w - 20, h // 4), border_radius=3)
    pygame.draw.rect(surf, (48, 60, 76), (12, h // 2 + h // 4 - 2, 4, h // 4), border_radius=2)
    pygame.draw.rect(surf, (48, 60, 76), (w - 16, h // 2 + h // 4 - 2, 4, h // 4), border_radius=2)
    return surf


def make_visual_assets(player_w, player_h, dash_h, obstacle_w, obstacle_h, high_obstacle_h, coin_r, powerup_r):
    assets = {}

    assets["player"] = {
        "normal": [
            _cat_frame(player_w, player_h, (24, 26, 30)),
            _cat_frame(player_w, player_h, (36, 38, 44)),
        ],
        "dash": [
            _cat_frame(player_w, dash_h, (30, 32, 36), crouch=True),
            _cat_frame(player_w, dash_h, (44, 46, 52), crouch=True),
        ],
        "shield": [
            _cat_frame(player_w, player_h, (24, 26, 30), shield=True),
            _cat_frame(player_w, player_h, (36, 38, 44), shield=True),
        ],
    }
    assets["obstacles"] = {
        "box": _obstacle_box(obstacle_w, obstacle_h),
        "binbag": _obstacle_binbag(obstacle_w, obstacle_h),
        "plant": _obstacle_plant(obstacle_w, obstacle_h),
        "chair": _obstacle_chair(obstacle_w, high_obstacle_h),
    }

    coin_a = _make_surface(coin_r * 2 + 6, coin_r * 2 + 6)
    coin_b = _make_surface(coin_r * 2 + 6, coin_r * 2 + 6)
    c = coin_r + 3
    pygame.draw.circle(coin_a, (245, 210, 60), (c, c), coin_r)
    pygame.draw.circle(coin_a, (255, 240, 170), (c, c), coin_r, 3)
    pygame.draw.circle(coin_b, (255, 225, 90), (c, c), coin_r)
    pygame.draw.circle(coin_b, (255, 245, 190), (c, c), coin_r, 3)
    assets["coin"] = [coin_a, coin_b]

    pwr_a = _make_surface(powerup_r * 2 + 6, powerup_r * 2 + 6)
    pwr_b = _make_surface(powerup_r * 2 + 6, powerup_r * 2 + 6)
    p = powerup_r + 3
    pygame.draw.circle(pwr_a, (130, 255, 245), (p, p), powerup_r)
    pygame.draw.circle(pwr_a, (225, 255, 255), (p, p), powerup_r, 2)
    pygame.draw.circle(pwr_b, (110, 235, 225), (p, p), powerup_r)
    pygame.draw.circle(pwr_b, (210, 245, 245), (p, p), powerup_r, 2)
    assets["powerup"] = [pwr_a, pwr_b]

    return assets
