#!/usr/bin/env python3
from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(size, filename):
    # 背景色（紫のグラデーション風）
    img = Image.new('RGB', (size, size), color='#6366f1')
    draw = ImageDraw.Draw(img)

    # 円形の背景を描画
    margin = size // 10
    draw.ellipse([margin, margin, size - margin, size - margin],
                 fill='#6366f1', outline='#ffffff', width=size // 40)

    # 振動マークを描画（波線のような形）
    center_x = size // 2
    center_y = size // 2
    wave_size = size // 3

    # 3つの波線を描画
    line_width = max(size // 30, 4)

    # 左側の波線
    x1 = center_x - wave_size
    draw.arc([x1 - wave_size // 2, center_y - wave_size,
              x1 + wave_size // 2, center_y + wave_size],
             start=270, end=90, fill='#ffffff', width=line_width)

    # 中央の波線
    draw.arc([center_x - wave_size // 2, center_y - wave_size,
              center_x + wave_size // 2, center_y + wave_size],
             start=270, end=90, fill='#ffffff', width=line_width)

    # 右側の波線
    x2 = center_x + wave_size
    draw.arc([x2 - wave_size // 2, center_y - wave_size,
              x2 + wave_size // 2, center_y + wave_size],
             start=270, end=90, fill='#ffffff', width=line_width)

    # 保存
    img.save(filename, 'PNG')
    print(f'Created {filename} ({size}x{size})')

# アイコンを作成
create_icon(192, 'icon-192.png')
create_icon(512, 'icon-512.png')

print('Icons created successfully!')
