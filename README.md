# Simple Games 🎮

A high-fidelity, P2P multiplayer gaming platform built with a **SaaS Brutalist** aesthetic. No servers, no accounts—just pure, instant competition between friends via WebRTC.

## 🚀 Games Included

### 1. Guess Word (Đoán Từ)
A tactical word-chain battle. 
- **Rules**: Create a chain of words following the "tail-head" rule (last word of the previous phrase must be the first word of the next).
- **Challenge**: Guess your opponent's hidden word chain one by one before they guess yours!
- **Features**: Real-time synchronization, countdown timers, and linguistic validation.

### 2. Guess Number (Đoán Số)
A high-stakes numerical guessing game.
- **Rules**: Set a secret number within a custom range (e.g., 0-100).
- **Challenge**: Take turns guessing your opponent's number. Receive "Higher" or "Lower" hints to narrow down the target.
- **Features**: Visual hint history with dynamic arrows, customizable ranges, and rapid-fire turns.

## 🛠 Technology Stack
- **Frontend**: Vanilla HTML5, CSS3 (Modern SaaS Brutalist Design), JavaScript (ES6+).
- **Networking**: [PeerJS](https://peerjs.com/) (WebRTC) for direct Peer-to-Peer communication.
- **Infrastructure**: Metered TURN servers for reliable connectivity across restricted networks.
- **Aesthetics**: Orbitron typography, high-contrast dark modes, and glassmorphism micro-animations.

## 📂 Project Structure
```text
/
├── index.html          # Landing Page (Game Selection)
├── style.css           # Global Landing Page Styles
├── script.js           # Landing Page Logic
├── assets/             # Shared Media & Favicons
│   ├── images/         # Brand Assets
│   └── mp3/            # Game Sound Effects
└── games/              # Game Modules
    ├── guess-word/     # Guess Word implementation
    └── guess-number/   # Guess Number implementation
```

## 🤝 How to Play
1. Open the [Landing Page](index.html).
2. Choose a game and enter your name.
3. **Host**: Create a room and share the Room ID or Link with a friend.
4. **Guest**: Enter the Room ID or click the link to join instantly.
5. Set your secret words/numbers and let the battle begin!

## 📜 Development Principles
- **No Backend**: All game state is handled directly between clients.
- **Consistency**: 100% visual and structural parity across all game modes.
- **Responsiveness**: Fully optimized for mobile and desktop play.

---
Built with ❤️ by **DaoHieuIT**