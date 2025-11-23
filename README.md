# バイブレーション制御ツール 📳

Android端末でバイブレーションを制御するPWA（Progressive Web App）アプリです。

## 機能

### 基本機能
- **プリセットパターン**: 12種類の振動パターン（短い振動、中程度、長い振動、ダブルタップ、トリプルタップ、パルス、SOS、アラーム、着信音、ハートビート、緊急アラート、通知）
- **カスタム設定**: スライダーで振動時間を自由に調整（10-1000ms）
- **パターンエディタ**: カンマ区切りで独自の振動パターンを作成
- **リピート/ループ機能**: パターンを2-10回または無限ループで繰り返し実行
- **パターン共有**: URLで現在の設定を共有可能

### 新機能 🎉
- **パターンビジュアライザー**: 振動パターンを波形/タイムラインで視覚的に表示
- **パターンライブラリ**:
  - カスタムパターンをlocalStorageに保存
  - パターンに名前を付けて管理
  - 保存済みパターンの一覧表示・実行・編集・削除
- **お気に入り/カスタムプリセット**:
  - お気に入りパターンをプリセットボタンとして表示
  - ドラッグ&ドロップで並び替え可能
  - よく使うパターンに素早くアクセス

### PWA対応
- **ホーム画面に追加**: アプリのように使用可能
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