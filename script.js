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
        title: "Simple Games"
    },
    vi: {
        title: "Trò Chơi Đơn Giản"
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



// Toast Function
function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.toggle('error', isError);
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}
