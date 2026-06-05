// Game State
const state = {
    peer: null,
    conn: null,
    isHost: false,
    roomCode: '',
    myWords: [],
    opponentWords: [], // Objects with full phrase and revealed status
    currentTurn: '', // 'me' or 'opponent'
    phase: 'home',
    opponentReady: false,
    meReady: false,
    isConnected: false,
    language: localStorage.getItem('language') || 'en',
    myRevealedIndices: [],
    chainLength: 5,
    timeLimit: 45,
    myName: '',
    opponentName: '',
    timer: null,
    timeLeft: 0,
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
    gameOver: document.getElementById('game-over-phase'),
};

const lobbyStatus = document.getElementById('lobby-status');
const roomInfo = document.getElementById('room-info');
const displayRoomCode = document.getElementById('display-room-code');
const wordSubmission = document.getElementById('word-submission');
const wordInputsContainer = document.getElementById('word-inputs');
const turnIndicator = document.getElementById('turn-indicator');
const messageLog = document.getElementById('message-log');
const opponentWordsDisplay = document.getElementById('opponent-words-display');
const myWordsDisplay = document.getElementById('my-words-display');
const guessInputContainer = document.getElementById('guess-input-container');
const guessInput = document.getElementById('guess-input');
const winnerText = document.getElementById('winner-text');
const chainLengthInput = document.getElementById('chain-length-input');
const labelChainLength = document.getElementById('label-chain-length');
const timeLimitInput = document.getElementById('time-limit-input');
const labelTimeLimit = document.getElementById('label-time-limit');
const addWordBtn = document.getElementById('add-word-btn');
const nameInput = document.getElementById('name-input');
const labelName = document.getElementById('label-name');
const timerDisplay = document.getElementById('timer-display');
const toast = document.getElementById('toast');
const copyLinkBtn = document.getElementById('copy-link-btn');

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

const translations = {
    en: {
        title: "Guess Word",
        welcome: "Welcome to Guess Word",
        createRoom: "Create Room",
        or: "OR",
        joinRoom: "Join Room",
        enterCode: "Enter Room ID",
        waitingOpponent: "Waiting for Opponent...",
        roomCodeLabel: "Room Code:",
        submitChain: "Submit Your Word Chain",
        hintRule: "Each phrase must have 1-2 parts. Tail-head rule: Last word of previous phrase = first word of next phrase.",
        addWord: "Add Word",
        ready: "Ready!",
        waitingForOpp: "Waiting for Opponent...",
        opponentWords: "Opponent's Words",
        yourWords: "Your Words",
        guessPlaceholder: "Guess a word...",
        guessBtn: "Guess",
        waitingTurns: "Waiting for turns...",
        yourTurn: "Your Turn! Guess {name}'s word.",
        oppTurn: "{name}'s Turn... Please wait.",
        correctGuess: "Correct! \"{word}\" revealed.",
        incorrectGuess: "Incorrect guess.",
        oppCorrect: "{name} correctly guessed \"{word}\"!",
        oppIncorrect: "{name} guessed incorrectly.",
        winner: "{name} Wins! 🎉",
        playAgain: "Play Again",
        connecting: "Connecting to Room {code}...",
        oppConnected: "Opponent Connected!",
        atLeast2: "Words must be at least 2 characters",
        ruleBroken: "Tail-head rule broken! (\"{prev}\" -> \"{curr}\")",
        peerError: "PeerJS Error: ",
        roomInUse: "Room code already in use or error. Try again.",
        disconnected: "Opponent disconnected",
        chainLength: "Chain Length:",
        timeLimit: "Time Limit (s):",
        yourName: "Your Name:",
        namePlaceholder: "Enter your name",
        defaultHost: "Player #1",
        defaultGuest: "Player #2",
        timeOut: "Time's up! Turn switched.",
        max2Parts: "Each phrase can have a maximum of 2 parts (syllables).",
        customRoomLabel: "Room ID:",
        customRoomPlaceholder: "eg. 111",
        copyLink: "Copy Link",
        linkCopied: "Link copied!"
    },
    vi: {
        title: "Đoán Từ",
        welcome: "Chào mừng đến với Đoán Từ",
        createRoom: "Tạo Phòng",
        or: "HOẶC",
        joinRoom: "Vào Phòng",
        enterCode: "Nhập mã phòng",
        waitingOpponent: "Đang đợi đối thủ...",
        roomCodeLabel: "Mã phòng:",
        submitChain: "Gửi chuỗi từ của bạn",
        hintRule: "Mỗi cụm từ có tối đa 2 từ. Quy tắc nối đuôi: Từ cuối của cụm trước bằng từ đầu của cụm sau.",
        addWord: "Thêm từ",
        ready: "Sẵn sàng!",
        waitingForOpp: "Đang đợi đối thủ...",
        opponentWords: "Từ của đối thủ",
        yourWords: "Từ của bạn",
        guessPlaceholder: "Đoán một từ...",
        guessBtn: "Đoán",
        waitingTurns: "Đang đợi lượt...",
        yourTurn: "Lượt của bạn! Hãy đoán từ của {name}.",
        oppTurn: "Lượt của {name}... Vui lòng đợi.",
        correctGuess: "Chính xác! Đã mở khóa từ \"{word}\".",
        incorrectGuess: "Đoán sai rồi.",
        oppCorrect: "{name} đã đoán đúng từ \"{word}\"!",
        oppIncorrect: "{name} đã đoán sai.",
        winner: "{name} đã thắng! 🎉",
        playAgain: "Chơi lại",
        connecting: "Đang kết nối tới phòng {code}...",
        oppConnected: "Đối thủ đã kết nối!",
        atLeast2: "Từ phải có ít nhất 2 ký tự",
        ruleBroken: "Quy tắc nối đuôi bị vi phạm! (\"{prev}\" -> \"{curr}\")",
        peerError: "Lỗi PeerJS: ",
        roomInUse: "Mã phòng đã được sử dụng hoặc có lỗi. Thử lại.",
        disconnected: "Đối thủ đã ngắt kết nối",
        chainLength: "Độ dài chuỗi:",
        timeLimit: "Thời gian (giây):",
        yourName: "Tên của bạn:",
        namePlaceholder: "Nhập tên của bạn",
        defaultHost: "Người chơi #1",
        defaultGuest: "Người chơi #2",
        timeOut: "Hết thời gian! Chuyển lượt.",
        max2Parts: "Mỗi cụm từ chỉ được có tối đa 2 từ.",
        customRoomLabel: "Mã phòng:",
        customRoomPlaceholder: "VD: 111",
        copyLink: "Copy Link",
        linkCopied: "Link copied!"
    }
};

function updateLanguageUI() {
    const t = translations[state.language];
    document.documentElement.lang = state.language;
    document.querySelector('h1').textContent = t.title;

    // Home Phase
    // Check if roomParam exists to show dynamic welcome text, otherwise default
    const urlParams = new URLSearchParams(window.location.search);
    const roomParam = urlParams.get('room');
    if (roomParam) {
        updateWelcomeText(roomParam);
    } else {
        document.getElementById('welcome-text').textContent = t.welcome;
    }
    document.getElementById('create-room-btn').textContent = t.createRoom;
    document.querySelector('.divider').textContent = t.or;
    document.getElementById('room-code-input').placeholder = t.enterCode;
    document.getElementById('join-room-btn').textContent = t.joinRoom;
    labelChainLength.textContent = t.chainLength;
    labelTimeLimit.textContent = t.timeLimit;
    labelName.textContent = t.yourName;
    nameInput.placeholder = t.namePlaceholder;
    document.getElementById('label-custom-room').textContent = t.customRoomLabel;

    // Lobby Phase
    if (state.isConnected) {
        lobbyStatus.textContent = t.oppConnected;
    } else if (state.phase === 'lobby' && !state.isHost) {
        // Joining state
        if (lobbyStatus.textContent.includes('...')) {
            // Keep current establishing text
        } else {
            lobbyStatus.textContent = t.waitingOpponent;
        }
    } else {
        lobbyStatus.textContent = t.waitingOpponent;
    }

    document.querySelector('#room-info p').firstChild.textContent = t.roomCodeLabel + ' ';
    document.querySelector('#word-submission h3').textContent = t.submitChain;
    document.querySelector('.hint').textContent = t.hintRule;
    addWordBtn.textContent = t.addWord;
    document.getElementById('submit-words-btn').textContent = state.meReady ? t.waitingForOpp : t.ready;
    if (copyLinkBtn) copyLinkBtn.textContent = t.copyLink;

    // Battle Phase
    document.querySelector('.opponent-area h3').textContent = state.opponentName || (state.isHost ? t.defaultGuest : t.defaultHost);
    document.querySelector('.my-area h3').textContent = state.myName || (state.isHost ? t.defaultHost : t.defaultGuest);
    document.getElementById('guess-input').placeholder = t.guessPlaceholder;
    document.getElementById('guess-btn').textContent = t.guessBtn;
    updateTurnIndicator();

    // Game Over Phase
    document.getElementById('play-again-btn').textContent = t.playAgain;
    if (state.phase === 'gameOver') {
        const iWon = state.opponentWords.every(w => w.revealed);
        const winName = iWon ? state.myName : state.opponentName;
        winnerText.textContent = t.winner.replace('{name}', winName);
    }

    // Update lang button text (target language)
    document.getElementById('lang-toggle').textContent = state.language === 'en' ? 'VI' : 'US';
}

document.getElementById('lang-toggle').onclick = () => {
    state.language = state.language === 'en' ? 'vi' : 'en';
    updateLanguageUI();
};

document.getElementById('web-logo').onclick = () => {
    window.location.href = '../../index.html';
};

const themeToggle = document.getElementById('theme-toggle');
function updateThemeUI() {
    const isDark = state.theme === 'dark';
    document.documentElement.classList.toggle('dark-mode', isDark);
    themeToggle.textContent = isDark ? '☀️' : '🌙';
}

themeToggle.onclick = () => {
    state.theme = (state.theme === 'light') ? 'dark' : 'light';
    localStorage.setItem('theme', state.theme);
    updateThemeUI();
};

// Copy room link functionality
copyLinkBtn.onclick = async () => {
    const t = translations[state.language];
    const baseUrl = window.location.origin + window.location.pathname;
    const shareUrl = `${baseUrl}?room=${state.roomCode}`;

    try {
        await navigator.clipboard.writeText(shareUrl);
        const originalText = copyLinkBtn.textContent;
        copyLinkBtn.textContent = t.linkCopied;
        setTimeout(() => {
            copyLinkBtn.textContent = originalText;
        }, 2000);
    } catch (err) {
        console.error('Failed to copy:', err);
        showToast(t.linkCopied, true); // Still show feedback even if copy fails
    }
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
        // Fallback to basic STUN servers if API fails
        return [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            { urls: 'stun:stun3.l.google.com:19302' },
            { urls: 'stun:stun.cloudflare.com:3478' }
        ];
    }
}

// Initialize PeerJS
async function initPeer(id = null) {
    const iceServers = await getIceServers();

    // Let PeerJS handle the host/port/secure defaults automatically for better Geo-routing,
    // but keep our custom ICE servers (STUN/TURN).
    const peerOptions = {
        debug: 2, // Moderate logging
        host: '0.peerjs.com',
        port: 443,
        secure: true,
        config: {
            'iceServers': iceServers,
            sdpSemantics: 'unified-plan'
        }
    };

    state.peer = new Peer(id, peerOptions);
    const t = translations[state.language];

    // Signaling Heartbeat to keep connection alive on mobile
    let heartbeat;
    state.peer.on('open', (peerId) => {
        console.log('Peer assigned ID:', peerId);

        heartbeat = setInterval(() => {
            if (state.peer && !state.peer.destroyed) {
                state.peer.socket.send({ type: 'HEARTBEAT' });
            }
        }, 5000);

        if (state.isHost) {
            displayRoomCode.textContent = state.roomCode;
            roomInfo.style.display = 'flex';
            lobbyStatus.textContent = t.waitingOpponent;
        }
    });

    state.peer.on('connection', (conn) => {
        if (state.conn && state.isConnected && !state.isReconnecting) {
            conn.close();
            return;
        }
        if (state.conn) {
            try { state.conn.close(); } catch(e){}
        }
        lobbyStatus.textContent = state.language === 'en' ? "Establishing P2P link..." : "Đang thiết lập kết nối!";
        setupConnection(conn);
    });

    state.peer.on('disconnected', () => {
        console.warn("Signaling disconnected. Attempting reconnect...");
        state.peer.reconnect();
    });

    state.peer.on('error', (err) => {
        const t = translations[state.language];
        clearInterval(heartbeat);

        if (err.type === 'unavailable-id') {
            alert(t.roomInUse);
            location.reload();
        } else if (err.type === 'peer-unavailable') {
            alert(state.language === 'en' ? "Room not found. Check the code!" : "Không tìm thấy phòng. Vui lòng kiểm tra lại mã!");
        } else if (err.type === 'network') {
            alert(state.language === 'en' ? "Network error. PeerJS server might be down or connection blocked." : "Lỗi mạng. Máy chủ PeerJS có thể đang gián đoạn hoặc kết nối bị chặn.");
        } else {
            alert(t.peerError + err.type);
        }
    });
}

function handleConnectionClose() {
    if (state.isReconnecting) return;
    
    if (state.phase === 'home' || state.phase === 'gameOver') {
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
    
    if (state.timer) clearInterval(state.timer);
    
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
                const connectOptions = { reliable: true };
                const conn = state.peer.connect('guessword-v1-' + state.roomCode, connectOptions);
                setupConnection(conn);
            }
        }, 3000);
    }
}

function setupConnection(conn) {
    state.conn = conn;
    const t = translations[state.language];
    let connTimeout;

    const handleOpen = () => {
        if (connTimeout) clearTimeout(connTimeout);
        console.log("P2P Bridge opened!");
        
        if (state.isReconnecting) {
            state.isReconnecting = false;
            if (state.reconnectTimer) clearInterval(state.reconnectTimer);
            if (state.reconnectInterval) clearInterval(state.reconnectInterval);
            hideToast();
            showToast(state.language === 'en' ? "Reconnected successfully!" : "Kết nối lại thành công!");
            
            if (state.phase === 'battle') {
                startTurn();
            }
        }
        
        state.isConnected = true;
        lobbyStatus.textContent = t.oppConnected;
        roomInfo.style.display = 'none';
        wordSubmission.style.display = 'block';

        setTimeout(() => {
            if (state.isHost) {
                renderWordInputs();
            } else {
                state.conn.send({ type: 'INFO', name: state.myName });
                renderWordInputs();
            }
        }, 300);
    };

    if (state.conn.open) {
        handleOpen();
    } else {
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
        handleData(data);
    });

    state.conn.on('close', () => {
        handleConnectionClose();
    });

    state.conn.on('error', (err) => {
        console.error("Connection Error:", err);
        if (connTimeout) clearTimeout(connTimeout);
    });
}

function handleData(data) {
    console.log('Received:', data);
    switch (data.type) {
        case 'INFO':
            if (data.chainLength) {
                state.chainLength = data.chainLength;
                renderWordInputs();
            }
            if (data.timeLimit) {
                state.timeLimit = data.timeLimit;
            }
            if (data.name) {
                state.opponentName = data.name;
                updateLanguageUI();

                // If I am the host, send my settings to the joiner now that we have their info
                if (state.isHost && state.conn && state.conn.open) {
                    state.conn.send({
                        type: 'INFO',
                        chainLength: state.chainLength,
                        timeLimit: state.timeLimit,
                        name: state.myName
                    });
                }
            }
            break;
        case 'READY':
            state.opponentReady = true;
            state.opponentWords = data.words.map(w => ({
                full: w.full,
                revealed: false
            }));
            checkAllReady();
            break;
        case 'START_GAME':
            state.currentTurn = data.firstTurn === 'p2' ? 'me' : 'opponent';
            startBattle();
            break;
        case 'GUESS':
            handleOpponentGuess(data.word);
            break;
        case 'GUESS_RESULT':
            handleMyGuessResult(data.correct, data.index, data.fullWord);
            break;
        case 'TIME_OUT':
            handleOpponentTimeOut();
            break;
        case 'PLAY_AGAIN':
            resetGame();
            break;
    }
}

// Phase Management
function showPhase(phaseName) {
    Object.keys(phases).forEach(p => {
        phases[p].classList.toggle('active', p === phaseName);
    });
    state.phase = phaseName;
    // Show/hide timer based on phase
    timerDisplay.classList.toggle('visible', phaseName === 'battle');
}

// Home Phase Logic
document.getElementById('create-room-btn').onclick = async () => {
    let name = nameInput.value.trim();
    const t = translations[state.language];

    state.myName = name || "Host";
    state.isHost = true;

    // Destroy existing peer if it exists
    if (state.peer) {
        state.peer.destroy();
    }

    // Use custom room code if provided, otherwise random numeric
    const customCode = document.getElementById('custom-room-input').value.trim();
    state.roomCode = customCode || Math.floor(100 + Math.random() * 900).toString();

    state.chainLength = parseInt(chainLengthInput.value) || 5;
    state.timeLimit = parseInt(timeLimitInput.value) || 45;
    await initPeer('guessword-v1-' + state.roomCode);
    showPhase('lobby');
};

document.getElementById('join-room-btn').onclick = async () => {
    let name = nameInput.value.trim();
    const t = translations[state.language];

    const code = document.getElementById('room-code-input').value.trim();
    if (!code) return alert(t.enterCode);

    state.myName = name || "Guest";
    state.isHost = false;
    state.roomCode = code;

    // Destroy existing peer if it exists
    if (state.peer) {
        state.peer.destroy();
    }

    await initPeer();

    state.peer.on('open', () => {
        lobbyStatus.textContent = state.language === 'en' ? "Establishing P2P link..." : "Đang thiết lập kết nối!";
        const connectOptions = {
            reliable: true
            // Removed explicit serialization to let PeerJS use optimized binary-pack
        };
        const conn = state.peer.connect('guessword-v1-' + state.roomCode, connectOptions);
        setupConnection(conn);
        showPhase('lobby');
    });
};

// Word Submission Logic
function renderWordInputs() {
    wordInputsContainer.innerHTML = '';
    for (let i = 0; i < state.chainLength; i++) {
        const row = document.createElement('div');
        row.className = 'word-row';
        row.innerHTML = `
            <span>${i + 1}.</span>
            <input type="text" class="chain-word" placeholder="Word ${i + 1}" data-index="${i}" aria-label="Từ thứ ${i + 1}">
        `;
        wordInputsContainer.appendChild(row);
    }
    // Hide add button since length is fixed by host
    addWordBtn.style.display = 'none';
}

document.getElementById('submit-words-btn').onclick = () => {
    const inputs = document.querySelectorAll('.chain-word');
    const words = Array.from(inputs).map(i => i.value.trim().toLowerCase());
    const t = translations[state.language];

    if (words.some(w => w.length < 2)) return alert(t.atLeast2);

    // Check part count (max 2 parts)
    for (let i = 0; i < words.length; i++) {
        const parts = words[i].split(/\s+/).filter(p => p.length > 0);
        if (parts.length > 2) {
            return alert(t.max2Parts);
        }
    }

    // Check tail-head rule (Word-based)
    for (let i = 1; i < words.length; i++) {
        const prev = words[i - 1];
        const curr = words[i];

        const prevParts = prev.split(/\s+/).filter(p => p.length > 0);
        const currParts = curr.split(/\s+/).filter(p => p.length > 0);

        const lastWordOfPrev = prevParts[prevParts.length - 1];
        const firstWordOfCurr = currParts[0];

        if (lastWordOfPrev !== firstWordOfCurr) {
            return alert(t.ruleBroken.replace('{prev}', lastWordOfPrev).replace('{curr}', firstWordOfCurr));
        }
    }

    state.myWords = words;
    state.meReady = true;

    state.conn.send({
        type: 'READY',
        words: words.map(w => ({ full: w }))
    });

    document.getElementById('submit-words-btn').disabled = true;
    document.getElementById('submit-words-btn').textContent = t.waitingForOpp;
    checkAllReady();
};

function checkAllReady() {
    if (state.meReady && state.opponentReady) {
        if (state.isHost) {
            const firstTurn = Math.random() < 0.5 ? 'p1' : 'p2';
            state.conn.send({ type: 'START_GAME', firstTurn: firstTurn });
            state.currentTurn = (firstTurn === 'p1' ? 'me' : 'opponent');
            startBattle();
        }
    }
}

// Battle Logic
function maskSubWord(word, revealed) {
    if (revealed) return word;
    if (!word) return "";
    return word[0] + "_".repeat(word.length - 1) + ` (${word.length})`;
}

function startBattle() {
    showPhase('battle');
    renderBattlefield();
    startTurn();
}

function startTurn() {
    updateTurnIndicator();
    if (state.currentTurn === 'me') {
        hideToast(); // Clear timeout notification when turn returns
        triggerFlash();
        timerDisplay.classList.add('my-turn');
    } else {
        timerDisplay.classList.remove('my-turn');
    }
    clearInterval(state.timer);
    state.timeLeft = state.timeLimit;
    updateTimerDisplay();

    state.timer = setInterval(() => {
        state.timeLeft--;
        updateTimerDisplay();
        if (state.timeLeft <= 0) {
            clearInterval(state.timer);
            if (state.currentTurn === 'me') {
                handleMyTimeOut();
            }
        }
    }, 1000);
}

function updateTimerDisplay() {
    timerDisplay.textContent = state.timeLeft;
}

function handleMyTimeOut() {
    const t = translations[state.language];
    showToast(t.timeOut, true); // No longer persistent
    state.conn.send({ type: 'TIME_OUT' });
    state.currentTurn = 'opponent';
    startTurn();
}

function handleOpponentTimeOut() {
    state.currentTurn = 'me';
    startTurn();
}

function renderBattlefield() {
    opponentWordsDisplay.innerHTML = '';
    state.opponentWords.forEach((w, i) => {
        const div = document.createElement('div');
        div.className = 'word-display' + (w.revealed ? ' revealed' : '');

        const parts = w.full.split(/\s+/).filter(p => p.length > 0);
        const isPrevPhraseGuessed = (i === 0 || state.opponentWords[i - 1].revealed);

        const maskedParts = parts.map((part, partIdx) => {
            if (partIdx === 0) {
                // First part of phrase: visible if i=0 or previous phrase revealed
                return maskSubWord(part, isPrevPhraseGuessed);
            } else {
                // Other parts: visible only if current phrase revealed
                return maskSubWord(part, w.revealed);
            }
        });

        div.textContent = maskedParts.join(' ');
        opponentWordsDisplay.appendChild(div);
    });

    myWordsDisplay.innerHTML = '';
    state.myWords.forEach((w, i) => {
        const div = document.createElement('div');
        const isGuessedByOpponent = state.myRevealedIndices && state.myRevealedIndices.includes(i);
        div.className = 'word-display' + (isGuessedByOpponent ? ' opponent-guessed' : '');
        div.textContent = w;
        myWordsDisplay.appendChild(div);
    });
}

function updateTurnIndicator() {
    const t = translations[state.language];
    const oppName = state.opponentName || (state.isHost ? t.defaultGuest : t.defaultHost);
    if (state.currentTurn === 'me') {
        turnIndicator.textContent = t.yourTurn.replace('{name}', oppName);
        guessInputContainer.style.display = 'flex';
    } else if (state.currentTurn === 'opponent') {
        turnIndicator.textContent = t.oppTurn.replace('{name}', oppName);
        guessInputContainer.style.display = 'none';
    } else {
        turnIndicator.textContent = state.language === 'en' ? "Waiting..." : "Đang đợi...";
    }
}

document.getElementById('guess-btn').onclick = makeGuess;
guessInput.onkeypress = (e) => { if (e.key === 'Enter') makeGuess(); };

function makeGuess() {
    const word = guessInput.value.trim().toLowerCase();
    if (!word) return;

    state.conn.send({ type: 'GUESS', word: word });
    guessInput.value = '';
}

function handleOpponentGuess(guess) {
    const t = translations[state.language];
    const oppName = state.opponentName || (state.isHost ? t.defaultGuest : t.defaultHost);
    if (!state.myRevealedIndices) state.myRevealedIndices = [];

    const nextIndex = state.myWords.findIndex((w, i) => !state.myRevealedIndices.includes(i));

    if (nextIndex !== -1 && state.myWords[nextIndex] === guess) {
        state.myRevealedIndices.push(nextIndex);
        state.conn.send({ type: 'GUESS_RESULT', correct: true, index: nextIndex, fullWord: guess });

        // Check if all my words are guessed (I lost)
        if (state.myRevealedIndices.length === state.myWords.length) {
            clearInterval(state.timer);
            renderBattlefield();
            showGameOver(false); // Immediate transition for loser
        } else {
            showToast(t.oppCorrect.replace('{name}', oppName).replace('{word}', guess));
            renderBattlefield();
            startTurn(); // Reset timer on correct guess
        }
        correctSound.play().catch(e => console.warn("Sound play deferred until user interaction"));
    } else {
        wrongSound.play().catch(e => console.warn("Sound play deferred until user interaction"));
            state.conn.send({ type: 'GUESS_RESULT', correct: false });
            showToast(t.oppIncorrect.replace('{name}', oppName), true);
            state.currentTurn = 'me';
            startTurn();
    }
}

function handleMyGuessResult(correct, index, fullWord) {
    const t = translations[state.language];
    if (correct) {
        correctSound.play().catch(e => console.warn("Sound play deferred until user interaction"));
        state.opponentWords[index].revealed = true;
        renderBattlefield();
        if (!checkWin()) {
            showToast(t.correctGuess.replace('{word}', fullWord));
            startTurn(); // Reset timer on correct guess
        }
        // If checkWin is true, showGameOver(true) is already called inside checkWin immediately
    } else {
        wrongSound.play().catch(e => console.warn("Sound play deferred until user interaction"));
        showToast(t.incorrectGuess, true);
        state.currentTurn = 'opponent';
        startTurn();
    }
}

let toastTimeout;
function showToast(msg, isError = false, persistent = false) {
    toast.textContent = msg;
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
    toast.classList.remove('show');
}

function checkWin() {
    if (state.opponentWords.every(w => w.revealed)) {
        clearInterval(state.timer);
        showGameOver(true);
        return true;
    }
    return false;
}

// Game Over Phase
function showGameOver(iWon) {
    showPhase('gameOver');
    const t = translations[state.language];
    const winName = iWon ? state.myName : state.opponentName;
    winnerText.textContent = t.winner.replace('{name}', winName);
}

document.getElementById('play-again-btn').onclick = () => {
    state.conn.send({ type: 'PLAY_AGAIN' });
    resetGame();
};

function resetGame() {
    clearInterval(state.timer);
    timerDisplay.classList.remove('my-turn');
    state.meReady = false;
    state.opponentReady = false;
    state.myWords = [];
    state.opponentWords = [];
    state.myRevealedIndices = [];
    state.opponentReady = false;
    state.meReady = false;
    wordSubmission.style.display = 'block';
    document.getElementById('submit-words-btn').disabled = false;
    document.getElementById('submit-words-btn').textContent = translations[state.language].ready;
    showPhase('lobby');
}

function triggerFlash() {
    const flash = document.getElementById('flash-overlay');
    flash.classList.add('active');
    setTimeout(() => flash.classList.remove('active'), 800);
}

// Init
state.language = localStorage.getItem('language') || 'en';
updateThemeUI();
updateLanguageUI();
if (state.myName) nameInput.value = state.myName;
