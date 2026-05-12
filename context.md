# Guess Word

## 1. Project Name
**Guess Word**

## 2. Overview
The game is a turn-based, real-time 2-player game with no long-term data storage (no database).  
Each player creates a meaningful word chain following the "tail-head" rule (the last letter of the previous word equals the first letter of the next word).  
After that, both players take turns guessing the opponent's words based on hints showing the word length and known first/last letters.

## 3. Detailed Rules
- Each word must be meaningful (at least 2 characters, e.g., "đánh cầu").
- The length of the word chain is chosen by the player when creating the room (e.g., 3–5 words per player).
- After submitting, the system hides all letters of the opponent's words, except:
  - The first letter of each word.
  - The last letter of each word (because it's key to the chain rule).
- Hints are displayed in the following format:  
  `đánh c_ _ (3)`  
  `c _ _ (3) l _ _ _ (4)` (word 2: "cầu" (3 letters) → "lông" (4 letters))

  Where:
  - The number in parentheses `(n)` is the total letter count of that word.
  - The underscore `_` represents one unknown letter.
  - The full chain can also be displayed as:  
    `[Word 1: đ á n h c _ _] → [Word 2: c _ _ l _ _ _]`

- Players guess each word of the opponent **in the correct chain order**.
- Guessing a word correctly reveals the entire word.
- Guessing incorrectly → the player loses their turn.
- The game ends when one player has guessed all of the opponent's words correctly.

## 4. Technical Requirements (No Database)
- Uses **PeerJS**.
- The project uses only **pure HTML, CSS, JS** and is deployed via **GitHub Pages**.
- Each game room is an object containing:
  - Player A's word list (hidden).
  - Player B's word list (hidden).
  - Current turn.
  - Words that have been correctly guessed/revealed.
- When two players connect → a room is automatically created with a random room code (simplified to a random 3-digit number).
- No history is saved after closing the browser or leaving the room.

## 5. Game Flow
1. **Player 1** creates a room → enters the room → receives a room code.
2. **Player 2** enters the room code → joins the room.
3. **Word submission phase**:
   - The room host chooses the word chain length (e.g., 3-5 words) before creating the room.
   - Each player enters their own word chain (tail-head rule) based on the chosen length.
   - The client checks the basic tail-head rule (last letter of previous word = first letter of next word) before sending.
   - Both players ready up. **Player 1 (room owner)** starts the game, and the system randomly decides who goes first.
4. **Battle phase**:
   - The server sends each player a hidden view of the opponent's words (showing first/last letters + word length hints).
   - Players take turns guessing any word in the opponent's chain.
   - The server checks correctness → updates the revealed status of guessed words.
5. **End phase**:
   - The winner is displayed.
   - A "Play Again" button resets the room state (keeping both players).

## 6. Interface Example
**Player A** (entered words: `"đánh cầu" → "cầu lông"`)

**Player B sees**:
    - Word 1: đ á n h c _ _ (3)
    - Word 2: c _ _ (3) l _ _ _ (4)

**Player B guesses**: `"cầu"` → correct → word reveals as `cầu`.  
Then guesses `"lông"` or another word if not finished.