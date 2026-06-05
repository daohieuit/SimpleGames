# Tài liệu Thiết kế & Đánh giá Đồng bộ (DESIGN.md)

Tài liệu này phân tích chi tiết sự đồng bộ về mặt cấu trúc HTML, phong cách CSS và luồng hoạt động JavaScript giữa hai trò chơi **Guess Word (Đoán Từ)** và **Guess Number (Đoán Số)** trong hệ thống Simple Games.

---

## 1. Nguyên tắc thiết kế cốt lõi (SaaS Brutalist)
Cả hai trò chơi đều được thiết kế dựa trên phong cách **SaaS Brutalist** đặc trưng bởi:
*   **Typography**: Sử dụng font chữ hiện đại **Orbitron** cho các tiêu đề chính/trạng thái và font system sans-serif cho văn bản thường.
*   **Bảng màu (Palette)**: Độ tương phản cực cao giữa nền sáng (`#ffffff`) và tối (`#0a0a0a`), kết hợp các viền đen dày (`#111111`, `1px` hoặc `2px`) và đổ bóng phẳng cứng cáp (`var(--shadow-sm)` / `var(--shadow-md)`).
*   **Bo góc (Border Radius)**: Áp dụng các góc bo rõ ràng (`--rounded-md: 8px`, `--rounded-lg: 12px`).
*   **Tính nhất quán (Parity)**: 100% trải nghiệm trực quan và cấu trúc luồng của các trò chơi phải đồng bộ với nhau.

---

## 2. Bảng đối chiếu đồng bộ thiết kế (Parity Audit Matrix)

| Thành phần / Màn hình | Landing Page Hub | Guess Word (Đoán Từ) | Guess Number (Đoán Số) | Tình trạng đồng bộ |
| :--- | :--- | :--- | :--- | :--- |
| **Ngôn ngữ mặc định** | English (`en`) | Tiếng Việt (`vi`) | Tiếng Việt (`vi`) | ❌ **Không đồng bộ** (Landing mặc định tiếng Anh, vào game tự động chuyển sang tiếng Việt) |
| **Font tiêu đề chính** | Orbitron | Orbitron | Orbitron |  Đồng bộ |
| **Cấu trúc Header Actions** | Row flex, toggles dạng pill tròn | Column flex, toggles dạng nút vuông | Row flex, toggles dạng pill tròn | ❌ **Không đồng bộ** (Giao diện Header ở Guess Word bị lệch và khác biệt hoàn toàn) |
| **Hiệu ứng Card Hover** | Có hover translate & shadow | Không có hiệu ứng | Có hover shadow | ❌ **Không đồng bộ** (Lớp CSS `.card:hover` bị thiếu ở Guess Word) |
| **Bố cục Battle Grid** | N/A | `1.25fr 1fr` | `1fr 1fr` | ❌ **Không đồng bộ** (Cột chia tỷ lệ khác nhau gây lệch khung hình) |
| **Khung nhập từ/số đoán** | N/A | Nằm trong vùng của đối thủ | Nằm độc lập phía dưới grid | ❌ **Không đồng bộ** (Cơ chế nhập đoán không đồng quán) |
| **Thanh chỉ báo lượt chơi** | N/A | Dùng thẻ `<p>` + `#message-log` | Dùng thẻ `<h2>` | ❌ **Không đồng bộ** |
| **Cơ chế chơi lại (Play Again)**| N/A | Giữ kết nối P2P, quay về lobby | Reload trang (mất kết nối peer) | ❌ **Không đồng bộ & Trải nghiệm tệ** |
| **Tên người chơi ở Battle** | N/A | Hiển thị tên tự đặt (VD: Player #1) | Hiển thị tĩnh ("Bạn" / "Đối thủ") | ❌ **Không đồng bộ** |
| **Cách viết Footer** | `DaoHieuIT` (CamelCase) | `DaoHieuIT` (CamelCase) | `DAOHIEUIT` (UPPERCASE) | ❌ **Không đồng bộ** |

---

## 3. Các điểm bất cập & Không đồng bộ chi tiết

### A. Bất cập cấu trúc HTML & SEO
1.  **Thuộc tính `lang` trong thẻ HTML**:
    *   Guess Number: `<html lang="vi">`
    *   Guess Word: `<html lang="en">`
2.  **Cú pháp Title trang**:
    *   Guess Number: `<title>Đoán Số - Guess Number</title>` (Tiếng Việt trước)
    *   Guess Word: `<title>Guess Word - Đoán Từ</title>` (Tiếng Anh trước)
3.  **Thẻ Apple Touch Icon**:
    *   Guess Word có `<link rel="apple-touch-icon"...>` nhưng Guess Number thì không.
4.  **Lỗi Copy-Paste Alt của Logo**:
    *   Trong `guess-number/index.html` (dòng 23): Logo có thuộc tính `alt="Guess Word Logo"`. Đây là lỗi copy từ game Đoán từ.
5.  **Thiếu ID hỗ trợ Dynamic UI**:
    *   Để dịch ngôn ngữ động, Guess Number sử dụng các ID như `#welcome-text`, `#room-id-label`, `#submit-words-title`.
    *   Guess Word thiếu hoàn toàn các ID này trong HTML, dẫn đến việc JavaScript phải sử dụng các selector chung chung như `document.querySelector('#home-phase h2')`, rất dễ bị lỗi nếu cấu trúc HTML thay đổi.

### B. Bất cập về CSS & Trải nghiệm thị giác (Visual & CSS Parity)
1.  **Thiết kế Header & Nút chuyển đổi (Theme/Lang Toggles)**:
    *   **Landing Page & Guess Number**: `.header-actions` là một hàng ngang (`flex-direction: row`). Thanh chứa toggles `.header-toggles` là một thanh hình viên thuốc bo tròn (`border-radius: 9999px`) với màu nền `var(--surface-soft)`. Các nút con `.theme-toggle` và `.lang-toggle` là hình tròn (`border-radius: 50%`) màu nền trong suốt.
    *   **Guess Word**: `.header-actions` bị xếp dọc (`flex-direction: column; align-items: flex-end;`). Các toggles không có thanh bọc nền, các nút con lại là hình vuông bo góc nhẹ (`border-radius: var(--rounded-md); background-color: var(--surface-soft)`). Điều này phá vỡ tính nhất quán hình ảnh của dự án.
2.  **Bố cục Grid trong Battle Phase**:
    *   Guess Number: Cột chia tỷ lệ `1fr 1fr` mang lại cảm giác cân xứng đối đầu trực quan.
    *   Guess Word: Cột chia tỷ lệ `1.25fr 1fr`, làm cho khung từ của đối thủ to hơn khung từ của bạn một cách bất đối xứng không cần thiết.
3.  **Vị trí ô nhập dữ liệu đoán (Guess Input Container)**:
    *   Guess Number: Khung nhập đoán nằm ở phía dưới cùng, rộng rãi và cân đối.
    *   Guess Word: Khung nhập đoán bị nhét vào bên trong vùng của đối thủ (`.opponent-area`), sử dụng thuộc tính style ẩn/hiện trực tiếp trên thẻ (`style="display: none;"`), làm mất cân đối khu vực hiển thị từ.
4.  **Bị rò rỉ phạm vi CSS Dark Mode**:
    *   Cả hai game đều copy thuộc tính này từ Landing Page:
        ```css
        .dark-mode h3 {
            background-color: var(--text-on-dark);
            color: var(--bg-color);
            padding: 0.25rem 0.75rem;
            border-radius: var(--rounded-md);
            display: inline-block;
        }
        ```
    *   Selector này ảnh hưởng lên tất cả thẻ `h3` khi bật chế độ tối. Đối với giao diện game, nó vô tình biến tiêu đề của hai vùng người chơi (`<h3>Đối thủ</h3>`, `<h3>Bạn</h3>`) thành các khối nhãn nền trắng chữ đen rất thô kệch và không được tối ưu hoá cho chiều dài văn bản động (tên người chơi).
5.  **Thiếu Card Hover ở Guess Word**:
    *   Lớp CSS `.card:hover { box-shadow: var(--shadow-md); }` có mặt ở Guess Number giúp tăng phản hồi trực quan nhưng bị bỏ quên ở Guess Word.

### C. Bất cập về Luồng hoạt động & Logic JavaScript
1.  **Không đồng bộ ngôn ngữ mặc định**:
    *   Nếu người dùng chưa từng chọn ngôn ngữ trước đó, Landing page sẽ hiển thị tiếng Anh (`en`). Tuy nhiên khi click vào một trong hai game, game đó sẽ tải lên với ngôn ngữ mặc định là tiếng Việt (`vi`).
2.  **Không đồng bộ hiển thị Tiêu đề lớn (h1)**:
    *   Guess Word có cơ chế dịch tiêu đề h1 tự động qua hàm `updateLanguageUI()` (Đoán Từ <-> Guess Word).
    *   Guess Number bỏ quên việc dịch tiêu đề h1 này, tiêu đề h1 sẽ giữ nguyên giá trị tĩnh viết trong HTML.
3.  **Cơ chế chơi lại (Play Again)**:
    *   **Guess Word (Tốt)**: Khi bấm "Chơi lại", game gửi gói tin `PLAY_AGAIN` cho đối thủ, gọi hàm `resetGame()` để đặt lại các biến trạng thái, ẩn hiện màn hình và đưa cả hai về màn hình chờ sẵn sàng từ mới. Kết nối P2P được giữ nguyên.
    *   **Guess Number (Tệ)**: Khi bấm "Chơi lại", game gọi `location.reload()`. Điều này khiến trang web tải lại hoàn toàn, phá huỷ kết nối PeerJS hiện tại. Người chơi bắt buộc phải đặt lại tên, tạo lại phòng mới và kết nối lại từ đầu.
4.  **Hiển thị tên người chơi động ở Battle**:
    *   Guess Word truyền tên người chơi qua gói tin bắt tay `INFO` và cập nhật tiêu đề khu vực chơi thành tên thật của người chơi (`state.myName` và `state.opponentName`).
    *   Guess Number dù có bắt tay truyền tên (`init-game` mang `hostName` và `guest-name` mang `name`) nhưng trong Battle Phase lại hoàn toàn bỏ qua và chỉ hiển thị nhãn dịch tĩnh: "Bạn" và "Đối thủ".
5.  **Cú pháp quản lý mã phòng trong code**:
    *   Guess Word: Sử dụng biến `state.roomCode` và tham số URL `?room=${state.roomCode}`.
    *   Guess Number: Sử dụng biến `state.roomId` nhưng lại xây dựng URL chia sẻ là `?room=${state.roomId}`. Sự bất nhất về tên biến dễ gây nhầm lẫn khi bảo trì.
6.  **Tạo phòng tự động**:
    *   Guess Word: Nếu người dùng không nhập mã phòng tùy chỉnh, hệ thống sẽ tự động tạo một số ngẫu nhiên từ 100 đến 999.
    *   Guess Number: Nếu để trống mã phòng, PeerJS sẽ cố gắng đăng ký một peer ID rỗng dạng `guessnumber-v1-` dẫn đến xung đột hoặc lỗi hiển thị mã phòng trống.

---

## 4. Kế hoạch khắc phục & Đồng bộ hóa

Để đồng bộ 100% hai game theo đúng cam kết trong nguyên tắc phát triển, cần tiến hành các bước sửa đổi sau:

### Bước 1: Chuẩn hóa HTML & SEO
*   Đồng bộ thuộc tính `lang="vi"` hoặc hỗ trợ thay đổi thuộc tính `lang` động trên thẻ `<html>` qua JS.
*   Cập nhật `alt="Guess Number Logo"` cho logo trong Guess Number.
*   Bổ sung thẻ `<link rel="apple-touch-icon"...>` đầy đủ cho Guess Number.
*   Thêm các ID trực quan cho các thẻ tiêu đề của Guess Word (`welcome-text`, `room-id-label`, `submit-words-title`) để đồng bộ selector với Guess Number.

### Bước 2: Tái cấu trúc CSS nhất quán
*   **Đồng bộ Header**: Thay thế phần CSS `.header-actions`, `.header-toggles` và các nút toggle trong `games/guess-word/style.css` bằng cấu trúc hàng ngang và nút tròn giống như Guess Number và Landing Page.
*   **Đồng bộ Battle Grid**: Thay thế tỷ lệ cột của Guess Word từ `1.25fr 1fr` thành `1fr 1fr` cân xứng.
*   **Đồng bộ Vị trí nhập đoán**: Di chuyển `.guess-input-container` trong Guess Word ra ngoài `.battle-grid` (đưa xuống dưới cùng) để thống nhất vị trí thao tác của người chơi như Guess Number.
*   **Sửa lỗi Dark Mode H3**: Scope lại CSS của `.dark-mode h3` thành `.dark-mode .game-selection h3` (ở Landing Page) hoặc thiết kế riêng nhãn tên người chơi trong game dưới dạng class cụ thể để tránh áp dụng màu nền thô thiển lên tiêu đề Battle.
*   **Bổ sung hiệu ứng Card**: Thêm CSS `.card:hover` vào Guess Word.

### Bước 3: Đồng bộ Logic JavaScript
*   **Ngôn ngữ mặc định**: Sửa giá trị khởi tạo `language` của cả hai game thành lấy từ `localStorage.getItem('language') || 'en'` để đồng bộ với Landing Page mặc định.
*   **Dịch tiêu đề chính**: Thêm cập nhật nội dung thẻ `h1` vào hàm `updateLanguageUI()` của Guess Number.
*   **Tái cấu trúc Play Again**: Áp dụng cơ chế reset trạng thái giữ kết nối P2P của Guess Word sang cho Guess Number. Loại bỏ hoàn toàn `location.reload()`.
*   **Hiển thị tên động**: Cập nhật hàm `updateLanguageUI()` của Guess Number để hiển thị tên thật của người chơi lên tiêu đề cột đấu (`state.myName` và `state.opponentName`).
*   **Chuẩn hóa biến**: Thống nhất dùng `roomCode` hoặc `roomId` xuyên suốt cả 2 project.
*   **Tạo mã phòng ngẫu nhiên**: Áp dụng cơ chế tạo mã ngẫu nhiên 3 chữ số nếu ô nhập mã phòng custom trống trong Guess Number.
