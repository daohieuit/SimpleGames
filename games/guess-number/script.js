/**
 * Guess Number - P2P Logic
 * Following SaaS-Brutalist design principles
 * 100% Identical structure to Guess Word
 */

const state = {
    myName: localStorage.getItem('name') || '',
    opponentName: '',
    peer: null,
    conn: null,
    isHost: false,
    roomId: '',
    currentPhase: 'home',
    minRange: 0,
    maxRange: 100,
    timeLimit: 15,
    mySecret: null,
    opponentSecret: null,
    timeLeft: 0,
    timerInterval: null,
    isMyTurn: false,
    gameActive: false,
    language: localStorage.getItem('language') || 'vi',
    theme: localStorage.getItem('theme') || 'light'
};

// Audio Elements
const correctSound = new Audio('../../assets/mp3/correct.mp3');
const wrongSound = new Audio('../../assets/mp3/wrong.mp3');

// DOM Elements
const phases = {
    home: document.getElementById('home-phase'),
    lobby: document.getElementById('lobby-phase'),
    battle: document.getElementById('battle-phase'),
    gameOver: document.getElementById('game-over-phase')
};

const nameInput = document.getElementById('name-input');
const minRangeInput = document.getElementById('min-range-input');
const maxRangeInput = document.getElementById('max-range-input');
const timeLimitInput = document.getElementById('time-limit-input');
const customRoomInput = document.getElementById('custom-room-input');
const roomCodeInput = document.getElementById('room-code-input');
const createRoomBtn = document.getElementById('create-room-btn');
const joinRoomBtn = document.getElementById('join-room-btn');
const displayRoomCode = document.getElementById('display-room-code');
const secretNumberInput = document.getElementById('secret-number-input');
const submitWordsBtn = document.getElementById('submit-words-btn');
const turnIndicator = document.getElementById('turn-indicator');
const timerDisplay = document.getElementById('timer-display');
const guessInput = document.getElementById('guess-input');
const guessBtn = document.getElementById('guess-btn');
const winnerText = document.getElementById('winner-text');
const secretRevealText = document.getElementById('secret-reveal-text');
const playAgainBtn = document.getElementById('play-again-btn');
const themeToggle = document.getElementById('theme-toggle');
const langToggle = document.getElementById('lang-toggle');
const copyLinkBtn = document.getElementById('copy-link-btn');

// Check for room code in URL on page load
window.addEventListener('load', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomParam = urlParams.get('room');
    if (roomParam) {
        document.getElementById('room-code-input').value = roomParam;
    }
});

// Translations
const translations = {
    en: {
        welcome: "Welcome to Guess Number",
        nameLabel: "Your Name:",
        minLabel: "Min:",
        maxLabel: "Max:",
        timeLabel: "Time Limit (s):",
        roomLabel: "Room ID:",
        create: "Create Room",
        join: "Join Room",
        waitingOpp: "Waiting for Opponent...",
        roomIdLabel: "Room ID:",
        submitTitle: "Set Your Number",
        rangeHint: (min, max) => `Choose a number between ${min} and ${max}.`,
        ready: "Ready!",
        yourTurn: "Your Turn!",
        oppTurn: "Opponent's Turn...",
        higher: "Higher",
        lower: "Lower",
        waitingGuess: "Waiting for guess",
        win: "You Won! 🎉",
        lose: "You Lost...",
        reveal: (num) => `The secret number was: ${num}`,
        invalidRange: "Number must be within range!",
        numRequired: "Please enter a number!",
        timeout: "Time's up!",
        playAgain: "Play Again",
        opponent: "Opponent",
        you: "You",
        secretLabel: "Secret Number:",
        copyLink: "Copy Link",
        linkCopied: "Link copied!"
    },
    vi: {
        welcome: "Chào mừng đến với Đoán Số",
        nameLabel: "Tên của bạn:",
        minLabel: "Min:",
        maxLabel: "Max:",
        timeLabel: "Thời gian (giây):",
        roomLabel: "Mã phòng:",
        create: "Tạo Phòng",
        join: "Vào Phòng",
        waitingOpp: "Đang đợi đối thủ...",
        roomIdLabel: "Mã phòng:",
        submitTitle: "Nhập số của bạn",
        rangeHint: (min, max) => `Chọn một số từ ${min} đến ${max}.`,
        ready: "Sẵn sàng!",
        yourTurn: "Lượt của bạn!",
        oppTurn: "Lượt đối thủ...",
        higher: "Cao hơn",
        lower: "Thấp hơn",
        waitingGuess: "Đang đợi đoán",
        win: "Bạn Thắng! 🎉",
        lose: "Bạn Thua...",
        reveal: (num) => `Số bí mật là: ${num}`,
        invalidRange: "Số phải nằm trong khoảng cho phép!",
        numRequired: "Vui lòng nhập số!",
        timeout: "Hết giờ!",
        playAgain: "Chơi lại",
        opponent: "Đối thủ",
        you: "Bạn",
        secretLabel: "Số bí mật:",
        copyLink: "Copy Link",
        linkCopied: "Link copied!"
    }
};

// UI Functions
function showPhase(phaseName) {
    state.currentPhase = phaseName;
    Object.keys(phases).forEach(p => {
        phases[p].classList.toggle('active', p === phaseName);
    });
}

function updateLanguageUI() {
    const t = translations[state.language];
    document.getElementById('welcome-text').textContent = t.welcome;
    document.getElementById('label-name').textContent = t.nameLabel;
    document.getElementById('label-min-range').textContent = t.minLabel;
    document.getElementById('label-max-range').textContent = t.maxLabel;
    document.getElementById('label-time-limit').textContent = t.timeLabel;
    document.getElementById('label-custom-room').textContent = t.roomLabel;
    createRoomBtn.textContent = t.create;
    joinRoomBtn.textContent = t.join;
    document.getElementById('lobby-status').textContent = t.waitingOpp;
    document.getElementById('room-id-label').firstChild.textContent = t.roomIdLabel + " ";
    document.getElementById('submit-words-title').textContent = t.submitTitle;
    document.getElementById('range-hint').textContent = t.rangeHint(state.minRange, state.maxRange);
    submitWordsBtn.textContent = t.ready;
    playAgainBtn.textContent = t.playAgain;
    if (copyLinkBtn) copyLinkBtn.textContent = t.copyLink;

    document.querySelector('.opponent-area h3').textContent = t.opponent;
    document.querySelector('.my-area h3').textContent = t.you;
    if (state.mySecret !== null) {
        document.getElementById('my-secret-display').firstChild.textContent = t.secretLabel + " ";
    }
    
    langToggle.textContent = state.language === 'en' ? 'VI' : 'US';
    roomCodeInput.placeholder = state.language === 'en' ? "Enter Room ID" : "Nhập mã phòng";
}

function updateThemeUI() {
    const isDark = state.theme === 'dark';
    document.documentElement.classList.toggle('dark-mode', isDark);
    themeToggle.textContent = isDark ? '☀️' : '🌙';
}

function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.toggle('error', isError);
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function triggerFlash() {
    const flash = document.getElementById('flash-overlay');
    flash.classList.add('active');
    setTimeout(() => flash.classList.remove('active'), 800);
}

// Peer Logic
function initPeer() {
    const peerId = state.isHost ? ('guessnumber-v1-' + state.roomId || undefined) : undefined;
    state.peer = new Peer(peerId, { debug: 2 });

    state.peer.on('open', (id) => {
        // Store the actual room code (stripping our prefix if host)
        const roomCode = state.isHost ? state.roomId : id;
        state.roomId = roomCode;
        displayRoomCode.textContent = roomCode;
        
        if (state.isHost) {
            showPhase('lobby');
            document.getElementById('room-info').style.display = 'flex';
        } else {
            connectToHost('guessnumber-v1-' + roomCodeInput.value.trim());
        }
    });

    state.peer.on('connection', (conn) => {
        if (state.isHost) {
            state.conn = conn;
            setupConnection();
        }
    });

    state.peer.on('error', (err) => {
        console.error(err);
        showToast("Room ID busy or Connection error!", true);
        showPhase('home');
    });
}

function connectToHost(hostId) {
    state.conn = state.peer.connect(hostId);
    setupConnection();
    showPhase('lobby');
}

function setupConnection() {
    state.conn.on('open', () => {
        if (state.isHost) {
            state.conn.send({
                type: 'init-game',
                config: { min: state.minRange, max: state.maxRange, time: state.timeLimit, hostName: state.myName }
            });
        } else {
            state.conn.send({ type: 'guest-name', name: state.myName });
        }
        
        document.getElementById('room-info').style.display = 'none';
        document.getElementById('word-submission').style.display = 'block';
        document.getElementById('lobby-status').style.display = 'none';
        document.getElementById('hint-min').textContent = state.minRange;
        document.getElementById('hint-max').textContent = state.maxRange;
    });

    state.conn.on('data', (data) => {
        switch (data.type) {
            case 'init-game':
                state.minRange = data.config.min;
                state.maxRange = data.config.max;
                state.timeLimit = data.config.time;
                state.opponentName = data.config.hostName;
                document.getElementById('hint-min').textContent = state.minRange;
                document.getElementById('hint-max').textContent = state.maxRange;
                updateLanguageUI();
                break;
            case 'guest-name':
                state.opponentName = data.name;
                break;
            case 'ready':
                state.opponentSecret = data.secret;
                checkStartBattle();
                break;
            case 'start-battle':
                startBattle(data.firstTurnId);
                break;
            case 'guess':
                handleIncomingGuess(data.value);
                break;
            case 'hint':
                handleIncomingHint(data.hint, data.value);
                break;
            case 'game-over':
                endGame(data.winner === state.peer.id, data.secret);
                break;
        }
    });
}

// Game Logic
function checkStartBattle() {
    if (state.mySecret !== null && state.opponentSecret !== null) {
        if (state.isHost) {
            const firstTurnId = Math.random() < 0.5 ? state.peer.id : state.conn.peer;
            state.conn.send({ type: 'start-battle', firstTurnId });
            startBattle(firstTurnId);
        }
    }
}

function startBattle(firstTurnId) {
    showPhase('battle');
    state.gameActive = true;
    state.isMyTurn = (firstTurnId === state.peer.id);
    document.getElementById('displayed-my-secret').textContent = state.mySecret;
    updateTurnUI();
}

function updateTurnUI() {
    const t = translations[state.language];
    turnIndicator.textContent = state.isMyTurn ? t.yourTurn : t.oppTurn;
    document.querySelector('.guess-input-container').style.display = state.isMyTurn ? 'flex' : 'none';
    timerDisplay.classList.toggle('visible', true);
    timerDisplay.classList.toggle('my-turn', state.isMyTurn);
    
    startTimer();
}

function startTimer() {
    clearInterval(state.timerInterval);
    state.timeLeft = state.timeLimit;
    updateTimerDisplay();
    
    state.timerInterval = setInterval(() => {
        state.timeLeft--;
        updateTimerDisplay();
        if (state.timeLeft <= 0) {
            clearInterval(state.timerInterval);
            if (state.isMyTurn) handleMyTimeout();
        }
    }, 1000);
}

function updateTimerDisplay() {
    timerDisplay.textContent = state.timeLeft;
}

function handleMyTimeout() {
    showToast(translations[state.language].timeout, true);
    state.isMyTurn = false;
    state.conn.send({ type: 'guess', value: null });
    updateTurnUI();
}

function handleGuess() {
    if (!state.isMyTurn || !state.gameActive) return;
    const value = guessInput.value.trim();
    if (value === "") return showToast(translations[state.language].numRequired, true);
    const num = parseInt(value, 10);
    state.conn.send({ type: 'guess', value: num });
    guessInput.value = '';
    state.isMyTurn = false;
    updateTurnUI();
}

function handleIncomingGuess(value) {
    if (value === null) {
        state.isMyTurn = true;
        updateTurnUI();
        return;
    }
    const guess = parseInt(value, 10);
    const secret = parseInt(state.mySecret, 10);
    
    let hint = '';
    if (guess === secret) {
        hint = 'correct';
        correctSound.play().catch(e => console.warn("Sound play deferred"));
        state.conn.send({ type: 'hint', hint: 'correct', value: guess });
        endGame(false, state.opponentSecret);
        state.conn.send({ type: 'game-over', winner: state.conn.peer, secret: state.mySecret });
    } else {
        hint = guess < secret ? 'higher' : 'lower';
        wrongSound.play().catch(e => console.warn("Sound play deferred"));
        state.conn.send({ type: 'hint', hint, value: guess });
        state.isMyTurn = true;
        updateTurnUI();
    }
    updateHintUI(hint, guess, false);
}

function handleIncomingHint(hint, value) {
    if (hint === 'correct') {
        correctSound.play().catch(e => console.warn("Sound play deferred"));
        endGame(true, state.opponentSecret);
    } else {
        wrongSound.play().catch(e => console.warn("Sound play deferred"));
        updateHintUI(hint, value, true);
        state.isMyTurn = false;
        updateTurnUI();
    }
}

function updateHintUI(hint, value, isMyGuess) {
    const container = isMyGuess ? document.getElementById('opponent-history') : document.getElementById('my-history');
    triggerFlash();

    const guessEl = document.createElement('div');
    guessEl.className = 'word-display';
    
    const arrow = hint === 'higher' ? '↑' : (hint === 'lower' ? '↓' : '✓');
    const color = hint === 'higher' ? 'var(--success-color)' : (hint === 'lower' ? 'var(--error-color)' : 'var(--success-color)');
    
    guessEl.innerHTML = `
        <span style="flex: 1; text-align: left; font-size: 1rem; color: var(--text-secondary);">${value}</span>
        <span style="color: ${color}; font-weight: 900; font-size: 2.5rem; line-height: 1;">${arrow}</span>
    `;
    
    container.insertBefore(guessEl, container.firstChild);
}

function endGame(isWin, secret) {
    state.gameActive = false;
    clearInterval(state.timerInterval);
    timerDisplay.classList.remove('visible');
    const t = translations[state.language];
    showPhase('gameOver');
    winnerText.textContent = isWin ? t.win : t.lose;
    secretRevealText.textContent = t.reveal(secret);
}

// Event Listeners
createRoomBtn.onclick = () => {
    state.myName = nameInput.value.trim() || "Host";
    localStorage.setItem('name', state.myName);
    state.minRange = parseInt(minRangeInput.value, 10);
    state.maxRange = parseInt(maxRangeInput.value, 10);
    state.timeLimit = parseInt(timeLimitInput.value, 10);
    state.roomId = customRoomInput.value.trim();
    state.isHost = true;
    initPeer();
};

joinRoomBtn.onclick = () => {
    state.myName = nameInput.value.trim() || "Guest";
    localStorage.setItem('name', state.myName);
    state.isHost = false;
    initPeer();
};

submitWordsBtn.onclick = () => {
    const val = secretNumberInput.value.trim();
    if (val === "") return showToast(translations[state.language].numRequired, true);
    const num = parseInt(val, 10);
    if (num < state.minRange || num > state.maxRange) return showToast(translations[state.language].invalidRange, true);
    state.mySecret = num;
    submitWordsBtn.disabled = true;
    submitWordsBtn.textContent = "...";
    state.conn.send({ type: 'ready', secret: num });
    checkStartBattle();
};

guessBtn.onclick = handleGuess;
guessInput.onkeypress = (e) => { if (e.key === 'Enter') handleGuess(); };
playAgainBtn.onclick = () => location.reload();
themeToggle.onclick = () => {
    state.theme = (state.theme === 'light') ? 'dark' : 'light';
    localStorage.setItem('theme', state.theme);
    updateThemeUI();
};
langToggle.onclick = () => {
    state.language = state.language === 'en' ? 'vi' : 'en';
    localStorage.setItem('language', state.language);
    updateLanguageUI();
};

// Copy room link functionality
copyLinkBtn.onclick = async () => {
    const t = translations[state.language];
    const baseUrl = window.location.origin + window.location.pathname;
    const shareUrl = `${baseUrl}?room=${state.roomId}`;

    try {
        await navigator.clipboard.writeText(shareUrl);
        const originalText = copyLinkBtn.textContent;
        copyLinkBtn.textContent = t.linkCopied;
        setTimeout(() => {
            copyLinkBtn.textContent = originalText;
        }, 2000);
    } catch (err) {
        console.error('Failed to copy:', err);
        showToast(t.linkCopied, true);
    }
};

document.getElementById('web-logo').onclick = () => { window.location.href = '../../index.html'; };

// Init
state.theme = localStorage.getItem('theme') || 'light';
updateThemeUI();
updateLanguageUI();
if (state.myName) nameInput.value = state.myName;
