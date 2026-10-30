# Neon Swarm — prompt

The exact prompt used for every Neon Swarm build (original Vietnamese wording, unchanged). The only line that changes between builds is `KỸ THUẬT: [ĐIỀN Ở ĐÂY]` ("TECHNIQUE: [FILL IN HERE]").

~~~text
Làm game "Neon Swarm" cho người lớn, xuất ra 1 file HTML duy nhất.

KỸ THUẬT: [ĐIỀN Ở ĐÂY]
Chỉ dùng đúng kỹ thuật và version này, không thêm thư viện nào khác.

LỐI CHƠI (điều khiển bằng một ngón)
- Người chơi là một chấm sáng, đi theo ngón tay hoặc chuột.
- Kẻ địch là các khối hình học phát sáng, bay thành bầy lao về phía người chơi. Chạm vào kẻ địch là thua.
- Trên sân có rải các viên năng lượng. Nhặt đủ 10 viên thì tự động phát ra một sóng nổ quanh người chơi.
- Kẻ địch trúng sóng nổ sẽ vỡ tung và có thể nổ lan sang kẻ địch bên cạnh, tạo phản ứng dây chuyền.
- Điểm = thời gian sống + số địch bị diệt × hệ số combo. Combo tăng khi nổ lan liên tiếp.
- Kẻ địch lướt sát mà không chạm: hiện chữ "Close!" và cộng điểm thưởng.
- Cứ mỗi 15 giây, địch đông hơn và nhanh hơn.

CẢM GIÁC "THÊM VÁN NỮA"
- Mỗi ván khoảng 1–3 phút. Thua xong chạm một lần là chơi lại ngay, không có màn chờ.
- Lưu và hiện điểm cao nhất (Best). Nếu không lưu được thì game vẫn chạy bình thường.
- Combo càng cao, tiếng nổ càng cao dần lên.
- Khi có phản ứng dây chuyền lớn: màn hình rung nhẹ và game chậm lại trong một khoảnh khắc ngắn.
- Chữ trong game bằng tiếng Anh: Tap to start, Score, Best, Combo, Close!, Game over.

ĐỒ HỌA (phần dùng để so sánh kỹ thuật)
- Phong cách neon trên nền tối: mọi vật phát sáng, người chơi có vệt sáng phía sau, mỗi vụ nổ có nhiều mảnh vỡ.
- Hiệu ứng phát sáng: dùng tính năng mạnh nhất có sẵn của kỹ thuật (bloom, filter, shader). Nếu kỹ thuật không có sẵn thì tự làm giả và ghi rõ trong báo cáo.
- Nếu kỹ thuật là 3D: góc nhìn từ trên xuống, hơi nghiêng; kẻ địch là khối 3D; vụ nổ phát ra ánh sáng chiếu lên các vật xung quanh.
- Không dùng ảnh, âm thanh hay font từ file ngoài; mọi thứ vẽ bằng code. Âm thanh tạo bằng Web Audio API.

ĐO HIỆU NĂNG
- Góc màn hình luôn hiện FPS và tổng số vật thể đang vẽ (kẻ địch + mảnh vỡ).
- Màn đầu có thêm nút "Stress test": người chơi không thể thua, game liên tục tăng số kẻ địch và mảnh vỡ cho đến khi FPS trung bình dưới 50 trong 3 giây, rồi hiện số vật thể tối đa đạt được.

ĐIỆN THOẠI
- Game lấp đầy màn hình, tự co giãn khi xoay máy hoặc gập/mở điện thoại gập, không méo hình.
- Ngón tay không che người chơi: chấm sáng nằm hơi phía trên điểm chạm.
- Trang không cuộn, không phóng to khi chạm.

NẠP THƯ VIỆN
- Nếu làm trong chat: nạp thư viện từ cdn.jsdelivr.net, đúng version đã ghi.
- Nếu là Claude Code: tải thư viện về và nhúng vào file để chạy offline. Mở game bằng Playwright, chụp màn hình, chơi thử một ván và chạy Stress test rồi mới báo xong.

KẾT QUẢ
Trả về 1 file HTML hoàn chỉnh. Sau đó báo cáo ngắn: version thư viện, dung lượng file, số dòng code tự viết, hiệu ứng nào có sẵn và hiệu ứng nào phải tự làm, điểm nào khó với kỹ thuật này.
~~~
