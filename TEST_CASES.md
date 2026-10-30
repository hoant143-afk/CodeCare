# CODECARE - HỒ SƠ 12 KỊCH BẢN KIỂM THỬ SƯ PHẠM & KỸ THUẬT (TEST CASES)

Dự án: **CodeCare - Dashboard Cảnh Báo Sớm và Hỗ Trợ Can Thiệp Trong Học Lập Trình**  
Học phần: Trí tuệ Nhân tạo trong Giáo dục (AI in Education)  
Nguyên mẫu: Phiên bản Prototype Thử nghiệm  

---

## Danh Sách 12 Test Cases

### TC-01: Người học bình thường không bị cảnh báo
- **Mã kịch bản**: TC-01
- **Phân loại**: Cảnh báo chuẩn (True Negative)
- **Dữ liệu đầu vào**: `STU001` (Tỷ lệ hoàn thành 100%, Test pass 90%, Trễ hạn: 0 bài, Chạy mã: 22 lần, Tỷ lệ lỗi: 27%, Xu hướng: Ổn định)
- **Hành động kiểm thử**: Chạy thuật toán suy luận Evidence Score với bộ ngưỡng chuẩn.
- **Kết quả mong đợi**: Evidence Score $\le 2$, trạng thái: "Bình thường" (`NORMAL`), không xuất hiện trong danh sách cảnh báo.
- **Kết quả thực tế**: Evidence Score = 0, trạng thái: "Bình thường", không tạo cảnh báo rác.
- **Trạng thái**: **PASS**
- **Ý nghĩa sư phạm**: Đảm bảo hệ thống không gây phiền toái (alert fatigue) cho giáo viên đối với các sinh viên đang tiến bộ tốt.

---

### TC-02: Phát hiện người học nộp thiếu nhiều bài tập
- **Mã kịch bản**: TC-02
- **Phân loại**: Hành vi nộp bài (Submission compliance)
- **Dữ liệu đầu vào**: `STU002` (Bài nộp: 3/6, Tỷ lệ nộp 50% < 70%, 2 bài trễ hạn)
- **Hành động kiểm thử**: Kiểm tra quy tắc `submission_rate < 0.70` và `late_submissions >= 2`.
- **Kết quả mong đợi**: Cộng +2 điểm nộp thiếu, +1 điểm nộp trễ.
- **Kết quả thực tế**: Hệ thống cộng chính xác +2 điểm nộp thiếu và +1 điểm nộp trễ. Lý do giải thích hiển thị: *"Chỉ hoàn thành 50% bài được giao"* và *"2 bài gần nhất nộp trễ so với hạn chót"*.
- **Trạng thái**: **PASS**
- **Ý nghĩa sư phạm**: Nhận diện sớm dấu hiệu buông xuôi bài tập lab trước khi kỳ học kết thúc.

---

### TC-03: Phát hiện tỷ lệ test case đạt thấp
- **Mã kịch bản**: TC-03
- **Phân loại**: Năng lực lập trình kỹ thuật (Technical mastery)
- **Dữ liệu đầu vào**: `STU007` (Test pass rate = 19% < 50%)
- **Hành động kiểm thử**: Kiểm tra quy tắc `test_pass_rate < 0.50`.
- **Kết quả mong đợi**: Cộng +2 điểm kiểm thử thấp.
- **Kết quả thực tế**: Hệ thống cộng +2 điểm kiểm thử thấp. Lý do hiển thị: *"Tỷ lệ vượt qua kiểm thử đạt 19% (dưới ngưỡng tối thiểu 50%)"*.
- **Trạng thái**: **PASS**
- **Ý nghĩa sư phạm**: Chỉ ra khoảng trống kỹ thuật khi sinh viên không vượt qua được các trường hợp kiểm thử biên (edge cases).

---

### TC-04: Chạy mã nhiều lần nhưng không cải thiện (Debugging Loop)
- **Mã kịch bản**: TC-04
- **Phân loại**: Vòng lặp bế tắc (Trial-and-error debugging)
- **Dữ liệu đầu vào**: `STU003` (Số lần chạy code = 38 $\ge 15$, Test pass rate = 36% < 40%)
- **Hành động kiểm thử**: Kiểm tra quy tắc `code_runs >= 15 && test_pass_rate < 0.40`.
- **Kết quả mong đợi**: Kích hoạt điều kiện bế tắc thử-sai mù quáng, cộng +1 điểm Evidence Score.
- **Kết quả thực tế**: Hệ thống cộng +1 điểm, lý do hiển thị: *"Đã chạy chương trình 38 lần nhưng chỉ vượt 36% bộ kiểm thử (dấu hiệu bế tắc/thử-sai mù quáng)"*.
- **Trạng thái**: **PASS**
- **Ý nghĩa sư phạm**: Phân biệt giữa nỗ lực lành mạnh và nỗ lực bế tắc để can thiệp đúng lúc.

---

### TC-05: Ít hoạt động và vắng mặt trong tuần
- **Mã kịch bản**: TC-05
- **Phân loại**: Mức độ gắn kết (Engagement drop)
- **Dữ liệu đầu vào**: `STU023` (Active days = 1 ngày $\le 2$ ngày, Lượt đăng nhập = 4 lần)
- **Hành động kiểm thử**: Kiểm tra điều kiện `active_days_7d <= 2`.
- **Kết quả mong đợi**: Cộng +1 điểm gắn kết thấp.
- **Kết quả thực tế**: Hệ thống cộng +1 điểm gắn kết thấp, lý do nêu rõ số ngày hoạt động trong tuần.
- **Trạng thái**: **PASS**
- **Ý nghĩa sư phạm**: Cảnh báo nguy cơ bỏ học (dropout) sớm.

---

### TC-06: Nộp trễ bài tập liên tiếp
- **Mã kịch bản**: TC-06
- **Phân loại**: Hành vi nộp bài
- **Dữ liệu đầu vào**: `STU010` (Số bài nộp trễ = 2 $\ge 2$)
- **Hành động kiểm thử**: Kiểm tra điều kiện `late_submissions >= 2`.
- **Kết quả mong đợi**: Cộng +1 điểm.
- **Kết quả thực tế**: Hệ thống cộng +1 điểm nộp trễ và hiển thị rõ ràng trên thẻ cảnh báo.
- **Trạng thái**: **PASS**
- **Ý nghĩa sư phạm**: Giúp giáo viên thăm dò khó khăn về quản lý thời gian hoặc công việc cá nhân.

---

### TC-07: Xu hướng kết quả kiểm thử suy giảm (DECLINING Trend)
- **Mã kịch bản**: TC-07
- **Phân loại**: Xu hướng học tập theo chuỗi thời gian
- **Dữ liệu đầu vào**: `STU002` (Tuần trước test pass 55%, tuần này giảm xuống 33%)
- **Hành động kiểm thử**: So sánh `current_test_pass_rate` với `previous_test_pass_rate`.
- **Kết quả mong đợi**: Phân loại xu hướng là `DECLINING`, cộng +1 điểm Evidence Score.
- **Kết quả thực tế**: Hệ thống xác định chính xác xu hướng `DECLINING`, cộng +1 điểm.
- **Trạng thái**: **PASS**
- **Ý nghĩa sư phạm**: Phát hiện người học từng học tốt nhưng bắt đầu gặp khó khi sang chủ đề mới phức tạp hơn (như con trỏ, danh sách liên kết).

---

### TC-08: Phân tích trường hợp Cảnh báo Sai Dương (False Positive)
- **Mã kịch bản**: TC-08
- **Phân loại**: Đánh giá & Audit (Error analysis)
- **Dữ liệu đầu vào**: `STU015` (Hệ thống tính Score = 5 $\ge 4$ $\rightarrow$ ALERT, nhưng nhãn giáo viên `teacher_label = NORMAL`)
- **Hành động kiểm thử**: Đưa qua ma trận nhầm lẫn Confusion Matrix.
- **Kết quả mong đợi**: Xếp vào ô False Positive (FP), xuất hiện trong danh mục phân tích sai dương.
- **Kết quả thực tế**: Xếp đúng vào ô FP, có phần giải thích nguyên nhân: sinh viên tự làm bài tập nâng cao đồ họa 3D nên chạy thử nhiều lần.
- **Trạng thái**: **PASS**
- **Ý nghĩa sư phạm**: Minh chứng rằng hệ thống không phán xét thay con người; giáo viên có toàn quyền xem xét bối cảnh.

---

### TC-09: Phân tích trường hợp Cảnh báo Sai Âm (False Negative)
- **Mã kịch bản**: TC-09
- **Phân loại**: Đánh giá & Audit (Error analysis)
- **Dữ liệu đầu vào**: `STU048` (Hệ thống tính Score $\le 2$ $\rightarrow$ NORMAL, nhưng nhãn giáo viên `teacher_label = NEED_SUPPORT`)
- **Hành động kiểm thử**: Đưa qua ma trận nhầm lẫn Confusion Matrix.
- **Kết quả mong đợi**: Xếp vào ô False Negative (FN), xuất hiện trong danh mục phân tích sai âm.
- **Kết quả thực tế**: Xếp đúng vào ô FN, có phần giải thích: sinh viên nộp bài đủ nhưng sao chép mã hoặc phụ thuộc bạn cùng bàn trong phòng lab thực tế.
- **Trạng thái**: **PASS**
- **Ý nghĩa sư phạm**: Nhắc nhở người dùng rằng dữ liệu LMS không thể ghi nhận toàn bộ hành vi offline tại lớp học.

---

### TC-10: Giáo viên xác nhận cảnh báo và chọn can thiệp (Human-in-the-Loop)
- **Mã kịch bản**: TC-10
- **Phân loại**: Tương tác giáo viên & Lưu trữ
- **Dữ liệu đầu vào**: Cảnh báo `STU023`, giáo viên nhấn nút *"1. Xác nhận cần hỗ trợ"*, nhập ghi chú, chọn hình thức *"Gợi ý từng bước"*, nhấn *"Lưu quyết định"*.
- **Hành động kiểm thử**: Kiểm tra trạng thái lưu trữ localStorage và cập nhật danh sách Can thiệp.
- **Kết quả mong đợi**: Cập nhật `teacher_confirmation = CONFIRMED`, trạng thái can thiệp chuyển sang `PENDING`/`IN_PROGRESS`, lưu thời gian và ghi vào Nhật ký AI Audit Log.
- **Kết quả thực tế**: Dữ liệu đồng bộ tức thì sang trang Can thiệp và trang Nhật ký AI mà không cần tải lại trang.
- **Trạng thái**: **PASS**
- **Ý nghĩa sư phạm**: Đảm bảo quy trình can thiệp luôn có sự chủ động và trách nhiệm của nhà giáo dục.

---

### TC-11: Giáo viên bác bỏ cảnh báo (Teacher Override)
- **Mã kịch bản**: TC-11
- **Phân loại**: Quyền phủ quyết của giáo viên
- **Dữ liệu đầu vào**: Cảnh báo `STU015`, giáo viên nhấn *"3. Không cần can thiệp"*, ghi chú lý do đề tài tự chọn.
- **Hành động kiểm thử**: Cập nhật trạng thái `teacher_confirmation = DISMISSED`.
- **Kết quả mong đợi**: Thẻ cảnh báo chuyển sang trạng thái "Đã bác bỏ", không áp đặt can thiệp.
- **Kết quả thực tế**: Trạng thái được ghi đè thành công, lưu lại trong lịch sử kiểm toán.
- **Trạng thái**: **PASS**
- **Ý nghĩa sư phạm**: Tôn trọng chuyên môn của giáo viên, ngăn chặn việc can thiệp sai lệch gây áp lực cho người học.

---

### TC-12: Điều chỉnh ngưỡng cảnh báo làm thay đổi tức thì Precision & Recall
- **Mã kịch bản**: TC-12
- **Phân loại**: Quản trị độ nhạy hệ thống (Threshold sensitivity)
- **Dữ liệu đầu vào**: Trong trang Cài đặt, thay đổi ngưỡng `evidenceAlert` từ 4 lên 5 điểm và nhấn *"Lưu ngưỡng"*.
- **Hành động kiểm thử**: Kiểm tra sự cập nhật của Confusion Matrix, Precision, Recall và số lượng cảnh báo trên toàn hệ thống.
- **Kết quả mong đợi**: Số lượng cảnh báo giảm, Recall giảm, Precision thay đổi tương ứng; biểu đồ mô phỏng cập nhật theo thời gian thực.
- **Kết quả thực tế**: Toàn bộ hệ thống tính toán lại ngay lập tức dựa trên cấu hình mới.
- **Trạng thái**: **PASS**
- **Ý nghĩa sư phạm**: Giúp nhà quản lý giáo dục lựa chọn điểm cân bằng tối ưu giữa việc tránh bỏ sót học sinh và tránh quá tải cho giáo viên.

---

*Hết tài liệu TEST_CASES.md*
