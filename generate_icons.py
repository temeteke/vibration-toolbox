#!/usr/bin/env python3
from PIL import Image
import os

def convert_svg_to_png(svg_file, png_file, size):
    """SVGファイルをPNGに変換（cairosvgを使用）"""
    try:
        import cairosvg
        cairosvg.svg2png(
            url=svg_file,
            write_to=png_file,
            output_width=size,
            output_height=size
        )
        print(f'Created {png_file} ({size}x{size}) from SVG')
        return True
    except ImportError:
        print('cairosvg not found, trying alternative method...')
        return False

def create_png_from_svg():
    """SVGからPNGアイコンを生成"""
    svg_file = 'icon.svg'

    if not os.path.exists(svg_file):
        print(f'Error: {svg_file} not found!')
        return

    # cairosvgで変換を試行
    success_192 = convert_svg_to_png(svg_file, 'icon-192.png', 192)
    success_512 = convert_svg_to_png(svg_file, 'icon-512.png', 512)

    if success_192 and success_512:
        print('Icons created successfully from SVG!')
    else:
        print('Please install cairosvg: pip install cairosvg')

# アイコンを作成
if __name__ == '__main__':
    create_png_from_svg()
