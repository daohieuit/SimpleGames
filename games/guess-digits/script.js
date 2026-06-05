/**
 * Guess Number 2 - P2P Logic
 * Wordle-style digit guessing game
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
    digitCount: 4, // 3 to 6 digits, default 4
    mySecret: null,
    opponentSecret: null, // Just a flag or value when they submit
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
    setup: document.getElementById('setup-phase'),
    battle: document.getElementById('battle-phase'),
    gameOver: document.getElementById('game-over-phase')
};

const lobbyStatus = document.getElementById('lobby-status');
const roomInfo = document.getElementById('room-info');
const nameInput = document.getElementById('name-input');
const digitCountInput = document.getElementById('digit-count-input');
const customRoomInput = document.getElementById('custom-room-input');
const roomCodeInput = document.getElementById('room-code-input');
const createRoomBtn = document.getElementById('create-room-btn');
const joinRoomBtn = document.getElementById('join-room-btn');
const displayRoomCode = document.getElementById('display-room-code');
const startGameBtn = document.getElementById('start-game-btn');
const lobbyControls = document.getElementById('lobby-controls');
const confirmSecretBtn = document.getElementById('confirm-secret-btn');
const turnIndicator = document.getElementById('turn-indicator');
const guessBtn = document.getElementById('guess-btn');
const winnerText = document.getElementById('winner-text');
const secretRevealText = document.getElementById('secret-reveal-text');
const playAgainBtn = document.getElementById('play-again-btn');
const themeToggle = document.getElementById('theme-toggle');
const langToggle = document.getElementById('lang-toggle');
const copyLinkBtn = document.getElementById('copy-link-btn');
const shareRoomBtn = document.getElementById('share-room-btn');
const leaveLobbyBtn = document.getElementById('leave-lobby-btn');
const leaveGameBtn = document.getElementById('leave-game-btn');

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
        title: "Guess Number 2",
        welcome: "Welcome to Guess Number 2",
        nameLabel: "Your Name:",
        namePlaceholder: "Enter your name",
        digitsLabel: "Digit Count:",
        roomLabel: "Room ID:",
        create: "Create Room",
        join: "Join Room",
        waitingOpp: "Waiting for Opponent...",
        oppConnected: "Opponent Connected!",
        roomIdLabel: "Room ID:",
        setupTitle: "Set Your Secret Number",
        setupHint: (digits) => `Enter a ${digits}-digit secret number. Your opponent will have to guess this number.`,
        confirmSecret: "Confirm Secret Number",
        waitingOppReady: "Waiting for opponent to set secret...",
        yourTurn: "Your Turn!",
        oppTurn: "Opponent's Turn...",
        win: "You Won! 🎉",
        lose: "You Lost...",
        reveal: (num) => `The secret number was: ${num}`,
        numRequired: "Please enter all digits!",
        numInvalid: "Please enter numbers only!",
        playAgain: "Play Again",
        opponent: "Opponent",
        you: "You",
        secretLabel: "Your Secret:",
        copyLink: "Copy Link",
        linkCopied: "Link copied!",
        shareVia: "Send Via",
        cancelRoom: "Cancel Room",
        leaveRoom: "Leave Room",
        shareTitle: "Simple Games - Guess Number 2",
        shareText: (code) => `Play Guess Number 2 with me! Room ID: ${code}`,
        hostBadge: "Host",
        guestBadge: "Guest",
        waitingStatus: "Waiting...",
        readyStatus: "Ready",
        btnStart: "Start Game",
        myGuessesHeader: "Your Guesses (Target: Opponent)",
        oppGuessesHeader: "Opponent's Guesses (Target: You)",
        btnGuess: "Guess",
        lobbyConfigHint: (digits) => `Guessing length: ${digits} digits.`
    },
    vi: {
        title: "Đoán Số 2",
        welcome: "Chào mừng đến với Đoán Số 2",
        nameLabel: "Tên của bạn:",
        namePlaceholder: "Nhập tên của bạn",
        digitsLabel: "Số chữ số:",
        roomLabel: "Mã phòng:",
        create: "Tạo Phòng",
        join: "Vào Phòng",
        waitingOpp: "Đang đợi đối thủ...",
        oppConnected: "Đối thủ đã kết nối!",
        roomIdLabel: "Mã phòng:",
        setupTitle: "Thiết lập số bí mật của bạn",
        setupHint: (digits) => `Nhập số có ${digits} chữ số. Đối thủ sẽ phải đoán số này của bạn.`,
        confirmSecret: "Xác Nhận Số Bí Mật",
        waitingOppReady: "Đang đợi đối thủ thiết lập số...",
        yourTurn: "Lượt của bạn!",
        oppTurn: "Lượt đối thủ...",
        win: "Bạn Thắng! 🎉",
        lose: "Bạn Thua...",
        reveal: (num) => `Số bí mật là: ${num}`,
        numRequired: "Vui lòng nhập đủ các chữ số!",
        numInvalid: "Vui lòng chỉ nhập số!",
        playAgain: "Chơi lại",
        opponent: "Đối thủ",
        you: "Bạn",
        secretLabel: "Số bí mật của bạn:",
        copyLink: "Copy Link",
        linkCopied: "Link copied!",
        shareVia: "Gửi qua",
        cancelRoom: "Hủy phòng",
        leaveRoom: "Rời phòng",
        shareTitle: "Simple Games - Đoán Số 2",
        shareText: (code) => `Chơi Đoán Số 2 cùng tôi nhé! Mã phòng: ${code}`,
        hostBadge: "Host",
        guestBadge: "Khách",
        waitingStatus: "Đang đợi...",
        readyStatus: "Sẵn sàng",
        btnStart: "Bắt Đầu Game",
        myGuessesHeader: "Lịch sử đoán của bạn (Đối thủ)",
        oppGuessesHeader: "Lịch sử đoán của đối thủ (Bạn)",
        btnGuess: "Gửi Dự Đoán",
        lobbyConfigHint: (digits) => `Độ dài số đoán: ${digits} chữ số.`
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
    document.getElementById('game-title-header').textContent = t.title;
    
    const urlParams = new URLSearchParams(window.location.search);
    const roomParam = urlParams.get('room');
    if (roomParam) {
        updateWelcomeText(roomParam);
    } else {
        document.getElementById('welcome-text').textContent = t.welcome;
    }
    
    document.getElementById('label-name').textContent = t.nameLabel;
    nameInput.placeholder = t.namePlaceholder;
    document.getElementById('label-digit-count').textContent = t.digitsLabel;
    document.getElementById('label-custom-room').textContent = t.roomLabel;
    createRoomBtn.textContent = t.create;
    joinRoomBtn.textContent = t.join;
    
    // Lobby Phase
    if (state.isConnected) {
        lobbyStatus.textContent = t.oppConnected;
        document.getElementById('guest-status-badge').textContent = t.readyStatus;
        document.getElementById('guest-status-badge').classList.add('ready');
    } else {
        lobbyStatus.textContent = t.waitingOpp;
        document.getElementById('guest-status-badge').textContent = t.waitingStatus;
        document.getElementById('guest-status-badge').classList.remove('ready');
    }
    
    document.getElementById('room-id-label').firstChild.textContent = t.roomIdLabel + " ";
    document.getElementById('game-config-hint').innerHTML = t.lobbyConfigHint(state.digitCount);
    document.getElementById('display-digit-count').textContent = state.digitCount;
    startGameBtn.textContent = t.btnStart;
    
    // Setup Phase
    document.getElementById('setup-title').textContent = t.setupTitle;
    document.getElementById('setup-digit-count').textContent = state.digitCount;
    document.getElementById('setup-hint').textContent = t.setupHint(state.digitCount);
    confirmSecretBtn.textContent = t.confirmSecret;
    
    // Battle Phase
    document.getElementById('panel-my-guesses').textContent = t.myGuessesHeader;
    document.getElementById('panel-opponent-guesses').textContent = t.oppGuessesHeader;
    guessBtn.textContent = t.btnGuess;
    
    if (state.mySecret) {
        document.getElementById('my-secret-display').firstChild.textContent = t.secretLabel + " ";
    }
    
    // Game Over Phase
    playAgainBtn.textContent = t.playAgain;
    if (copyLinkBtn) copyLinkBtn.textContent = t.copyLink;
    if (shareRoomBtn) shareRoomBtn.textContent = t.shareVia;
    if (leaveLobbyBtn) leaveLobbyBtn.textContent = state.isHost ? t.cancelRoom : t.leaveRoom;
    if (leaveGameBtn) leaveGameBtn.textContent = t.leaveRoom;
    
    // Badges
    document.querySelector('.host-badge').textContent = t.hostBadge;
    if (!state.isHost) {
        document.querySelector('.guest-badge').textContent = t.guestBadge;
    }
    
    // Player names
    document.getElementById('player-host-name').textContent = (state.isHost ? state.myName : state.opponentName) || "Host";
    document.getElementById('player-guest-name').textContent = (state.isHost ? state.opponentName : state.myName) || "Guest";

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

// Get TURN server credentials
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

// PeerJS Init
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
            document.getElementById('player-host-name').textContent = state.myName || "Host";
        } else {
            connectToHost('guessdigits-v1-' + roomCodeInput.value.trim());
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
        console.warn("Signaling disconnected. Reconnecting...");
        state.peer.reconnect();
    });

    state.peer.on('error', (err) => {
        clearInterval(heartbeat);
        console.error(err);
        
        if (err.type === 'unavailable-id') {
            showToast(state.language === 'en' ? "Room code already in use! Please try another one." : "Mã phòng đã được sử dụng! Vui lòng chọn mã khác.", true);
            if (state.peer) {
                try { state.peer.destroy(); } catch(e){}
                state.peer = null;
            }
            showPhase('home');
            updateLanguageUI();
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
                state.conn = state.peer.connect('guessdigits-v1-' + state.roomId, { reliable: true });
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
            showToast(state.language === 'en' ? "Reconnected successfully!" : "Kết nối lại công!");
        }
        
        state.isConnected = true;
        
        if (state.isHost) {
            state.conn.send({
                type: 'init-game',
                config: { digitCount: state.digitCount, hostName: state.myName }
            });
            lobbyControls.style.display = 'block'; // Show start game button
        } else {
            state.conn.send({ type: 'guest-name', name: state.myName });
        }
        
        updateLanguageUI();
    };

    if (state.conn.open) {
        handleOpen();
    } else {
        connTimeout = setTimeout(() => {
            if (!state.conn.open) {
                console.error("Connection Handshake Timeout");
                alert(state.language === 'en' ? 
                    "Connection timed out. Try switching to 4G/LTE or check signal." : 
                    "Kết nối quá hạn. Hãy thử chuyển sang 4G/LTE hoặc kiểm tra sóng.");
                location.reload();
            }
        }, 20000);

        state.conn.on('open', handleOpen);
    }

    state.conn.on('data', (data) => {
        switch (data.type) {
            case 'init-game':
                state.digitCount = data.config.digitCount;
                state.opponentName = data.config.hostName;
                updateLanguageUI();
                break;
            case 'guest-name':
                state.opponentName = data.name;
                updateLanguageUI();
                if (state.isHost) {
                    state.conn.send({
                        type: 'init-game',
                        config: { digitCount: state.digitCount, hostName: state.myName }
                    });
                }
                break;
            case 'start-setup':
                enterSetupPhase();
                break;
            case 'ready':
                state.opponentSecret = true; // Opponent has finished setup
                checkStartBattle();
                break;
            case 'start-battle':
                startBattle(data.firstTurnId);
                break;
            case 'guess':
                handleIncomingGuess(data.guess);
                break;
            case 'guess-result':
                handleGuessResult(data.guess, data.result);
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

// Generate Digit Input Boxes for Setup and Guessing
function generateDigitInputs(containerId, prefix) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    for (let i = 0; i < state.digitCount; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.pattern = '[0-9]';
        input.inputMode = 'numeric';
        input.maxLength = 1;
        input.className = 'digit-box';
        input.id = `${prefix}-${i}`;
        
        // Handle input focus jumping
        input.oninput = (e) => {
            // Allow only numbers
            input.value = input.value.replace(/[^0-9]/g, '');
            if (input.value.length === 1 && i < state.digitCount - 1) {
                document.getElementById(`${prefix}-${i+1}`).focus();
            }
        };
        
        input.onkeydown = (e) => {
            if (e.key === 'Backspace' && input.value.length === 0 && i > 0) {
                document.getElementById(`${prefix}-${i-1}`).focus();
            }
        };
        
        container.appendChild(input);
    }
}

function getDigitValue(prefix) {
    let val = '';
    for (let i = 0; i < state.digitCount; i++) {
        const el = document.getElementById(`${prefix}-${i}`);
        val += el ? el.value.trim() : '';
    }
    return val;
}

function clearDigitValues(prefix) {
    for (let i = 0; i < state.digitCount; i++) {
        const el = document.getElementById(`${prefix}-${i}`);
        if (el) el.value = '';
    }
    // focus on first
    const first = document.getElementById(`${prefix}-0`);
    if (first) first.focus();
}

// Game Phase Transitions
function enterSetupPhase() {
    showPhase('setup');
    generateDigitInputs('secret-inputs-row', 'secret-input');
    // Focus first element
    setTimeout(() => {
        const first = document.getElementById('secret-input-0');
        if (first) first.focus();
    }, 100);
}

confirmSecretBtn.onclick = () => {
    const secret = getDigitValue('secret-input');
    const t = translations[state.language];
    
    if (secret.length < state.digitCount) {
        return showToast(t.numRequired, true);
    }
    if (!/^\d+$/.test(secret)) {
        return showToast(t.numInvalid, true);
    }
    
    state.mySecret = secret;
    confirmSecretBtn.disabled = true;
    document.getElementById('setup-status-msg').textContent = t.waitingOppReady;
    
    state.conn.send({ type: 'ready' });
    checkStartBattle();
};

function checkStartBattle() {
    if (state.mySecret !== null && state.opponentSecret) {
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
    generateDigitInputs('guess-inputs-row', 'guess-input');
    
    updateTurnUI();
}

function updateTurnUI() {
    const t = translations[state.language];
    turnIndicator.textContent = state.isMyTurn ? t.yourTurn : t.oppTurn;
    document.querySelector('.guess-input-container').style.display = state.isMyTurn ? 'flex' : 'none';
    
    if (state.isMyTurn) {
        setTimeout(() => {
            const first = document.getElementById('guess-input-0');
            if (first) first.focus();
        }, 100);
    }
}

// Compare Secret and Guess
function calculateFeedback(secret, guess) {
    const size = secret.length;
    const feedback = Array(size).fill('incorrect'); // 'correct', 'wrong-pos', 'incorrect'
    const secretUsed = Array(size).fill(false);
    const guessUsed = Array(size).fill(false);

    // Step 1: Exact matches (Green)
    for (let i = 0; i < size; i++) {
        if (guess[i] === secret[i]) {
            feedback[i] = 'correct';
            secretUsed[i] = true;
            guessUsed[i] = true;
        }
    }

    // Step 2: Digits in secret but wrong position (Yellow)
    for (let i = 0; i < size; i++) {
        if (guessUsed[i]) continue;
        for (let j = 0; j < size; j++) {
            if (!secretUsed[j] && guess[i] === secret[j]) {
                feedback[i] = 'wrong-pos';
                secretUsed[j] = true;
                break;
            }
        }
    }
    return feedback;
}

// Play logic
guessBtn.onclick = handleMyGuessSubmit;
// Allow submitting with Enter on any guess-input
document.getElementById('guess-inputs-row').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleMyGuessSubmit();
    }
});

function handleMyGuessSubmit() {
    if (!state.isMyTurn || !state.gameActive) return;
    
    const guess = getDigitValue('guess-input');
    const t = translations[state.language];
    
    if (guess.length < state.digitCount) {
        return showToast(t.numRequired, true);
    }
    
    state.conn.send({ type: 'guess', guess });
    state.isMyTurn = false;
    updateTurnUI();
}

function handleIncomingGuess(guess) {
    triggerFlash();
    const result = calculateFeedback(state.mySecret, guess);
    
    // Play correct/wrong sound
    const allCorrect = result.every(r => r === 'correct');
    if (allCorrect) {
        correctSound.play().catch(e => console.warn("Sound play deferred"));
    } else {
        wrongSound.play().catch(e => console.warn("Sound play deferred"));
    }
    
    // Add to Opponent's guess history panel
    // (Opponent targets me, so we show what opponent guessed and color hint)
    addHistoryRow('opponent-history', guess, result);
    
    // Reply back with colors
    state.conn.send({ type: 'guess-result', guess, result });
    
    if (allCorrect) {
        endGame(false, state.mySecret); // I lost, opponent guessed correctly
        state.conn.send({ type: 'game-over', winner: state.conn.peer, secret: state.mySecret });
    } else {
        state.isMyTurn = true;
        updateTurnUI();
    }
}

function handleGuessResult(guess, result) {
    triggerFlash();
    
    const allCorrect = result.every(r => r === 'correct');
    if (allCorrect) {
        correctSound.play().catch(e => console.warn("Sound play deferred"));
        endGame(true, guess); // I won, this was the secret number
    } else {
        wrongSound.play().catch(e => console.warn("Sound play deferred"));
        state.isMyTurn = false;
        updateTurnUI();
    }
    
    // Add to My guess history panel (Target: Opponent)
    addHistoryRow('my-history', guess, result);
    clearDigitValues('guess-input');
}

function addHistoryRow(containerId, guess, result) {
    const container = document.getElementById(containerId);
    const row = document.createElement('div');
    row.className = 'history-row';
    
    for (let i = 0; i < state.digitCount; i++) {
        const cell = document.createElement('div');
        cell.className = `digit-cell ${result[i]}`;
        cell.textContent = guess[i];
        row.appendChild(cell);
    }
    
    container.insertBefore(row, container.firstChild);
}

function endGame(isWin, secret) {
    state.gameActive = false;
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
    
    document.getElementById('my-history').innerHTML = '';
    document.getElementById('opponent-history').innerHTML = '';
    document.getElementById('displayed-my-secret').textContent = '----';
    confirmSecretBtn.disabled = false;
    document.getElementById('setup-status-msg').textContent = '';
    
    if (state.isHost) {
        showPhase('lobby');
    } else {
        // Guest waits in setup lobby too
        showPhase('lobby');
    }
}

function leaveRoom() {
    if (state.conn) {
        try { state.conn.close(); } catch(e){}
        state.conn = null;
    }
    if (state.peer) {
        try { state.peer.destroy(); } catch(e){}
        state.peer = null;
    }
    
    state.isConnected = false;
    state.isReconnecting = false;
    state.mySecret = null;
    state.opponentSecret = null;
    if (state.reconnectTimer) clearInterval(state.reconnectTimer);
    if (state.reconnectInterval) clearInterval(state.reconnectInterval);
    
    roomInfo.style.display = 'none';
    const badge = document.getElementById('guest-status-badge');
    if (badge) {
        badge.textContent = translations[state.language].waitingStatus;
        badge.classList.remove('ready');
    }
    
    showPhase('home');
    updateLanguageUI();
}

// Controls & Event Listeners
createRoomBtn.onclick = () => {
    leaveRoom();
    state.myName = nameInput.value.trim() || "Host";
    state.digitCount = parseInt(digitCountInput.value, 10);
    const customCode = customRoomInput.value.trim();
    state.roomId = customCode || Math.floor(100 + Math.random() * 900).toString();
    state.isHost = true;
    initPeer('guessdigits-v1-' + state.roomId);
};

joinRoomBtn.onclick = () => {
    leaveRoom();
    state.myName = nameInput.value.trim() || "Guest";
    state.isHost = false;
    initPeer();
};

startGameBtn.onclick = () => {
    if (state.isHost && state.isConnected) {
        state.conn.send({ type: 'start-setup' });
        enterSetupPhase();
    }
};

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

// Copy room link
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

document.getElementById('web-logo').onclick = () => { 
    if (state.peer) {
        try { state.peer.destroy(); } catch(e){}
    }
    window.location.href = '../../index.html'; 
};

if (leaveLobbyBtn) leaveLobbyBtn.onclick = leaveRoom;
if (leaveGameBtn) leaveGameBtn.onclick = leaveRoom;

window.addEventListener('beforeunload', () => {
    if (state.peer) {
        try { state.peer.destroy(); } catch(e){}
    }
});

// Username Sync
if (nameInput) {
    const savedName = localStorage.getItem('username');
    if (savedName) {
        nameInput.value = savedName;
    }
    nameInput.addEventListener('input', () => {
        const val = nameInput.value.trim();
        if (val) {
            localStorage.setItem('username', val);
        } else {
            localStorage.removeItem('username');
        }
    });
}

// Init Theme & Language
state.theme = localStorage.getItem('theme') || 'light';
updateThemeUI();
updateLanguageUI();
