const state = {
    myName: '',
    opponentName: '',
    isHost: false,
    roomId: '',
    peer: null,
    conn: null,
    isConnected: false,
    myReady: false,
    opponentReady: false,
    
    // Game Params
    sequenceLength: 4,
    digits: 2,
    showDuration: 5,
    
    // Game State
    sequence: [],
    myGuessed: [],
    opponentGuessed: [],
    gameActive: false,
    startTime: null,
    timerInterval: null,
    
    language: localStorage.getItem('language') || 'en',
    theme: localStorage.getItem('theme') || 'light',
    isReconnecting: false,
    reconnectTimer: null,
    reconnectInterval: null
};

// DOM Elements
const phases = {
    home: document.getElementById('home-phase'),
    lobby: document.getElementById('lobby-phase'),
    battle: document.getElementById('battle-phase'),
    gameOver: document.getElementById('game-over-phase')
};

const welcomeText = document.getElementById('welcome-text');
const nameInput = document.getElementById('name-input');
const sequenceLengthInput = document.getElementById('sequence-length-input');
const digitsInput = document.getElementById('digits-input');
const showDurationInput = document.getElementById('show-duration-input');
const customRoomInput = document.getElementById('custom-room-input');
const roomCodeInput = document.getElementById('room-code-input');

const createRoomBtn = document.getElementById('create-room-btn');
const joinRoomBtn = document.getElementById('join-room-btn');
const copyLinkBtn = document.getElementById('copy-link-btn');
const submitWordsBtn = document.getElementById('submit-words-btn');
const playAgainBtn = document.getElementById('play-again-btn');
const themeToggle = document.getElementById('theme-toggle');
const langToggle = document.getElementById('lang-toggle');

const displayRoomCode = document.getElementById('display-room-code');
const lobbyStatus = document.getElementById('lobby-status');
const roomInfo = document.getElementById('room-info');
const wordSubmission = document.getElementById('word-submission');

const turnIndicator = document.getElementById('turn-indicator');
const timerDisplay = document.getElementById('timer-display');
const mySequenceContainer = document.getElementById('my-sequence');
const opponentSequenceContainer = document.getElementById('opponent-sequence');
const guessInput = document.getElementById('guess-input');
const guessBtn = document.getElementById('guess-btn');

const winnerText = document.getElementById('winner-text');
const secretRevealText = document.getElementById('secret-reveal-text');

// Audio elements (fallbacks if files missing)
const correctSound = new Audio('../../assets/mp3/correct.mp3');
const wrongSound = new Audio('../../assets/mp3/wrong.mp3');

// Phase Switcher
function showPhase(phaseName) {
    Object.keys(phases).forEach(p => {
        phases[p].classList.toggle('active', p === phaseName);
    });
}

// Translation Library
const translations = {
    en: {
        title: "Remember Numbers",
        welcome: "Welcome to Remember Numbers",
        nameLabel: "Your Name:",
        namePlaceholder: "Enter your name",
        sequenceLengthLabel: "Sequence Length (2-10):",
        digitsLabel: "Digits per number (1-5):",
        showDurationLabel: "Show Duration (sec):",
        roomLabel: "Room ID:",
        create: "Create Room",
        join: "Join Room",
        waitingOpp: "Waiting for Opponent...",
        oppConnected: "Opponent Connected!",
        roomIdLabel: "Room ID:",
        ready: "Ready!",
        waitingOppReady: "Waiting for opponent...",
        you: "You",
        opponent: "Opponent",
        turnPrepare: "Get Ready...",
        turnRemember: "Remember the sequence!",
        turnType: "Type the numbers!",
        win: "You Won! 🎉",
        lose: "You Lost...",
        reveal: (time, digits) => `Time taken: ${time}s | Sequence: ${digits}`,
        playAgain: "Play Again",
        copyLink: "Copy Link",
        linkCopied: "Link copied!",
        enterCode: "Please enter a room code!",
        peerError: "Connection error. Reloading page...",
        roomCodeInUse: "Room code already in use or error. Try again."
    },
    vi: {
        title: "Ghi Nhớ Số",
        welcome: "Chào mừng đến với Ghi Nhớ Số",
        nameLabel: "Tên của bạn:",
        namePlaceholder: "Nhập tên của bạn",
        sequenceLengthLabel: "Số lượng số (2-10):",
        digitsLabel: "Số chữ số (1-5):",
        showDurationLabel: "Thời gian nhớ (giây):",
        roomLabel: "Mã phòng:",
        create: "Tạo Phòng",
        join: "Vào Phòng",
        waitingOpp: "Đang đợi đối thủ...",
        oppConnected: "Đối thủ đã kết nối!",
        roomIdLabel: "Mã phòng:",
        ready: "Sẵn sàng!",
        waitingOppReady: "Đợi đối thủ sẵn sàng...",
        you: "Bạn",
        opponent: "Đối thủ",
        turnPrepare: "Chuẩn bị...",
        turnRemember: "Ghi nhớ dãy số!",
        turnType: "Nhập các số!",
        win: "Bạn Thắng! 🎉",
        lose: "Bạn Thua...",
        reveal: (time, digits) => `Thời gian hoàn thành: ${time}s | Dãy số: ${digits}`,
        playAgain: "Chơi lại",
        copyLink: "Copy Link",
        linkCopied: "Đã copy link!",
        enterCode: "Vui lòng nhập mã phòng!",
        peerError: "Lỗi kết nối. Đang tải lại trang...",
        roomCodeInUse: "Mã phòng đã được sử dụng hoặc có lỗi. Thử lại."
    }
};

function updateWelcomeText(roomCode) {
    if (state.language === 'en') {
        welcomeText.textContent = `Join Room: ${roomCode}`;
    } else {
        welcomeText.textContent = `Vào Phòng: ${roomCode}`;
    }
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
        welcomeText.textContent = t.welcome;
    }

    document.getElementById('label-name').textContent = t.nameLabel;
    nameInput.placeholder = t.namePlaceholder;
    document.getElementById('label-sequence-length').textContent = t.sequenceLengthLabel;
    document.getElementById('label-digits').textContent = t.digitsLabel;
    document.getElementById('label-show-duration').textContent = t.showDurationLabel;
    document.getElementById('label-custom-room').textContent = t.roomLabel;
    
    createRoomBtn.textContent = t.create;
    joinRoomBtn.textContent = t.join;
    
    if (state.isConnected) {
        lobbyStatus.textContent = t.oppConnected;
    } else {
        lobbyStatus.textContent = t.waitingOpp;
    }
    
    document.getElementById('room-id-label').firstChild.textContent = t.roomIdLabel + " ";
    document.getElementById('submit-words-title').textContent = t.ready;
    submitWordsBtn.textContent = state.myReady ? t.waitingOppReady : t.ready;
    playAgainBtn.textContent = t.playAgain;
    copyLinkBtn.textContent = t.copyLink;
    
    document.getElementById('opponent-title').textContent = state.opponentName || t.opponent;
    document.getElementById('my-title').textContent = state.myName || t.you;
    
    langToggle.textContent = state.language === 'en' ? 'VI' : 'US';
    roomCodeInput.placeholder = state.language === 'en' ? "Enter Room ID" : "Nhập mã phòng";
}

function updateThemeUI() {
    const isDark = state.theme === 'dark';
    document.documentElement.classList.toggle('dark-mode', isDark);
    themeToggle.textContent = isDark ? '☀️' : '🌙';
}

// Theme Event Listeners
themeToggle.onclick = () => {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', state.theme);
    updateThemeUI();
};

langToggle.onclick = () => {
    state.language = state.language === 'en' ? 'vi' : 'en';
    localStorage.setItem('language', state.language);
    updateLanguageUI();
};

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
            wordSubmission.style.display = 'block';
        } else {
            connectToHost('remembernumbers-v1-' + roomCodeInput.value.trim());
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
        const t = translations[state.language];
        if (err.type === 'unavailable-id') {
            alert(t.roomCodeInUse);
            location.reload();
        } else {
            alert(t.peerError);
            location.reload();
        }
    });
}

function connectToHost(hostId) {
    state.conn = state.peer.connect(hostId, { reliable: true });
    setupConnection();
}

function handleConnectionClose() {
    if (state.isReconnecting) return;
    
    // Only attempt reconnect if we were in lobby or battle phase
    const activePhase = (state.sequence && state.sequence.length > 0) ? 'battle' : 'lobby';
    // Actually, checking if we are on GameOver screen:
    if (phases.gameOver.classList.contains('active') || phases.home.classList.contains('active')) {
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
                state.conn = state.peer.connect('remembernumbers-v1-' + state.roomId, { reliable: true });
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
            
            // Resume battle timer if we were playing
            if (phases.battle.classList.contains('active') && state.gameActive) {
                state.startTime = Date.now(); // reset start time to approximate
                maskSequence();
            }
        }
        
        state.isConnected = true;
        lobbyStatus.textContent = translations[state.language].oppConnected;
        roomInfo.style.display = 'flex';
        wordSubmission.style.display = 'block';
        
        // Handshake: exchange names
        state.conn.send({
            type: 'handshake',
            name: state.myName
        });
    };

    if (state.conn.open) {
        handleOpen();
    } else {
        // Handshake Timeout: Give it 20s for slow mobile networks
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
            case 'handshake':
                state.opponentName = data.name;
                updateLanguageUI();
                break;
            case 'ready':
                state.opponentReady = true;
                checkStartGame();
                break;
            case 'init-game':
                state.sequence = data.sequence;
                state.sequenceLength = data.sequenceLength;
                state.digits = data.digits;
                state.showDuration = data.showDuration;
                startCountDown();
                break;
            case 'progress':
                state.opponentGuessed = data.revealedIndices;
                renderSequence('opponent');
                break;
            case 'game-over':
                endGame(false, data.elapsed);
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

// Link Copying
copyLinkBtn.onclick = () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?room=${state.roomId}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
        showToast(translations[state.language].linkCopied);
    }).catch(err => {
        console.error("Failed to copy url: ", err);
    });
};

function generateSequence(len, digitsCount) {
    const maxVal = Math.pow(10, digitsCount);
    const seq = [];
    for (let i = 0; i < len; i++) {
        const num = Math.floor(Math.random() * maxVal);
        seq.push(num.toString().padStart(digitsCount, '0'));
    }
    return seq;
}

function checkStartGame() {
    if (state.isHost && state.myReady && state.opponentReady) {
        state.sequence = generateSequence(state.sequenceLength, state.digits);
        state.conn.send({
            type: 'init-game',
            sequence: state.sequence,
            sequenceLength: state.sequenceLength,
            digits: state.digits,
            showDuration: state.showDuration
        });
        startCountDown();
    }
}

function startCountDown() {
    showPhase('battle');
    let count = 3;
    timerDisplay.textContent = "00.000";
    timerDisplay.classList.add('visible');
    
    const countInterval = setInterval(() => {
        if (count > 0) {
            turnIndicator.textContent = `${translations[state.language].turnPrepare} (${count})`;
            count--;
        } else {
            clearInterval(countInterval);
            revealSequence();
        }
    }, 1000);
}

function revealSequence() {
    state.myGuessed = new Array(state.sequence.length).fill(true); // Temporarily show all
    state.opponentGuessed = new Array(state.sequence.length).fill(false);
    
    renderSequence('my');
    renderSequence('opponent');
    
    let timeRemaining = state.showDuration;
    turnIndicator.textContent = translations[state.language].turnRemember;
    timerDisplay.textContent = timeRemaining.toString().padStart(2, '0') + ".000";
    
    const revealInterval = setInterval(() => {
        timeRemaining--;
        if (timeRemaining > 0) {
            timerDisplay.textContent = timeRemaining.toString().padStart(2, '0') + ".000";
        } else {
            clearInterval(revealInterval);
            maskSequence();
        }
    }, 1000);
}

function maskSequence() {
    state.myGuessed = new Array(state.sequence.length).fill(false); // Mask all
    renderSequence('my');
    
    turnIndicator.textContent = translations[state.language].turnType;
    guessInput.disabled = false;
    guessInput.focus();
    
    state.gameActive = true;
    state.startTime = Date.now();
    timerDisplay.classList.add('running');
    
    state.timerInterval = setInterval(() => {
        const elapsed = Date.now() - state.startTime;
        const secs = Math.floor(elapsed / 1000);
        const ms = elapsed % 1000;
        timerDisplay.textContent = `${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
    }, 33);
}

function renderSequence(player) {
    const container = player === 'my' ? mySequenceContainer : opponentSequenceContainer;
    const guessed = player === 'my' ? state.myGuessed : state.opponentGuessed;
    
    container.innerHTML = '';
    state.sequence.forEach((val, idx) => {
        const slot = document.createElement('div');
        slot.className = 'sequence-slot';
        
        if (guessed[idx]) {
            slot.classList.add('revealed');
            slot.textContent = val;
        } else {
            slot.textContent = '_'.repeat(state.digits);
        }
        container.appendChild(slot);
    });
}

function handleGuessSubmit() {
    if (!state.gameActive) return;
    const val = guessInput.value.trim();
    guessInput.value = '';
    
    if (val === '') return;
    
    let matched = false;
    state.sequence.forEach((num, idx) => {
        if (num === val && !state.myGuessed[idx]) {
            state.myGuessed[idx] = true;
            matched = true;
        }
    });
    
    if (matched) {
        try { correctSound.play().catch(() => {}); } catch(e) {}
        renderSequence('my');
        
        // Notify opponent
        state.conn.send({
            type: 'progress',
            revealedIndices: state.myGuessed
        });
        
        // Check win condition
        if (state.myGuessed.every(v => v === true)) {
            const finalTime = Date.now() - state.startTime;
            clearInterval(state.timerInterval);
            state.gameActive = false;
            
            state.conn.send({
                type: 'game-over',
                elapsed: finalTime
            });
            endGame(true, finalTime);
        }
    } else {
        try { wrongSound.play().catch(() => {}); } catch(e) {}
        triggerFlash();
    }
}

function endGame(isWin, elapsedMs) {
    clearInterval(state.timerInterval);
    state.gameActive = false;
    guessInput.disabled = true;
    timerDisplay.classList.remove('running');
    
    const secs = (elapsedMs / 1000).toFixed(3);
    const formattedSeq = state.sequence.join(' ');
    
    const t = translations[state.language];
    winnerText.textContent = isWin ? t.win : t.lose;
    secretRevealText.textContent = t.reveal(secs, formattedSeq);
    
    showPhase('gameOver');
}

function resetGame() {
    state.myReady = false;
    state.opponentReady = false;
    state.sequence = [];
    state.myGuessed = [];
    state.opponentGuessed = [];
    state.gameActive = false;
    state.startTime = null;
    
    if (state.timerInterval) clearInterval(state.timerInterval);
    timerDisplay.classList.remove('running');
    timerDisplay.classList.remove('visible');
    timerDisplay.textContent = "00.000";
    
    guessInput.value = '';
    mySequenceContainer.innerHTML = '';
    opponentSequenceContainer.innerHTML = '';
    
    submitWordsBtn.disabled = false;
    updateLanguageUI();
    showPhase('lobby');
}

// Action Event Handlers
createRoomBtn.onclick = () => {
    state.myName = nameInput.value.trim() || "Host";
    
    state.sequenceLength = parseInt(sequenceLengthInput.value, 10) || 4;
    state.digits = parseInt(digitsInput.value, 10) || 2;
    state.showDuration = parseInt(showDurationInput.value, 10) || 5;
    
    const customCode = customRoomInput.value.trim();
    state.roomId = customCode || Math.floor(100 + Math.random() * 900).toString();
    state.isHost = true;
    
    initPeer('remembernumbers-v1-' + state.roomId);
};

joinRoomBtn.onclick = () => {
    state.myName = nameInput.value.trim() || "Guest";
    
    state.isHost = false;
    initPeer();
};

submitWordsBtn.onclick = () => {
    state.myReady = true;
    submitWordsBtn.disabled = true;
    submitWordsBtn.textContent = translations[state.language].waitingOppReady;
    
    state.conn.send({ type: 'ready' });
    checkStartGame();
};

guessBtn.onclick = handleGuessSubmit;
guessInput.onkeypress = (e) => {
    if (e.key === 'Enter') handleGuessSubmit();
};

playAgainBtn.onclick = () => {
    state.conn.send({ type: 'play-again' });
    resetGame();
};

document.getElementById('web-logo').onclick = () => {
    if (state.peer) {
        try {
            state.peer.destroy();
        } catch (e) {
            console.error(e);
        }
    }
    window.location.href = '../../index.html';
};

// Check for room code in URL on page load
window.addEventListener('load', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomParam = urlParams.get('room');
    if (roomParam) {
        roomCodeInput.value = roomParam;
        
        // Hide config elements
        document.querySelectorAll('.host-config').forEach(el => el.style.display = 'none');
        if (createRoomBtn) createRoomBtn.style.display = 'none';
        const divider = document.querySelector('.divider');
        if (divider) divider.style.display = 'none';
        if (roomCodeInput) roomCodeInput.style.display = 'none';
        
        const roomLabel = document.querySelector('.join-input label');
        if (roomLabel) roomLabel.style.display = 'none';
        
        if (joinRoomBtn) {
            joinRoomBtn.classList.remove('secondary');
            joinBtn = joinRoomBtn;
            joinBtn.classList.add('primary');
        }
        
        updateWelcomeText(roomParam);
    }
    
    updateThemeUI();
    updateLanguageUI();
});
