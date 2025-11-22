// バイブレーションパターン定義
const patterns = {
    short: [100],
    medium: [200],
    long: [500],
    double: [100, 100, 100],
    triple: [100, 100, 100, 100, 100],
    pulse: [100, 50, 100, 50, 100, 50, 100],
    sos: [100, 100, 100, 100, 100, 300, 200, 100, 200, 100, 200, 300, 100, 100, 100],
    alarm: [200, 100, 200, 100, 200, 100, 200]
};

// DOM要素
const statusCard = document.getElementById('support-status');
const statusText = document.getElementById('status-text');
const durationSlider = document.getElementById('duration');
const durationValue = document.getElementById('duration-value');
const customVibrateBtn = document.getElementById('custom-vibrate');
const patternInput = document.getElementById('pattern-input');
const patternVibrateBtn = document.getElementById('pattern-vibrate');
const stopBtn = document.getElementById('stop-vibrate');
const installContainer = document.getElementById('install-container');
const installBtn = document.getElementById('install-btn');

let deferredPrompt;

// 初期化
function init() {
    checkVibrationSupport();
    setupEventListeners();
    setupPWA();
}

// バイブレーションサポート確認
function checkVibrationSupport() {
    if ('vibrate' in navigator) {
        statusCard.classList.add('supported');
        statusCard.querySelector('.status-icon').textContent = '✅';
        statusText.textContent = 'バイブレーション機能が利用可能です';
    } else {
        statusCard.classList.add('not-supported');
        statusCard.querySelector('.status-icon').textContent = '❌';
        statusText.textContent = 'このデバイスではバイブレーション機能が利用できません';

        // ボタンを無効化
        disableAllButtons();
    }
}

// すべてのボタンを無効化
function disableAllButtons() {
    document.querySelectorAll('.vibrate-btn').forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = '0.5';
        btn.style.cursor = 'not-allowed';
    });
    stopBtn.disabled = true;
    stopBtn.style.opacity = '0.5';
    stopBtn.style.cursor = 'not-allowed';
}

// イベントリスナー設定
function setupEventListeners() {
    // プリセットボタン
    document.querySelectorAll('.vibrate-btn[data-pattern]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const pattern = e.currentTarget.dataset.pattern;
            vibrate(patterns[pattern]);
            addVibratingAnimation(e.currentTarget);
        });
    });

    // スライダー
    durationSlider.addEventListener('input', (e) => {
        durationValue.textContent = `${e.target.value}ms`;
    });

    // カスタム振動
    customVibrateBtn.addEventListener('click', () => {
        const duration = parseInt(durationSlider.value);
        vibrate([duration]);
        addVibratingAnimation(customVibrateBtn);
    });

    // パターン振動
    patternVibrateBtn.addEventListener('click', () => {
        const pattern = parsePattern(patternInput.value);
        if (pattern) {
            vibrate(pattern);
            addVibratingAnimation(patternVibrateBtn);
        } else {
            alert('パターンの形式が正しくありません。カンマ区切りの数字を入力してください。');
        }
    });

    // 停止
    stopBtn.addEventListener('click', () => {
        stopVibration();
    });
}

// バイブレーション実行
function vibrate(pattern) {
    if ('vibrate' in navigator) {
        navigator.vibrate(pattern);
        console.log('Vibration pattern:', pattern);
    }
}

// バイブレーション停止
function stopVibration() {
    if ('vibrate' in navigator) {
        navigator.vibrate(0);
        console.log('Vibration stopped');
    }
}

// パターン文字列をパース
function parsePattern(patternStr) {
    try {
        const numbers = patternStr.split(',').map(s => parseInt(s.trim()));
        if (numbers.every(n => !isNaN(n) && n >= 0)) {
            return numbers;
        }
        return null;
    } catch (e) {
        return null;
    }
}

// アニメーション追加
function addVibratingAnimation(element) {
    element.classList.add('vibrating');
    setTimeout(() => {
        element.classList.remove('vibrating');
    }, 300);
}

// PWA設定
function setupPWA() {
    // Service Worker登録
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(registration => {
                console.log('Service Worker registered:', registration);
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    }

    // インストールプロンプト
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        installContainer.style.display = 'block';
    });

    // インストールボタン
    installBtn.addEventListener('click', async () => {
        if (!deferredPrompt) {
            return;
        }

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        console.log(`User response to the install prompt: ${outcome}`);

        deferredPrompt = null;
        installContainer.style.display = 'none';
    });

    // インストール完了時
    window.addEventListener('appinstalled', () => {
        console.log('PWA was installed');
        installContainer.style.display = 'none';
    });

    // スタンドアロンモードで起動したかチェック
    if (window.matchMedia('(display-mode: standalone)').matches) {
        console.log('Running in standalone mode');
    }
}

// アプリ起動時の初期化
document.addEventListener('DOMContentLoaded', init);

// オンライン/オフライン状態の監視
window.addEventListener('online', () => {
    console.log('App is online');
});

window.addEventListener('offline', () => {
    console.log('App is offline');
});
