# バイブレーション制御ツール 📳

Android端末でバイブレーションを制御するPWA（Progressive Web App）アプリです。

## 機能

- **プリセットパターン**: 短い振動、中程度、長い振動、ダブルタップ、トリプルタップ、パルス、SOS、アラームなど
- **カスタム設定**: スライダーで振動時間を自由に調整
- **パターンエディタ**: カンマ区切りで独自の振動パターンを作成
- **PWA対応**: ホーム画面に追加してアプリのように使用可能
- **オフライン動作**: インストール後はオフラインでも利用可能

## デモ

GitHub Pagesでホストされています: https://temeteke.github.io/vibration-toolbox/

## 使い方

1. Android端末でアクセス
2. ブラウザのメニューから「ホーム画面に追加」を選択してインストール
3. ボタンをタップしてバイブレーションを体験

## 技術スタック

- HTML5 + CSS3 + JavaScript
- Vibration API
- Service Worker
- Web App Manifest
- PWA

## ローカル開発

```bash
# リポジトリをクローン
git clone https://github.com/temeteke/vibration-toolbox.git
cd vibration-toolbox

# シンプルなHTTPサーバーを起動
python3 -m http.server 8000

# ブラウザでアクセス
open http://localhost:8000
```

## ブラウザサポート

- Android Chrome（推奨）
- Android Firefox
- その他のVibration APIをサポートするブラウザ

注: iOSはVibration APIをサポートしていないため、動作しません。

## ライセンス

MIT License