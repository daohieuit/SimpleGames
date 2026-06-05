/**
 * Guess Number - P2P Logic
 * Following SaaS-Brutalist design principles
 * 100% Identical structure to Guess Word
 */

const state = {
    myName: '',
    opponentName: '',
    peer: null,
    conn: null,
    isHost: false,
    roomId: '',
    currentPhase: 'home',
    isConnected: false,
    minRange: 0,
    maxRange: 100,
    timeLimit: 15,
    mySecret: null,
    opponentSecret: null,
    timeLeft: 0,
    timerInterval: null,
    isMyTurn: false,
    gameActive: false,
    language: localStorage.getItem('language') || 'en',
    theme: localStorage.getItem('theme') || 'light',
    isReconnecting: false,
    reconnectTimer: null,
    reconnectInterval: null
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

const lobbyStatus = document.getElementById('lobby-status');
const roomInfo = document.getElementById('room-info');
const wordSubmission = document.getElementById('word-submission');
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
const shareRoomBtn = document.getElementById('share-room-btn');

function updateWelcomeText(roomCode) {
    const welcomeText = document.getElementById('welcome-text');
    if (state.language === 'en') {
        welcomeText.textContent = `Join Room: ${roomCode}`;
    } else {
        welcomeText.textContent = `Vào Phòng: ${roomCode}`;
    }
}

// Check for room code in URL on page load
window.addEventListener('load', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomParam = urlParams.get('room');
    if (roomParam) {
        document.getElementById('room-code-input').value = roomParam;
        
        // Hide config and show join mode only
        document.querySelectorAll('.host-config').forEach(el => el.style.display = 'none');
        const createBtn = document.getElementById('create-room-btn');
        if (createBtn) createBtn.style.display = 'none';
        const divider = document.querySelector('.divider');
        if (divider) divider.style.display = 'none';
        const roomInput = document.getElementById('room-code-input');
        if (roomInput) roomInput.style.display = 'none';
        const roomLabel = document.querySelector('.join-input label');
        if (roomLabel) roomLabel.style.display = 'none';
        
        // Make the join button primary and look brutalist
        const joinBtn = document.getElementById('join-room-btn');
        if (joinBtn) {
            joinBtn.classList.remove('secondary');
            joinBtn.classList.add('primary');
        }
        
        updateWelcomeText(roomParam);
    }
});

// Translations
const translations = {
    en: {
        title: "Guess Number",
        welcome: "Welcome to Guess Number",
        nameLabel: "Your Name:",
        namePlaceholder: "Enter your name",
        minLabel: "Min:",
        maxLabel: "Max:",
        timeLabel: "Time Limit (s):",
        roomLabel: "Room ID:",
        create: "Create Room",
        join: "Join Room",
        waitingOpp: "Waiting for Opponent...",
        oppConnected: "Opponent Connected!",
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
        linkCopied: "Link copied!",
        shareVia: "Send Via",
        shareTitle: "Simple Games - Guess Number",
        shareText: (code) => `Play Guess Number with me! Room ID: ${code}`,
        hostBadge: "Host",
        guestBadge: "Guest",
        waitingStatus: "Waiting...",
        readyStatus: "Ready",
        defaultHost: "Player #1",
        defaultGuest: "Player #2"
    },
    vi: {
        title: "Đoán Số",
        welcome: "Chào mừng đến với Đoán Số",
        nameLabel: "Tên của bạn:",
        namePlaceholder: "Nhập tên của bạn",
        minLabel: "Min:",
        maxLabel: "Max:",
        timeLabel: "Thời gian (giây):",
        roomLabel: "Mã phòng:",
        create: "Tạo Phòng",
        join: "Vào Phòng",
        waitingOpp: "Đang đợi đối thủ...",
        oppConnected: "Đối thủ đã kết nối!",
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
        linkCopied: "Link copied!",
        shareVia: "Gửi qua",
        shareTitle: "Simple Games - Đoán Số",
        shareText: (code) => `Chơi Đoán Số cùng tôi nhé! Mã phòng: ${code}`,
        hostBadge: "Host",
        guestBadge: "Khách",
        waitingStatus: "Đang đợi...",
        readyStatus: "Sẵn sàng",
        defaultHost: "Người chơi #1",
        defaultGuest: "Người chơi #2"
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
    document.documentElement.lang = state.language;
    document.querySelector('h1').textContent = t.title;
    // Check if roomParam exists to show dynamic welcome text, otherwise default
    const urlParams = new URLSearchParams(window.location.search);
    const roomParam = urlParams.get('room');
    if (roomParam) {
        updateWelcomeText(roomParam);
    } else {
        document.getElementById('welcome-text').textContent = t.welcome;
    }
    document.getElementById('label-name').textContent = t.nameLabel;
    nameInput.placeholder = t.namePlaceholder;
    document.getElementById('label-min-range').textContent = t.minLabel;
    document.getElementById('label-max-range').textContent = t.maxLabel;
    document.getElementById('label-time-limit').textContent = t.timeLabel;
    document.getElementById('label-custom-room').textContent = t.roomLabel;
    createRoomBtn.textContent = t.create;
    joinRoomBtn.textContent = t.join;
    
    // Lobby Status
    if (state.isConnected) {
        lobbyStatus.textContent = t.oppConnected;
    } else {
        lobbyStatus.textContent = t.waitingOpp;
    }
    
    // Update lobby names & badges
    const hostName = (state.isHost ? state.myName : state.opponentName) || (state.isHost ? t.defaultHost : t.defaultHost);
    const guestName = (state.isHost ? state.opponentName : state.myName) || (state.isHost ? t.defaultGuest : t.defaultGuest);
    document.getElementById('player-host-name').textContent = hostName;
    document.getElementById('player-guest-name').textContent = guestName;
    
    document.querySelector('.host-badge').textContent = t.hostBadge;
    document.querySelector('.guest-badge').textContent = t.guestBadge;

    const badge = document.getElementById('guest-status-badge');
    const guestIsReady = state.isHost ? (state.opponentSecret !== null) : (state.mySecret !== null);
    if (state.isConnected) {
        if (guestIsReady) {
            badge.textContent = t.readyStatus;
            badge.classList.add('ready');
        } else {
            badge.textContent = t.waitingStatus;
            badge.classList.remove('ready');
        }
    } else {
        badge.textContent = t.waitingStatus;
        badge.classList.remove('ready');
    }
    
    document.getElementById('room-id-label').firstChild.textContent = t.roomIdLabel + " ";
    document.getElementById('submit-words-title').textContent = t.submitTitle;
    document.getElementById('range-hint').textContent = t.rangeHint(state.minRange, state.maxRange);
    submitWordsBtn.textContent = submitWordsBtn.disabled ? "..." : (state.mySecret !== null ? t.waitingOpp : t.ready);
    playAgainBtn.textContent = t.playAgain;
    if (copyLinkBtn) copyLinkBtn.textContent = t.copyLink;
    if (shareRoomBtn) shareRoomBtn.textContent = t.shareVia;

    document.querySelector('.opponent-area h3').textContent = state.opponentName || t.opponent;
    document.querySelector('.my-area h3').textContent = state.myName || t.you;
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

let toastTimeout;
function showToast(message, isError = false, persistent = false) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.toggle('error', isError);
    toast.classList.add('show');
    clearTimeout(toastTimeout);
    if (!persistent) {
        toastTimeout = setTimeout(() => {
            hideToast();
        }, 3000);
    }
}

function hideToast() {
    const toast = document.getElementById('toast');
    if (toast) toast.classList.remove('show');
}

function triggerFlash() {
    const flash = document.getElementById('flash-overlay');
    flash.classList.add('active');
    setTimeout(() => flash.classList.remove('active'), 800);
}

// Fetch TURN server credentials dynamically
let cachedIceServers = null;
async function getIceServers() {
    if (cachedIceServers) return cachedIceServers;
    try {
        const response = await fetch("https://daohieuit.metered.live/api/v1/turn/credentials?apiKey=8ebe79943f37e5a240441eb50a579fb8877a");
        cachedIceServers = await response.json();
        return cachedIceServers;
    } catch (e) {
        console.error("Failed to fetch TURN credentials, using defaults:", e);
        return [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            { urls: 'stun:stun3.l.google.com:19302' },
            { urls: 'stun:stun.cloudflare.com:3478' }
        ];
    }
}

// Peer Logic
async function initPeer(id = null) {
    const iceServers = await getIceServers();
    
    const peerOptions = {
        debug: 2,
        host: '0.peerjs.com',
        port: 443,
        secure: true,
        config: {
            'iceServers': iceServers,
            sdpSemantics: 'unified-plan'
        }
    };

    state.peer = new Peer(id, peerOptions);

    // Signaling Heartbeat
    let heartbeat;
    state.peer.on('open', (peerId) => {
        const roomCode = state.isHost ? state.roomId : peerId;
        state.roomId = roomCode;
        displayRoomCode.textContent = roomCode;
        
        heartbeat = setInterval(() => {
            if (state.peer && !state.peer.destroyed) {
                state.peer.socket.send({ type: 'HEARTBEAT' });
            }
        }, 5000);

        if (state.isHost) {
            showPhase('lobby');
            roomInfo.style.display = 'flex';
        } else {
            connectToHost('guessnumber-v1-' + roomCodeInput.value.trim());
        }
    });

    state.peer.on('connection', (conn) => {
        if (state.isHost) {
            if (state.conn && state.isConnected && !state.isReconnecting) {
                conn.close();
                return;
            }
            if (state.conn) {
                try { state.conn.close(); } catch(e){}
            }
            state.conn = conn;
            setupConnection();
        }
    });

    state.peer.on('disconnected', () => {
        console.warn("Signaling disconnected. Attempting reconnect...");
        state.peer.reconnect();
    });

    state.peer.on('error', (err) => {
        clearInterval(heartbeat);
        console.error(err);
        
        const t = translations[state.language];
        if (err.type === 'unavailable-id') {
            alert(state.language === 'en' ? "Room code already in use or error. Try again." : "Mã phòng đã được sử dụng hoặc có lỗi. Thử lại.");
            location.reload();
        } else if (err.type === 'peer-unavailable') {
            alert(state.language === 'en' ? "Room not found. Check the code!" : "Không tìm thấy phòng. Vui lòng kiểm tra lại mã!");
            location.reload();
        } else if (err.type === 'network') {
            alert(state.language === 'en' ? "Network error. PeerJS server might be down or connection blocked." : "Lỗi mạng. Máy chủ PeerJS có thể đang gián đoạn hoặc kết nối bị chặn.");
            location.reload();
        } else {
            alert((state.language === 'en' ? "PeerJS Error: " : "Lỗi PeerJS: ") + err.type);
            location.reload();
        }
    });
}

function connectToHost(hostId) {
    state.conn = state.peer.connect(hostId, { reliable: true });
    setupConnection();
    showPhase('lobby');
}

function handleConnectionClose() {
    if (state.isReconnecting) return;
    
    if (state.currentPhase === 'home' || state.currentPhase === 'gameOver') {
        location.reload();
        return;
    }
    
    state.isConnected = false;
    state.isReconnecting = true;
    
    let timeLeft = 180;
    const updateReconnectMsg = () => {
        const msg = state.language === 'en' ? 
            `Connection lost. Reconnecting... (${timeLeft}s)` : 
            `Mất kết nối. Đang kết nối lại... (${timeLeft}s)`;
        showToast(msg, true, true);
    };
    
    updateReconnectMsg();
    
    if (state.timerInterval) clearInterval(state.timerInterval);
    
    state.reconnectTimer = setInterval(() => {
        timeLeft--;
        if (timeLeft <= 0) {
            clearInterval(state.reconnectTimer);
            if (state.reconnectInterval) clearInterval(state.reconnectInterval);
            alert(state.language === 'en' ? "Reconnection failed!" : "Kết nối lại thất bại!");
            location.reload();
        } else {
            updateReconnectMsg();
        }
    }, 1000);
    
    if (!state.isHost) {
        state.reconnectInterval = setInterval(() => {
            console.log("Guest attempting auto-reconnect...");
            if (state.peer && !state.peer.destroyed) {
                if (state.conn) {
                    try { state.conn.close(); } catch(e){}
                }
                state.conn = state.peer.connect('guessnumber-v1-' + state.roomId, { reliable: true });
                setupConnection();
            }
        }, 3000);
    }
}

function setupConnection() {
    let connTimeout;

    const handleOpen = () => {
        if (connTimeout) clearTimeout(connTimeout);
        
        if (state.isReconnecting) {
            state.isReconnecting = false;
            if (state.reconnectTimer) clearInterval(state.reconnectTimer);
            if (state.reconnectInterval) clearInterval(state.reconnectInterval);
            hideToast();
            showToast(state.language === 'en' ? "Reconnected successfully!" : "Kết nối lại thành công!");
            
            if (state.currentPhase === 'battle') {
                updateTurnUI();
            }
        }
        
        state.isConnected = true;
        const t = translations[state.language];
        lobbyStatus.textContent = t.oppConnected;
        
        if (state.isHost) {
            state.conn.send({
                type: 'init-game',
                config: { min: state.minRange, max: state.maxRange, time: state.timeLimit, hostName: state.myName }
            });
        } else {
            state.conn.send({ type: 'guest-name', name: state.myName });
        }
        
        roomInfo.style.display = 'none';
        wordSubmission.style.display = 'block';
        document.getElementById('hint-min').textContent = state.minRange;
        document.getElementById('hint-max').textContent = state.maxRange;
    };

    if (state.conn.open) {
        handleOpen();
    } else {
        // Handshake Timeout
        connTimeout = setTimeout(() => {
            if (!state.conn.open) {
                console.error("Connection Handshake Timeout");
                alert(state.language === 'en' ? 
                    "Connection timed out. Try switching to 4G/LTE or check if both players have a stable signal." : 
                    "Kết nối quá hạn. Hãy thử chuyển sang 4G/LTE hoặc kiểm tra xem cả hai người chơi có tín hiệu ổn định không.");
                location.reload();
            }
        }, 20000);

        state.conn.on('open', handleOpen);
    }

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
                updateLanguageUI();
                // Send host info back if I am host
                if (state.isHost) {
                    state.conn.send({
                        type: 'init-game',
                        config: { min: state.minRange, max: state.maxRange, time: state.timeLimit, hostName: state.myName }
                    });
                }
                break;
            case 'ready':
                state.opponentSecret = data.secret;
                updateLanguageUI();
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
            case 'play-again':
                resetGame();
                break;
        }
    });

    state.conn.on('close', () => {
        handleConnectionClose();
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

function resetGame() {
    state.mySecret = null;
    state.opponentSecret = null;
    state.gameActive = false;
    state.isMyTurn = false;
    clearInterval(state.timerInterval);
    timerDisplay.classList.remove('my-turn');
    timerDisplay.classList.remove('visible');
    
    document.getElementById('opponent-history').innerHTML = '';
    document.getElementById('my-history').innerHTML = '';
    document.getElementById('displayed-my-secret').textContent = '--';
    
    submitWordsBtn.disabled = false;
    submitWordsBtn.textContent = translations[state.language].ready;
    secretNumberInput.value = '';
    
    wordSubmission.style.display = 'block';
    showPhase('lobby');
}

// Event Listeners
createRoomBtn.onclick = () => {
    state.myName = nameInput.value.trim() || "Host";
    state.minRange = parseInt(minRangeInput.value, 10);
    state.maxRange = parseInt(maxRangeInput.value, 10);
    state.timeLimit = parseInt(timeLimitInput.value, 10);
    const customCode = customRoomInput.value.trim();
    state.roomId = customCode || Math.floor(100 + Math.random() * 900).toString();
    state.isHost = true;
    initPeer('guessnumber-v1-' + state.roomId);
};

joinRoomBtn.onclick = () => {
    state.myName = nameInput.value.trim() || "Guest";
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
    submitWordsBtn.textContent = translations[state.language].waitingOpp;
    state.conn.send({ type: 'ready', secret: num });
    updateLanguageUI();
    checkStartBattle();
};

guessBtn.onclick = handleGuess;
guessInput.onkeypress = (e) => { if (e.key === 'Enter') handleGuess(); };
playAgainBtn.onclick = () => {
    state.conn.send({ type: 'play-again' });
    resetGame();
};
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

// Share room link
if (shareRoomBtn) {
    shareRoomBtn.onclick = () => {
        const t = translations[state.language];
        const baseUrl = window.location.origin + window.location.pathname;
        const shareUrl = `${baseUrl}?room=${state.roomId}`;
        const textMsg = t.shareText(state.roomId);

        if (navigator.share) {
            navigator.share({
                title: t.shareTitle,
                text: textMsg,
                url: shareUrl
            }).catch(err => console.log('Share error:', err));
        } else {
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            if (isMobile) {
                const messengerUrl = `fb-messenger://share/?link=${encodeURIComponent(shareUrl)}`;
                window.open(messengerUrl, '_blank');
            } else {
                const messengerUrl = `https://www.facebook.com/dialog/send?app_id=291494419162&link=${encodeURIComponent(shareUrl)}&redirect_uri=${encodeURIComponent(shareUrl)}`;
                window.open(messengerUrl, '_blank');
            }
        }
    };
}

document.getElementById('web-logo').onclick = () => { window.location.href = '../../index.html'; };

// Init
state.theme = localStorage.getItem('theme') || 'light';
updateThemeUI();
updateLanguageUI();
