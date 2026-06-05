/**
 * Quick Math - P2P Logic
 * Millisecond precise mental math battle
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
    
    // Game Configs
    difficulty: '2', // '1', '2', '3', 'random'
    questionCount: 5, // 3, 5, 10
    timeLimit: 60, // in seconds

    // Game State
    questions: [],
    myCurrentIndex: 0,
    oppCurrentIndex: 0,
    startTime: 0,
    myFinishTime: null,
    oppFinishTime: null,
    mySolvedCount: 0,
    oppSolvedCount: 0,
    gameActive: false,
    timerInterval: null,
    
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
const nameInput = document.getElementById('name-input');
const difficultyInput = document.getElementById('difficulty-input');
const questionCountInput = document.getElementById('question-count-input');
const timeLimitInput = document.getElementById('time-limit-input');
const customRoomInput = document.getElementById('custom-room-input');
const roomCodeInput = document.getElementById('room-code-input');
const createRoomBtn = document.getElementById('create-room-btn');
const joinRoomBtn = document.getElementById('join-room-btn');
const displayRoomCode = document.getElementById('display-room-code');
const startGameBtn = document.getElementById('start-game-btn');
const lobbyControls = document.getElementById('lobby-controls');
const timerDisplay = document.getElementById('timer-display');
const mathAnswerInput = document.getElementById('math-answer-input');
const submitAnswerBtn = document.getElementById('submit-answer-btn');
const winnerText = document.getElementById('winner-text');
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
        title: "Quick Math",
        welcome: "Welcome to Quick Math",
        nameLabel: "Your Name:",
        namePlaceholder: "Enter your name",
        diffLabel: "Difficulty:",
        questionsLabel: "Questions:",
        timeLabel: "Time Limit:",
        roomLabel: "Room ID:",
        create: "Create Room",
        join: "Join Room",
        waitingOpp: "Waiting for Opponent...",
        oppConnected: "Opponent Connected!",
        roomIdLabel: "Room ID:",
        btnStart: "Start Game",
        lobbyConfigHint: (diff, count, time) => `Difficulty: ${diff} digit(s) | Questions: ${count} | Time: ${time}s`,
        progressYou: "You:",
        progressOpp: "Opponent:",
        questionTitle: (num) => `Question ${num}`,
        inputHint: "Type answer and press Enter",
        btnSubmit: "Submit",
        win: "You Won! 🎉",
        lose: "You Lost...",
        draw: "It's a Draw! 🤝",
        statYou: "You:",
        statOpp: "Opponent:",
        playAgain: "Play Again",
        copyLink: "Copy Link",
        linkCopied: "Link copied!",
        shareVia: "Send Via",
        shareTitle: "Simple Games - Quick Math",
        shareText: (code) => `Play Quick Math with me! Room ID: ${code}`,
        hostBadge: "Host",
        guestBadge: "Guest",
        waitingStatus: "Waiting...",
        readyStatus: "Ready",
        diff1: "1 digit",
        diff2: "2 digits",
        diff3: "3 digits",
        diffRandom: "Random"
    },
    vi: {
        title: "Tính Nhẩm",
        welcome: "Chào mừng đến với Tính Nhẩm",
        nameLabel: "Tên của bạn:",
        namePlaceholder: "Nhập tên của bạn",
        diffLabel: "Độ khó:",
        questionsLabel: "Số câu hỏi:",
        timeLabel: "Thời gian:",
        roomLabel: "Mã phòng:",
        create: "Tạo Phòng",
        join: "Vào Phòng",
        waitingOpp: "Đang đợi đối thủ...",
        oppConnected: "Đối thủ đã kết nối!",
        roomIdLabel: "Mã phòng:",
        btnStart: "Bắt Đầu Game",
        lobbyConfigHint: (diff, count, time) => `Độ khó: ${diff} chữ số | Số câu: ${count} | Thời gian: ${time}s`,
        progressYou: "Bạn:",
        progressOpp: "Đối thủ:",
        questionTitle: (num) => `Câu ${num}`,
        inputHint: "Nhập đáp án và nhấn Enter hoặc nút gửi",
        btnSubmit: "Gửi",
        win: "Bạn Thắng! 🎉",
        lose: "Bạn Thua...",
        draw: "Hòa nhau! 🤝",
        statYou: "Bạn:",
        statOpp: "Đối thủ:",
        playAgain: "Chơi lại",
        copyLink: "Copy Link",
        linkCopied: "Link copied!",
        shareVia: "Gửi qua",
        shareTitle: "Simple Games - Tính Nhẩm",
        shareText: (code) => `Chơi Tính Nhẩm cùng tôi nhé! Mã phòng: ${code}`,
        hostBadge: "Host",
        guestBadge: "Khách",
        waitingStatus: "Đang đợi...",
        readyStatus: "Sẵn sàng",
        diff1: "1 chữ số",
        diff2: "2 chữ số",
        diff3: "3 chữ số",
        diffRandom: "Ngẫu nhiên"
    }
};

function getDifficultyLabel(diffVal) {
    const t = translations[state.language];
    if (diffVal === '1') return t.diff1;
    if (diffVal === '2') return t.diff2;
    if (diffVal === '3') return t.diff3;
    return t.diffRandom;
}

function showPhase(phaseName) {
    state.currentPhase = phaseName;
    Object.keys(phases).forEach(p => {
        phases[p].classList.toggle('active', p === phaseName);
    });
}

function updateLanguageUI() {
    const t = translations[state.language];
    document.documentElement.lang = state.language;
    document.getElementById('game-title').textContent = t.title;
    
    const urlParams = new URLSearchParams(window.location.search);
    const roomParam = urlParams.get('room');
    if (roomParam) {
        updateWelcomeText(roomParam);
    } else {
        document.getElementById('welcome-text').textContent = t.welcome;
    }
    
    document.getElementById('label-name').textContent = t.nameLabel;
    nameInput.placeholder = t.namePlaceholder;
    document.getElementById('label-difficulty').textContent = t.diffLabel;
    document.getElementById('label-question-count').textContent = t.questionsLabel;
    document.getElementById('label-time-limit').textContent = t.timeLabel;
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
    document.getElementById('game-config-hint').textContent = t.lobbyConfigHint(
        getDifficultyLabel(state.difficulty),
        state.questionCount,
        state.timeLimit
    );
    startGameBtn.textContent = t.btnStart;
    
    // Play Phase
    document.getElementById('label-progress-you').textContent = t.progressYou;
    document.getElementById('label-progress-opp').textContent = t.progressOpp;
    document.getElementById('input-hint').textContent = t.inputHint;
    submitAnswerBtn.textContent = t.btnSubmit;
    
    // Game Over Phase
    playAgainBtn.textContent = t.playAgain;
    if (copyLinkBtn) copyLinkBtn.textContent = t.copyLink;
    if (shareRoomBtn) shareRoomBtn.textContent = t.shareVia;
    document.getElementById('stat-you-label').textContent = t.statYou;
    document.getElementById('stat-opp-label').textContent = t.statOpp;

    // Badges
    document.querySelector('.host-badge').textContent = t.hostBadge;
    if (!state.isHost) {
        document.querySelector('.guest-badge').textContent = t.guestBadge;
    }
    
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

// TURN Credentials
let cachedIceServers = null;
async function getIceServers() {
    if (cachedIceServers) return cachedIceServers;
    try {
        const response = await fetch("https://daohieuit.metered.live/api/v1/turn/credentials?apiKey=8ebe79943f37e5a240441eb50a579fb8877a");
        cachedIceServers = await response.json();
        return cachedIceServers;
    } catch (e) {
        console.error("Failed to fetch TURN credentials:", e);
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
        } else {
            connectToHost('quickmath-v1-' + roomCodeInput.value.trim());
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
        console.warn("Disconnected, reconnecting...");
        state.peer.reconnect();
    });

    state.peer.on('error', (err) => {
        clearInterval(heartbeat);
        console.error(err);
        if (err.type === 'unavailable-id') {
            alert(state.language === 'en' ? "Room code already in use or error." : "Mã phòng đã được sử dụng hoặc có lỗi.");
            location.reload();
        } else if (err.type === 'peer-unavailable') {
            alert(state.language === 'en' ? "Room not found." : "Không tìm thấy phòng.");
            location.reload();
        } else if (err.type === 'network') {
            alert(state.language === 'en' ? "Network error." : "Lỗi mạng.");
            location.reload();
        } else {
            alert("PeerJS Error: " + err.type);
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
            if (state.peer && !state.peer.destroyed) {
                if (state.conn) {
                    try { state.conn.close(); } catch(e){}
                }
                state.conn = state.peer.connect('quickmath-v1-' + state.roomId, { reliable: true });
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
            if (state.gameActive) {
                resumeTimer();
            }
        }
        state.isConnected = true;
        
        if (state.isHost) {
            state.conn.send({
                type: 'init-game',
                config: { difficulty: state.difficulty, count: state.questionCount, time: state.timeLimit, hostName: state.myName }
            });
            lobbyControls.style.display = 'block';
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
                alert(state.language === 'en' ? "Connection timed out." : "Kết nối quá hạn.");
                location.reload();
            }
        }, 20000);
        state.conn.on('open', handleOpen);
    }

    state.conn.on('data', (data) => {
        switch (data.type) {
            case 'init-game':
                state.difficulty = data.config.difficulty;
                state.questionCount = data.config.count;
                state.timeLimit = data.config.time;
                state.opponentName = data.config.hostName;
                updateLanguageUI();
                break;
            case 'guest-name':
                state.opponentName = data.name;
                updateLanguageUI();
                if (state.isHost) {
                    state.conn.send({
                        type: 'init-game',
                        config: { difficulty: state.difficulty, count: state.questionCount, time: state.timeLimit, hostName: state.myName }
                    });
                }
                break;
            case 'start-game':
                state.questions = data.questions;
                startGame();
                break;
            case 'update-progress':
                state.oppCurrentIndex = data.index;
                state.oppSolvedCount = data.solved;
                updateProgressUI();
                break;
            case 'submit-result':
                state.oppFinishTime = data.finishTime;
                state.oppSolvedCount = data.solved;
                checkGameOver();
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

// Math generator helper
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRangeForDigits(digitCount) {
    if (digitCount === 1) return { min: 1, max: 9 };
    if (digitCount === 2) return { min: 10, max: 99 };
    return { min: 100, max: 999 };
}

function generateQuestions(count, diff) {
    const questions = [];
    const ops = ['+', '-', '*', '/'];
    
    for (let i = 0; i < count; i++) {
        let currentDiff = diff;
        if (diff === 'random') {
            currentDiff = getRandomInt(1, 3).toString();
        }
        
        const digitCount = parseInt(currentDiff, 10);
        const range = getRangeForDigits(digitCount);
        const op = ops[getRandomInt(0, ops.length - 1)];
        let equation = '';
        let answer = 0;
        
        if (op === '+') {
            const x = getRandomInt(range.min, range.max);
            const y = getRandomInt(range.min, range.max);
            equation = `${x} + ${y}`;
            answer = x + y;
        } else if (op === '-') {
            // Ensure positive result
            const x = getRandomInt(range.min, range.max);
            const y = getRandomInt(range.min, x);
            equation = `${x} - ${y}`;
            answer = x - y;
        } else if (op === '*') {
            // Limit secondary term for multiplication to prevent overload
            const x = getRandomInt(range.min, range.max);
            const y = getRandomInt(2, 9); // Always multiply by single digit 2-9
            equation = `${x} * ${y}`;
            answer = x * y;
        } else if (op === '/') {
            // division: result = x / y -> we generate result and y, then calculate x = y * result
            const y = getRandomInt(2, 9); // divider
            let result = 0;
            if (digitCount === 1) result = getRandomInt(1, 9);
            else if (digitCount === 2) result = getRandomInt(10, 99);
            else result = getRandomInt(100, 999);
            
            const x = y * result;
            equation = `${x} / ${y}`;
            answer = result;
        }
        
        questions.push({ equation, answer });
    }
    return questions;
}

// Gameplay control
function startGame() {
    showPhase('battle');
    state.gameActive = true;
    state.myCurrentIndex = 0;
    state.oppCurrentIndex = 0;
    state.myFinishTime = null;
    state.oppFinishTime = null;
    state.mySolvedCount = 0;
    state.oppSolvedCount = 0;
    
    document.getElementById('math-answer-input').value = '';
    
    timerDisplay.classList.add('visible');
    state.startTime = performance.now();
    
    updateProgressUI();
    showEquation();
    startTimer();
}

function startTimer() {
    if (state.timerInterval) clearInterval(state.timerInterval);
    
    state.timerInterval = setInterval(() => {
        const elapsed = (performance.now() - state.startTime) / 1000;
        const remaining = state.timeLimit - elapsed;
        
        if (remaining <= 0) {
            clearInterval(state.timerInterval);
            timerDisplay.textContent = "00.000";
            handleTimeout();
        } else {
            // Format remaining time as ss.cc
            const sec = Math.floor(remaining);
            const ms = Math.floor((remaining - sec) * 1000);
            timerDisplay.textContent = `${sec.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
        }
    }, 33); // ~30 fps update
}

function resumeTimer() {
    // Re-adjust start time after reconnection to match remaining elapsed
    // In simpler version, we just let it resume based on original performance.now
    startTimer();
}

function showEquation() {
    const currentQuestion = state.questions[state.myCurrentIndex];
    document.getElementById('question-number-display').textContent = translations[state.language].questionTitle(state.myCurrentIndex + 1);
    document.getElementById('equation-display').textContent = `${currentQuestion.equation} = ?`;
    mathAnswerInput.value = '';
    mathAnswerInput.focus();
}

function handleProgressUpdate() {
    state.myCurrentIndex++;
    state.mySolvedCount = state.myCurrentIndex;
    updateProgressUI();

    // Send progress to opponent
    state.conn.send({
        type: 'update-progress',
        index: state.myCurrentIndex,
        solved: state.mySolvedCount
    });

    if (state.myCurrentIndex >= state.questionCount) {
        // I finished all questions!
        const elapsed = (performance.now() - state.startTime) / 1000;
        state.myFinishTime = elapsed;
        clearInterval(state.timerInterval);
        
        state.conn.send({
            type: 'submit-result',
            finishTime: state.myFinishTime,
            solved: state.questionCount
        });
        
        showToast(state.language === 'en' ? "Finished! Waiting for opponent..." : "Đã hoàn thành! Đang đợi đối thủ...");
        checkGameOver();
    } else {
        showEquation();
    }
}

function handleTimeout() {
    state.gameActive = false;
    if (state.myFinishTime === null) {
        state.myFinishTime = "DNF"; // Did not finish
    }
    state.conn.send({
        type: 'submit-result',
        finishTime: state.myFinishTime,
        solved: state.mySolvedCount
    });
    checkGameOver();
}

function checkGameOver() {
    const myDone = (state.myFinishTime !== null || (performance.now() - state.startTime) / 1000 >= state.timeLimit);
    const oppDone = (state.oppFinishTime !== null);
    
    if (myDone && oppDone) {
        clearInterval(state.timerInterval);
        timerDisplay.classList.remove('visible');
        
        let isWin = false;
        let isDraw = false;
        
        // 1. Compare solved count first
        if (state.mySolvedCount > state.oppSolvedCount) {
            isWin = true;
        } else if (state.mySolvedCount < state.oppSolvedCount) {
            isWin = false;
        } else {
            // Solved counts are equal, compare times
            const myT = typeof state.myFinishTime === 'number' ? state.myFinishTime : 99999;
            const oppT = typeof state.oppFinishTime === 'number' ? state.oppFinishTime : 99999;
            
            if (myT < oppT) {
                isWin = true;
            } else if (myT > oppT) {
                isWin = false;
            } else {
                isDraw = true;
            }
        }
        
        // Render Game Over UI
        const t = translations[state.language];
        showPhase('gameOver');
        
        const winnerEl = document.getElementById('winner-text');
        if (isDraw) {
            winnerEl.textContent = t.draw;
        } else {
            winnerEl.textContent = isWin ? t.win : t.lose;
        }
        
        // Render times
        const formatTimeResult = (time, solved) => {
            if (typeof time === 'number') return `${time.toFixed(3)}s (${solved}/${state.questionCount})`;
            return `DNF (${solved}/${state.questionCount})`;
        };
        
        document.getElementById('stat-you-time').textContent = formatTimeResult(state.myFinishTime, state.mySolvedCount);
        document.getElementById('stat-opp-time').textContent = formatTimeResult(state.oppFinishTime, state.oppSolvedCount);
    }
}

function updateProgressUI() {
    // You Progress
    const myPct = (state.myCurrentIndex / state.questionCount) * 100;
    document.getElementById('my-progress-bar').style.width = `${myPct}%`;
    document.getElementById('my-progress-text').textContent = `${state.myCurrentIndex}/${state.questionCount}`;

    // Opponent Progress
    const oppPct = (state.oppCurrentIndex / state.questionCount) * 100;
    document.getElementById('opp-progress-bar').style.width = `${oppPct}%`;
    document.getElementById('opp-progress-text').textContent = `${state.oppCurrentIndex}/${state.questionCount}`;
}

// Check answer logic
function checkAnswer() {
    if (!state.gameActive || state.myCurrentIndex >= state.questionCount) return;
    
    const inputVal = parseInt(mathAnswerInput.value.trim(), 10);
    const correctAns = state.questions[state.myCurrentIndex].answer;
    
    if (isNaN(inputVal)) return;

    if (inputVal === correctAns) {
        correctSound.play().catch(e => console.warn("Sound deferred"));
        handleProgressUpdate();
    } else {
        wrongSound.play().catch(e => console.warn("Sound deferred"));
        
        // Shake animation
        const eqCard = document.querySelector('.equation-card');
        eqCard.classList.add('shake');
        setTimeout(() => eqCard.classList.remove('shake'), 400);
        
        mathAnswerInput.value = '';
        mathAnswerInput.focus();
    }
}

submitAnswerBtn.onclick = checkAnswer;
mathAnswerInput.onkeypress = (e) => {
    if (e.key === 'Enter') checkAnswer();
};

function resetGame() {
    state.gameActive = false;
    state.myCurrentIndex = 0;
    state.oppCurrentIndex = 0;
    state.myFinishTime = null;
    state.oppFinishTime = null;
    state.mySolvedCount = 0;
    state.oppSolvedCount = 0;
    
    if (state.timerInterval) clearInterval(state.timerInterval);
    timerDisplay.classList.remove('visible');
    timerDisplay.textContent = "00.000";
    
    document.getElementById('my-progress-bar').style.width = "0%";
    document.getElementById('opp-progress-bar').style.width = "0%";
    
    showPhase('lobby');
}

// Controls
createRoomBtn.onclick = () => {
    state.myName = nameInput.value.trim() || "Host";
    state.difficulty = difficultyInput.value.trim();
    state.questionCount = parseInt(questionCountInput.value, 10);
    state.timeLimit = parseInt(timeLimitInput.value, 10);
    
    const customCode = customRoomInput.value.trim();
    state.roomId = customCode || Math.floor(100 + Math.random() * 900).toString();
    state.isHost = true;
    initPeer('quickmath-v1-' + state.roomId);
};

joinRoomBtn.onclick = () => {
    state.myName = nameInput.value.trim() || "Guest";
    state.isHost = false;
    initPeer();
};

startGameBtn.onclick = () => {
    if (state.isHost && state.isConnected) {
        // Host generates the questions list and sends it
        const questions = generateQuestions(state.questionCount, state.difficulty);
        state.questions = questions;
        
        state.conn.send({
            type: 'start-game',
            questions
        });
        startGame();
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
        console.error('Copy error:', err);
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

// Init Theme & Language
state.theme = localStorage.getItem('theme') || 'light';
updateThemeUI();
updateLanguageUI();
