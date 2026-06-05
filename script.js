const state = {
    language: localStorage.getItem('language') || 'en',
    theme: localStorage.getItem('theme') || 'light'
};

// Theme Logic
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

// Language Logic
const langToggle = document.getElementById('lang-toggle');
const translations = {
    en: {
        title: "Simple Games",
        errorRoomCode: "Please enter a room code!",
        errorGameMode: "Please select a game mode!"
    },
    vi: {
        title: "Trò Chơi Đơn Giản",
        errorRoomCode: "Vui lòng nhập mã phòng!",
        errorGameMode: "Vui lòng chọn chế độ chơi!"
    }
};

function updateLanguageUI() {
    const t = translations[state.language];
    document.getElementById('main-title').textContent = t.title;
    
    // Update all elements with data-en/data-vi
    document.querySelectorAll('[data-en]').forEach(el => {
        el.textContent = el.getAttribute(`data-${state.language}`);
    });

    // Update all placeholders with data-placeholder-en/data-placeholder-vi
    document.querySelectorAll('[data-placeholder-en]').forEach(el => {
        el.setAttribute('placeholder', el.getAttribute(`data-placeholder-${state.language}`));
    });

    langToggle.textContent = state.language === 'en' ? 'VI' : 'US';
}

langToggle.onclick = () => {
    state.language = state.language === 'en' ? 'vi' : 'en';
    localStorage.setItem('language', state.language);
    updateLanguageUI();
};

// Initialize
updateThemeUI();
updateLanguageUI();

// Logo navigation
document.getElementById('web-logo').onclick = () => {
    window.location.href = 'index.html';
};

// Game Mode Selector Buttons
const modeButtons = document.querySelectorAll('.game-mode-selector .mode-btn');
const hiddenGameMode = document.getElementById('quick-game-mode');

modeButtons.forEach(btn => {
    btn.onclick = () => {
        modeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (hiddenGameMode) hiddenGameMode.value = btn.getAttribute('data-value');
    };
});

// Quick Join Logic
const quickJoinForm = document.getElementById('quick-join-form');
if (quickJoinForm) {
    quickJoinForm.onsubmit = (e) => {
        e.preventDefault();
        const roomCode = document.getElementById('quick-room-code').value.trim();
        const gameMode = document.getElementById('quick-game-mode').value;
        const t = translations[state.language];

        if (!roomCode) {
            showToast(t.errorRoomCode, true);
            return;
        }
        if (!gameMode) {
            showToast(t.errorGameMode, true);
            return;
        }

        window.location.href = `games/${gameMode}/index.html?room=${encodeURIComponent(roomCode)}`;
    };
}

// Toast Function
function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.toggle('error', isError);
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}
