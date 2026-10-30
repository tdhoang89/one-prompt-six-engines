# One Prompt, Six Engines

Cùng một prompt, cùng một model AI, cùng một game — chỉ đổi engine. Kỹ thuật nào AI làm tốt nhất?

**▶ Chơi thử cả sáu bản: https://&lt;user&gt;.github.io/one-prompt-six-engines/** (web song ngữ Việt / Anh)

[English](README.md)

## Ý tưởng

Một prompt. Một biến duy nhất: dòng `KỸ THUẬT: [ĐIỀN Ở ĐÂY]`. Sáu kỹ thuật. Một game: **Neon Swarm**.

Mỗi bản là **1 file HTML duy nhất**, không dùng ảnh, âm thanh hay font từ file ngoài — mọi thứ vẽ bằng code, âm thanh tạo bằng Web Audio API. Nhờ vậy khác biệt giữa các bản chỉ đến từ kỹ thuật.

Tất cả bản build trong repo này được tạo trên **Claude web chat (claude.ai)** với **Claude Opus 5.5, mức effort High**, mỗi kỹ thuật một chat mới. Bản tạo trong chat nạp engine từ `cdn.jsdelivr.net` nên cần có mạng khi chơi. File game được giữ nguyên, không chỉnh sửa.

## Sáu kỹ thuật

Version và dung lượng thư viện đo ngày **30/10/2026** từ jsDelivr / npm.

| Kỹ thuật | Slug | Version | Loại | Thư viện (bản min, chưa gzip) | Ghi chú khi đóng gói 1 HTML |
|---|---|---|---|---|---|
| HTML5 thuần (Canvas 2D) | `canvas` | — | 2D | 0 | Không cần thư viện, nhẹ nhất |
| Phaser | `phaser` | 4.2.1 | 2D | ~1,38 MB | Dán thẳng `phaser.min.js` |
| PixiJS | `pixi` | 8.22.0 | 2D | ~0,84 MB | Dán thẳng `pixi.min.js` |
| three.js | `three` | 0.186.1 | 3D | ~0,81 MB (module + core) | Chỉ còn dạng ES module → cần bundle trước khi nhúng |
| Babylon.js | `babylon` | 9.33.1 | 3D | ~8,8 MB (bản đầy đủ) | Nặng nhất; có thể chỉ lấy phần cần dùng |
| PlayCanvas (engine) | `playcanvas` | 2.23.3 | 3D | ~2,55 MB | Chỉ dùng engine, không dùng Editor |

## Game: Neon Swarm

Game arcade cho người lớn, điều khiển bằng một ngón: né bầy kẻ địch phát sáng, nhặt 10 viên năng lượng để phát sóng nổ, gây nổ dây chuyền để ăn combo. Đây là bài stress cho engine: hàng trăm vật thể, hiệu ứng phát sáng (bloom / filter / shader), ánh sáng 3D, rung màn hình, slow-motion. Mỗi bản đều hiện FPS và số vật thể, có nút **Stress test** đo số vật thể tối đa khi FPS còn ≥ 50. [Xem prompt](prompts/neon-swarm.md)

## Tiêu chí chấm

| Tiêu chí | Cách lấy |
|---|---|
| Chạy được ngay lần đầu | Ghi tay (Có / Không) |
| Số lần phải nhờ AI sửa | Ghi tay |
| FPS trung bình khi chơi bình thường | Đo trên máy thật |
| Xoay/gập máy có vỡ hình không | Ghi tay |
| Số dòng code tự viết (không tính thư viện nhúng) | Script tự tính |
| Dung lượng file | Script tự tính |
| Stress test — số vật thể tối đa | Đo trên máy thật |
| Hiệu ứng có sẵn vs tự làm | Lấy từ báo cáo của AI |
| Điểm cảm quan 1–5 (đẹp, cảm giác chơi) | Chấm tay |

## Kết quả

Sinh từ [`games.json`](games.json) bằng `scripts/update-manifest.mjs`. Ô "—" là chưa đo. Dòng code = số dòng không trống trong file, không tính phần engine nhúng. Dung lượng chỉ tính file HTML; bản CDN tải engine riêng.

<!-- results:start -->
**Neon Swarm**

| Kỹ thuật | Version | 2D/3D | Dung lượng (KB) | Dòng code | Nạp thư viện | Chạy ngay | Số lần sửa | FPS TB | Xoay/gập OK | Stress tối đa | Điểm |
|---|---|---|---|---|---|---|---|---|---|---|---|
| [HTML5 Canvas 2D](games/neon-swarm/canvas.html) | — | 2D | 39.6 | 774 | Không thư viện | — | — | — | — | — | — |
| [Phaser](games/neon-swarm/phaser.html) | 4.2.1 | 2D | 43.4 | 940 | CDN | — | — | — | — | — | — |
| [PixiJS](games/neon-swarm/pixi.html) | 8.22.0 | 2D | 48.8 | 1130 | CDN | — | — | — | — | — | — |
| [three.js](games/neon-swarm/three.html) | 0.186.1 | 3D | 48.6 | 819 | CDN | — | — | — | — | — | — |
| [Babylon.js](games/neon-swarm/babylon.html) | 9.33.1 | 3D | 43.7 | 813 | CDN | — | — | — | — | — | — |
| [PlayCanvas (engine)](games/neon-swarm/playcanvas.html) | 2.23.3 | 3D | 47.4 | 970 | CDN | — | — | — | — | — | — |
<!-- results:end -->

## Giả thuyết (chưa kiểm chứng)

- PixiJS và Phaser đạt số vật thể cao nhất trong nhóm 2D ở Stress test.
- HTML5 thuần đuối sớm nhất nếu phần phát sáng làm bằng `shadowBlur` của Canvas.
- three.js, Babylon.js và PlayCanvas đẹp nhất ở phần ánh sáng nhưng file nặng hơn.

## Cách tự làm lại

1. Mở chat mới.
2. Dán prompt trong [`prompts/neon-swarm.md`](prompts/neon-swarm.md).
3. Điền dòng `KỸ THUẬT:` bằng tên kỹ thuật và version, ví dụ `Phaser 4.2.1`.
4. Lưu file HTML Claude trả về vào `games/neon-swarm/<slug>.html` (slug ở bảng phía trên).
5. Chạy `node scripts/update-manifest.mjs` (Node 18+, không cần cài gì thêm). Script thêm bản build mới vào `games.json`, tính lại dung lượng, số dòng code, CDN/nhúng, cập nhật bảng kết quả trong cả hai README và bản sao bên trong `index.html`. Các trường nhập tay không bao giờ bị ghi đè.
6. Điền các trường đo tay trong `games.json`: `madeWith`, `model`, `date`, `firstTryWorks`, `fixRounds`, `avgFps`, `resizeOk`, `stressMaxObjects`, `builtInEffects`, `score`, `notes`.
7. Tùy chọn: `node scripts/update-manifest.mjs --screenshots` chơi thử mỗi bản khoảng 3 giây rồi lưu `assets/screenshots/<game>-<tech>.png`. Cần Playwright (`npm i -D playwright`) và Chrome, Edge hoặc `npx playwright install chromium`. Nếu ảnh rơi đúng màn "Game over" thì chạy lại.

## Đăng lên GitHub Pages

1. Tạo repository (đề xuất tên `one-prompt-six-engines`) và upload toàn bộ nội dung folder này vào thư mục gốc, kể cả file `.nojekyll`.
2. Trong repository vào **Settings → Pages → Build and deployment**, chọn **Deploy from a branch**, nhánh `main`, thư mục `/ (root)`, rồi lưu.
3. Khoảng một phút sau trang chạy tại `https://<user>.github.io/one-prompt-six-engines/`. Thay `<user>` trong README bằng tên GitHub của bạn.

Không cần bước build. Trang tự chọn tiếng Việt hay tiếng Anh theo ngôn ngữ trình duyệt, nhớ lựa chọn của người xem, và nhận `?lang=vi` hoặc `?lang=en` trong link. Muốn xem thử trên máy thì chạy một static server bất kỳ (ví dụ `npx serve .`); mở thẳng `index.html` từ ổ đĩa vẫn chạy, nhưng phần xem prompt và xem code cần server.

## Lưu ý

- Stress test chỉ có ý nghĩa khi chạy trên máy thật (ví dụ Galaxy Z Fold 8). Trình duyệt headless không dùng GPU thật nên số đo không đại diện.
- Bản tạo trong Claude chat nạp thư viện qua CDN → cần mạng; bản Claude Code nhúng thư viện → chạy offline.
- Kết quả phụ thuộc model và thời điểm, nên mỗi bản build đều ghi model và ngày.
- Ảnh chụp là khoảng 3 giây chơi tự động trên laptop; FPS hiện trong ảnh không phải kết quả đo.

### Vì sao không có Godot, PlayCanvas Editor và Unity

- **Godot**: bản xuất web gồm nhiều file, có `.wasm` hàng chục MB và phải chạy qua server → không thành 1 HTML. Godot hợp hơn khi xuất APK native.
- **PlayCanvas Editor**: editor trên web, project xuất ra folder, AI cần MCP để thao tác.
- **Unity**: phụ thuộc editor và prefab, nặng; không hợp để AI làm chính.

## License

[MIT](LICENSE)
