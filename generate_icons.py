#!/usr/bin/env python3
from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(size, filename):
    # グラデーション背景を作成（紫系）
    img = Image.new('RGB', (size, size), color='#6366f1')
    draw = ImageDraw.Draw(img)

    # グラデーション背景（上から下へ）
    for y in range(size):
        # 紫からやや明るい紫へのグラデーション
        r = int(99 + (139 - 99) * y / size)
        g = int(102 + (142 - 102) * y / size)
        b = int(241 + (255 - 241) * y / size)
        draw.line([(0, y), (size, y)], fill=(r, g, b))

    center_x = size // 2
    center_y = size // 2

    # スマートフォンの描画
    phone_width = size // 3
    phone_height = int(phone_width * 2.0)
    phone_x = center_x - phone_width // 2
    phone_y = center_y - phone_height // 2
    corner_radius = size // 20

    # スマートフォンの本体（角丸長方形）
    draw.rounded_rectangle(
        [phone_x, phone_y, phone_x + phone_width, phone_y + phone_height],
        radius=corner_radius,
        fill='#ffffff',
        outline='#e0e0e0',
        width=max(2, size // 100)
    )

    # スマートフォンの画面
    screen_margin = size // 40
    draw.rounded_rectangle(
        [phone_x + screen_margin, phone_y + screen_margin * 2,
         phone_x + phone_width - screen_margin, phone_y + phone_height - screen_margin * 2],
        radius=corner_radius // 2,
        fill='#e8eaf6'
    )

    # スピーカー（上部の小さな楕円）
    speaker_width = phone_width // 4
    speaker_height = size // 60
    draw.ellipse(
        [center_x - speaker_width // 2, phone_y + screen_margin,
         center_x + speaker_width // 2, phone_y + screen_margin + speaker_height],
        fill='#9e9e9e'
    )

    # 振動波を描画（スマートフォンの両側）
    wave_line_width = max(size // 50, 3)

    # 左側の振動波（3本）
    for i in range(3):
        offset = (i + 1) * (size // 12)
        arc_size = size // 8 + i * (size // 20)
        opacity_factor = 255 - i * 60  # 外側ほど薄く

        # 左の弧
        draw.arc(
            [phone_x - offset - arc_size // 2, center_y - arc_size,
             phone_x - offset + arc_size // 2, center_y + arc_size],
            start=270, end=90,
            fill=(255, 255, 255, opacity_factor),
            width=wave_line_width
        )

    # 右側の振動波（3本）
    for i in range(3):
        offset = (i + 1) * (size // 12)
        arc_size = size // 8 + i * (size // 20)
        opacity_factor = 255 - i * 60

        # 右の弧
        draw.arc(
            [phone_x + phone_width + offset - arc_size // 2, center_y - arc_size,
             phone_x + phone_width + offset + arc_size // 2, center_y + arc_size],
            start=90, end=270,
            fill=(255, 255, 255, opacity_factor),
            width=wave_line_width
        )

    # 保存
    img.save(filename, 'PNG')
    print(f'Created {filename} ({size}x{size})')

# アイコンを作成
create_icon(192, 'icon-192.png')
create_icon(512, 'icon-512.png')

print('Icons created successfully!')
