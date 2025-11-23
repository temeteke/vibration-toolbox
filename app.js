// バイブレーションパターン定義
const patterns = {
    short: [100],
    medium: [200],
    long: [500],
    double: [100, 100, 100],
    triple: [100, 100, 100, 100, 100],
    pulse: [100, 50, 100, 50, 100, 50, 100],
    sos: [100, 100, 100, 100, 100, 300, 200, 100, 200, 100, 200, 300, 100, 100, 100],
    alarm: [200, 100, 200, 100, 200, 100, 200],
    ringtone: [500, 200, 150, 200, 150, 200, 500],
    heartbeat: [200, 100, 200, 800],
    emergency: [300, 150, 300, 150, 300, 150, 500],
    notification: [50, 50, 50, 50, 150]
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
const visualizerTimeline = document.querySelector('.visualizer-timeline');
const totalDuration = document.getElementById('total-duration');
const savePatternBtn = document.getElementById('save-pattern');
const savedPatternsContainer = document.getElementById('saved-patterns');
const librarySection = document.getElementById('library-section');
const favoritesSection = document.getElementById('favorites-section');
const favoritesGrid = document.getElementById('favorites-grid');

// リピート関連DOM要素
const repeatEnabled = document.getElementById('repeat-enabled');
const repeatOptions = document.getElementById('repeat-options');
const repeatCount = document.getElementById('repeat-count');
const repeatInterval = document.getElementById('repeat-interval');
const intervalValue = document.getElementById('interval-value');
const repeatStatus = document.getElementById('repeat-status');
const repeatStatusText = document.getElementById('repeat-status-text');

// 共有関連DOM要素
const shareBtn = document.getElementById('share-btn');
const shareStatus = document.getElementById('share-status');

let deferredPrompt;

// リピート状態管理
let repeatState = {
    isRepeating: false,
    currentCount: 0,
    timeoutId: null,
    intervalId: null
};

// 初期化
function init() {
    checkVibrationSupport();
    setupEventListeners();
    setupPWA();
    loadFromURL(); // URLパラメータから設定を読み込み
    updateVisualizer(); // 初期表示
    loadSavedPatterns(); // 保存済みパターンを読み込み
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
            executeVibration(patterns[pattern]);
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
        executeVibration([duration]);
        addVibratingAnimation(customVibrateBtn);
    });

    // パターン振動
    patternVibrateBtn.addEventListener('click', () => {
        const pattern = parsePattern(patternInput.value);
        if (pattern) {
            executeVibration(pattern);
            addVibratingAnimation(patternVibrateBtn);
        } else {
            alert('パターンの形式が正しくありません。カンマ区切りの数字を入力してください。');
        }
    });

    // パターン入力の変更でビジュアライザーを更新
    patternInput.addEventListener('input', () => {
        updateVisualizer();
    });

    // 停止
    stopBtn.addEventListener('click', () => {
        stopVibration();
    });

    // リピート有効/無効トグル
    repeatEnabled.addEventListener('change', (e) => {
        if (e.target.checked) {
            repeatOptions.style.display = 'block';
        } else {
            repeatOptions.style.display = 'none';
            stopRepeat();
        }
    });

    // リピート間隔スライダー
    repeatInterval.addEventListener('input', (e) => {
        intervalValue.textContent = `${e.target.value}ms`;
    });

    // 共有ボタン
    shareBtn.addEventListener('click', async () => {
        const success = await copyShareURL();
        if (success) {
            // 成功メッセージを表示
            shareStatus.style.display = 'flex';
            addVibratingAnimation(shareBtn);

            // 3秒後に非表示
            setTimeout(() => {
                shareStatus.style.display = 'none';
            }, 3000);
        } else {
            alert('URLのコピーに失敗しました。ブラウザがクリップボードAPIをサポートしていない可能性があります。');
        }
    });

    // パターン保存ボタン
    savePatternBtn.addEventListener('click', () => {
        saveCurrentPattern();
    });
}

// バイブレーション実行（リピート対応）
function executeVibration(pattern) {
    // リピートが有効な場合
    if (repeatEnabled.checked) {
        const count = repeatCount.value;
        const interval = parseInt(repeatInterval.value);

        if (count === 'infinite') {
            startInfiniteLoop(pattern, interval);
        } else {
            startRepeat(pattern, parseInt(count), interval);
        }
    } else {
        // 通常の1回実行
        vibrate(pattern);
    }
}

// 基本のバイブレーション実行
function vibrate(pattern) {
    if ('vibrate' in navigator) {
        navigator.vibrate(pattern);
        console.log('Vibration pattern:', pattern);
    }
}

// リピート実行
function startRepeat(pattern, count, interval) {
    stopRepeat(); // 既存のリピートを停止

    repeatState.isRepeating = true;
    repeatState.currentCount = 0;

    // ステータス表示
    updateRepeatStatus(true, `${repeatState.currentCount + 1} / ${count} 回目`);

    // 最初の実行
    vibrate(pattern);
    repeatState.currentCount++;

    // パターンの総時間を計算
    const patternDuration = pattern.reduce((sum, val) => sum + val, 0);

    // 残りを順次実行
    let executed = 1;
    repeatState.intervalId = setInterval(() => {
        if (executed >= count) {
            stopRepeat();
            return;
        }

        vibrate(pattern);
        executed++;
        repeatState.currentCount++;
        updateRepeatStatus(true, `${repeatState.currentCount} / ${count} 回目`);
    }, patternDuration + interval);
}

// 無限ループ実行
function startInfiniteLoop(pattern, interval) {
    stopRepeat(); // 既存のリピートを停止

    repeatState.isRepeating = true;
    repeatState.currentCount = 0;

    // ステータス表示
    updateRepeatStatus(true, `無限ループ実行中 (${repeatState.currentCount + 1} 回目)`);

    // 最初の実行
    vibrate(pattern);
    repeatState.currentCount++;

    // パターンの総時間を計算
    const patternDuration = pattern.reduce((sum, val) => sum + val, 0);

    // 無限ループ
    repeatState.intervalId = setInterval(() => {
        vibrate(pattern);
        repeatState.currentCount++;
        updateRepeatStatus(true, `無限ループ実行中 (${repeatState.currentCount} 回目)`);
    }, patternDuration + interval);
}

// リピート停止
function stopRepeat() {
    if (repeatState.intervalId) {
        clearInterval(repeatState.intervalId);
        repeatState.intervalId = null;
    }
    if (repeatState.timeoutId) {
        clearTimeout(repeatState.timeoutId);
        repeatState.timeoutId = null;
    }

    repeatState.isRepeating = false;
    repeatState.currentCount = 0;
    updateRepeatStatus(false);
}

// リピートステータス更新
function updateRepeatStatus(show, text = '') {
    if (show) {
        repeatStatus.style.display = 'block';
        repeatStatusText.textContent = text;
    } else {
        repeatStatus.style.display = 'none';
    }
}

// バイブレーション停止
function stopVibration() {
    if ('vibrate' in navigator) {
        navigator.vibrate(0);
        console.log('Vibration stopped');
    }
    stopRepeat(); // リピートも停止
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

// URLパラメータから設定を読み込み
function loadFromURL() {
    const urlParams = new URLSearchParams(window.location.search);

    // プリセットパターン
    if (urlParams.has('preset')) {
        const preset = urlParams.get('preset');
        if (patterns[preset]) {
            // プリセットが存在する場合は何もしない（ボタンから実行してもらう）
            console.log('Preset pattern from URL:', preset);
        }
    }

    // カスタムパターン
    if (urlParams.has('pattern')) {
        const pattern = urlParams.get('pattern');
        patternInput.value = pattern;
        console.log('Custom pattern from URL:', pattern);
    }

    // カスタム振動時間
    if (urlParams.has('duration')) {
        const duration = parseInt(urlParams.get('duration'));
        if (!isNaN(duration) && duration >= 10 && duration <= 1000) {
            durationSlider.value = duration;
            durationValue.textContent = `${duration}ms`;
            console.log('Duration from URL:', duration);
        }
    }

    // リピート設定
    if (urlParams.has('enabled') && urlParams.get('enabled') === '1') {
        repeatEnabled.checked = true;
        repeatOptions.style.display = 'block';

        // リピート回数
        if (urlParams.has('repeat')) {
            const repeat = urlParams.get('repeat');
            if (repeat === 'infinite' || (!isNaN(parseInt(repeat)) && parseInt(repeat) >= 2 && parseInt(repeat) <= 10)) {
                repeatCount.value = repeat;
                console.log('Repeat count from URL:', repeat);
            }
        }

        // ループ間隔
        if (urlParams.has('interval')) {
            const interval = parseInt(urlParams.get('interval'));
            if (!isNaN(interval) && interval >= 0 && interval <= 2000) {
                repeatInterval.value = interval;
                intervalValue.textContent = `${interval}ms`;
                console.log('Interval from URL:', interval);
            }
        }
    }

    // 自動実行フラグ（オプション）
    if (urlParams.has('auto') && urlParams.get('auto') === '1') {
        // 少し遅延させてから自動実行
        setTimeout(() => {
            if (urlParams.has('preset')) {
                const preset = urlParams.get('preset');
                if (patterns[preset]) {
                    executeVibration(patterns[preset]);
                }
            } else if (urlParams.has('pattern')) {
                const pattern = parsePattern(patternInput.value);
                if (pattern) {
                    executeVibration(pattern);
                }
            } else if (urlParams.has('duration')) {
                const duration = parseInt(durationSlider.value);
                executeVibration([duration]);
            }
        }, 500);
    }
}

// 現在の設定からURLを生成
function generateShareURL() {
    const baseURL = window.location.origin + window.location.pathname;
    const params = new URLSearchParams();

    // 現在アクティブな設定を判断
    // パターン入力がデフォルトでない場合
    if (patternInput.value && patternInput.value !== '100,50,100,50,200') {
        params.set('pattern', patternInput.value);
    }
    // カスタム振動時間がデフォルトでない場合
    else if (durationSlider.value !== '200') {
        params.set('duration', durationSlider.value);
    }

    // リピート設定
    if (repeatEnabled.checked) {
        params.set('enabled', '1');
        params.set('repeat', repeatCount.value);
        params.set('interval', repeatInterval.value);
    }

    const url = params.toString() ? `${baseURL}?${params.toString()}` : baseURL;
    return url;
}

// URLをクリップボードにコピー
async function copyShareURL() {
    const url = generateShareURL();

    try {
        await navigator.clipboard.writeText(url);
        return true;
    } catch (err) {
        console.error('Failed to copy:', err);
        // フォールバック: 古いブラウザ用
        const textarea = document.createElement('textarea');
        textarea.value = url;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            document.body.removeChild(textarea);
            return true;
        } catch (err2) {
            document.body.removeChild(textarea);
            return false;
        }
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

// パターンライブラリ管理
function loadSavedPatterns() {
    const patterns = getSavedPatterns();
    renderSavedPatterns(patterns);
    renderFavoritePresets(patterns);
}

function getSavedPatterns() {
    const saved = localStorage.getItem('savedPatterns');
    return saved ? JSON.parse(saved) : [];
}

function savePatternsToStorage(patterns) {
    localStorage.setItem('savedPatterns', JSON.stringify(patterns));
}

function saveCurrentPattern() {
    const pattern = parsePattern(patternInput.value);

    if (!pattern || pattern.length === 0) {
        alert('有効なパターンを入力してください。');
        return;
    }

    // パターン名を入力してもらう
    const name = prompt('パターンに名前を付けてください:', '新しいパターン');

    if (!name) {
        return; // キャンセルされた
    }

    const patterns = getSavedPatterns();

    // 新しいパターンを追加
    patterns.push({
        id: Date.now(),
        name: name,
        pattern: patternInput.value,
        favorite: false,
        createdAt: new Date().toISOString()
    });

    savePatternsToStorage(patterns);
    loadSavedPatterns();

    alert('パターンを保存しました！');
    addVibratingAnimation(savePatternBtn);
}

function renderSavedPatterns(patterns) {
    if (patterns.length === 0) {
        librarySection.style.display = 'none';
        return;
    }

    librarySection.style.display = 'block';
    savedPatternsContainer.innerHTML = '';

    // お気に入りを先に、その後は新しい順
    const sorted = patterns.sort((a, b) => {
        if (a.favorite && !b.favorite) return -1;
        if (!a.favorite && b.favorite) return 1;
        return b.id - a.id;
    });

    sorted.forEach(item => {
        const div = document.createElement('div');
        div.className = 'saved-pattern-item';
        div.innerHTML = `
            <div class="pattern-header">
                <span class="pattern-name">${escapeHtml(item.name)}</span>
                <button class="pattern-favorite" data-id="${item.id}">
                    ${item.favorite ? '⭐' : '☆'}
                </button>
            </div>
            <div class="pattern-value">${escapeHtml(item.pattern)}</div>
            <div class="pattern-buttons">
                <button class="pattern-btn play" data-id="${item.id}">▶️ 実行</button>
                <button class="pattern-btn edit" data-id="${item.id}">✏️ 編集</button>
                <button class="pattern-btn delete" data-id="${item.id}">🗑️ 削除</button>
            </div>
        `;
        savedPatternsContainer.appendChild(div);
    });

    // イベントリスナーを設定
    setupPatternListeners();
}

function setupPatternListeners() {
    // お気に入りトグル
    document.querySelectorAll('.pattern-favorite').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.currentTarget.dataset.id);
            toggleFavorite(id);
        });
    });

    // 実行ボタン
    document.querySelectorAll('.pattern-btn.play').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.currentTarget.dataset.id);
            playPattern(id);
        });
    });

    // 編集ボタン
    document.querySelectorAll('.pattern-btn.edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.currentTarget.dataset.id);
            editPattern(id);
        });
    });

    // 削除ボタン
    document.querySelectorAll('.pattern-btn.delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.currentTarget.dataset.id);
            deletePattern(id);
        });
    });
}

function toggleFavorite(id) {
    const patterns = getSavedPatterns();
    const pattern = patterns.find(p => p.id === id);

    if (pattern) {
        pattern.favorite = !pattern.favorite;
        savePatternsToStorage(patterns);
        loadSavedPatterns();
    }
}

function playPattern(id) {
    const patterns = getSavedPatterns();
    const pattern = patterns.find(p => p.id === id);

    if (pattern) {
        const vibrationPattern = parsePattern(pattern.pattern);
        if (vibrationPattern) {
            executeVibration(vibrationPattern);
        }
    }
}

function editPattern(id) {
    const patterns = getSavedPatterns();
    const pattern = patterns.find(p => p.id === id);

    if (pattern) {
        const newName = prompt('パターン名を編集:', pattern.name);
        if (newName && newName !== pattern.name) {
            pattern.name = newName;
            savePatternsToStorage(patterns);
            loadSavedPatterns();
        }

        // パターンをエディタに読み込む
        patternInput.value = pattern.pattern;
        updateVisualizer();

        // エディタまでスクロール
        document.querySelector('#pattern-input').scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function deletePattern(id) {
    if (!confirm('このパターンを削除してもよろしいですか？')) {
        return;
    }

    const patterns = getSavedPatterns();
    const filtered = patterns.filter(p => p.id !== id);

    savePatternsToStorage(filtered);
    loadSavedPatterns();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// お気に入りプリセット表示
function renderFavoritePresets(patterns) {
    const favorites = patterns
        .filter(p => p.favorite)
        .sort((a, b) => (a.favoriteOrder || 0) - (b.favoriteOrder || 0));

    if (favorites.length === 0) {
        favoritesSection.style.display = 'none';
        return;
    }

    favoritesSection.style.display = 'block';
    favoritesGrid.innerHTML = '';

    favorites.forEach((item, index) => {
        const btn = document.createElement('button');
        btn.className = 'vibrate-btn custom-preset';
        btn.draggable = true;
        btn.dataset.id = item.id;
        btn.dataset.index = index;

        btn.innerHTML = `
            <span class="btn-icon">⭐</span>
            <span class="btn-text">${escapeHtml(item.name)}</span>
            <span class="btn-desc">${getTotalDuration(item.pattern)}ms</span>
        `;

        // クリックイベント
        btn.addEventListener('click', () => {
            const vibrationPattern = parsePattern(item.pattern);
            if (vibrationPattern) {
                executeVibration(vibrationPattern);
                addVibratingAnimation(btn);
            }
        });

        // ドラッグ&ドロップイベント
        btn.addEventListener('dragstart', handleDragStart);
        btn.addEventListener('dragover', handleDragOver);
        btn.addEventListener('drop', handleDrop);
        btn.addEventListener('dragend', handleDragEnd);

        favoritesGrid.appendChild(btn);
    });
}

function getTotalDuration(patternStr) {
    const pattern = parsePattern(patternStr);
    if (!pattern) return 0;
    return pattern.reduce((sum, val) => sum + val, 0);
}

// ドラッグ&ドロップ処理
let draggedElement = null;

function handleDragStart(e) {
    draggedElement = e.currentTarget;
    e.currentTarget.style.opacity = '0.5';
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }

    if (draggedElement !== e.currentTarget) {
        const draggedId = parseInt(draggedElement.dataset.id);
        const targetId = parseInt(e.currentTarget.dataset.id);

        reorderFavorites(draggedId, targetId);
    }

    return false;
}

function handleDragEnd(e) {
    e.currentTarget.style.opacity = '1';
}

function reorderFavorites(draggedId, targetId) {
    const patterns = getSavedPatterns();
    const favorites = patterns.filter(p => p.favorite);

    const draggedIndex = favorites.findIndex(p => p.id === draggedId);
    const targetIndex = favorites.findIndex(p => p.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    // 配列内で要素を移動
    const [removed] = favorites.splice(draggedIndex, 1);
    favorites.splice(targetIndex, 0, removed);

    // お気に入りの順序を更新するためにorderフィールドを追加
    favorites.forEach((fav, index) => {
        const pattern = patterns.find(p => p.id === fav.id);
        if (pattern) {
            pattern.favoriteOrder = index;
        }
    });

    savePatternsToStorage(patterns);
    loadSavedPatterns();
}

// パターンビジュアライザー更新
function updateVisualizer() {
    const pattern = parsePattern(patternInput.value);

    if (!pattern || pattern.length === 0) {
        visualizerTimeline.innerHTML = '<div style="color: var(--text-secondary); font-size: 0.9rem; width: 100%; text-align: center;">パターンを入力してください</div>';
        totalDuration.textContent = '総時間: 0ms';
        return;
    }

    // タイムラインをクリア
    visualizerTimeline.innerHTML = '';

    // 総時間を計算
    const total = pattern.reduce((sum, val) => sum + val, 0);
    totalDuration.textContent = `総時間: ${total}ms`;

    // 最大値を見つけてスケーリング
    const maxDuration = Math.max(...pattern);
    const minBarWidth = 20; // 最小幅（ピクセル）
    const maxBarWidth = 100; // 最大幅（ピクセル）

    // パターンの各要素をバーとして表示
    pattern.forEach((duration, index) => {
        const isVibrate = index % 2 === 0; // 偶数インデックスは振動
        const bar = document.createElement('div');
        bar.className = `visualizer-bar ${isVibrate ? 'vibrate' : 'pause'}`;

        // 幅を計算（時間に比例）
        const width = minBarWidth + (duration / maxDuration) * (maxBarWidth - minBarWidth);
        bar.style.width = `${width}px`;

        // 時間を表示（50ms以上の場合のみ）
        if (duration >= 50) {
            bar.textContent = `${duration}`;
        }

        // ツールチップ
        bar.title = `${isVibrate ? '振動' : '休止'}: ${duration}ms`;

        visualizerTimeline.appendChild(bar);
    });
}
