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


def make_visual_assets(player_w, player_h, dash_h, obstacle_w, obstacle_h, high_obstacle_h, coin_r, powerup_r):
    assets = {}

    assets["player"] = {
        "normal": [
            _player_frame(player_w, player_h, (240, 220, 90), stripe=(255, 245, 170)),
            _player_frame(player_w, player_h, (235, 210, 80), stripe=(250, 235, 150)),
        ],
        "dash": [
            _player_frame(player_w, dash_h, (255, 195, 80), stripe=(255, 230, 130), crouch=True),
            _player_frame(player_w, dash_h, (245, 180, 70), stripe=(255, 220, 120), crouch=True),
        ],
        "shield": [
            _player_frame(player_w, player_h, (120, 235, 255), stripe=(200, 250, 255)),
            _player_frame(player_w, player_h, (105, 220, 245), stripe=(180, 245, 255)),
        ],
    }

    low = _make_surface(obstacle_w, obstacle_h)
    pygame.draw.rect(low, (190, 60, 60), (0, 0, obstacle_w, obstacle_h), border_radius=6)
    pygame.draw.rect(low, (230, 120, 120), (6, 6, obstacle_w - 12, 10), border_radius=4)
    assets["obstacle_low"] = low

    high = _make_surface(obstacle_w, high_obstacle_h)
    pygame.draw.rect(high, (90, 170, 220), (0, 0, obstacle_w, high_obstacle_h), border_radius=6)
    pygame.draw.rect(high, (150, 210, 245), (6, 6, obstacle_w - 12, 10), border_radius=4)
    assets["obstacle_high"] = high

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
