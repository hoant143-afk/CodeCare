# CODECARE - HỒ SƠ 15 KỊCH BẢN KIỂM THỬ SƯ PHẠM & KỸ THUẬT (TEST CASES)

Dự án: **CodeCare - Dashboard Cảnh Báo Sớm và Hỗ Trợ Can Thiệp Trong Học Lập Trình**  
Học phần: Trí tuệ Nhân tạo trong Giáo dục (AI in Education)  
Nguyên mẫu: Phiên bản Prototype Thử nghiệm (Chạy cục bộ trên trình duyệt qua localStorage)

---

## Tổng Quan Hệ Thống Kiểm Thử

Hệ thống kiểm định của CodeCare bao gồm hai tầng kiểm thử độc lập:
1. **13 Kịch bản Tự động (Automated Suites - TC-01 đến TC-13)**: Được thực thi động trên trình duyệt theo yêu cầu của người dùng, tự động kiểm tra các khía cạnh toán học, ngưỡng cảnh báo, độ nhạy thuật toán, khả năng chống lỗi chia cho 0 và tính toàn vẹn 100% của tệp sao lưu.
2. **02 Kịch bản Giao diện Thủ công (Manual UI Validation - TC-M01, TC-M02)**: Giữ trạng thái `PENDING` mặc định. Chỉ chuyển sang `PASS` khi người dùng/giáo viên thực sự thao tác trên giao diện, kiểm tra kết quả và xác nhận kèm thời điểm và ghi chú.

---

## Danh Sách 13 Test Cases Tự Động (Automated)

### TC-01: Người học bình thường không bị cảnh báo
- **Mã kịch bản**: TC-01
- **Phân loại**: Cảnh báo chuẩn (True Negative)
- **Dữ liệu đầu vào**: `STU001` (Tỷ lệ hoàn thành 100%, Test pass 90%, Trễ hạn: 0 bài, Chạy mã: 22 lần, Tỷ lệ lỗi: 27%, Xu hướng: Ổn định)
- **Hành động kiểm thử**: Chạy thuật toán suy luận Evidence Score với bộ ngưỡng chuẩn.
- **Kết quả mong đợi**: Evidence Score $\le 2$, trạng thái: "Bình thường" (`NORMAL`), không xuất hiện trong danh sách cảnh báo.
- **Kết quả thực tế**: Evidence Score = 0, trạng thái: "Bình thường", không tạo cảnh báo rác.
- **Trạng thái**: **PASS** (tính toán khi thực thi)
- **Ý nghĩa sư phạm**: Đảm bảo hệ thống không gây quá tải cảnh báo (alert fatigue) cho giáo viên đối với các sinh viên đang tiến bộ tốt.

---

### TC-02: Phát hiện người học nộp thiếu nhiều bài tập
- **Mã kịch bản**: TC-02
- **Phân loại**: Hành vi nộp bài (Submission compliance)
- **Dữ liệu đầu vào**: `STU002` (Bài nộp: 3/6, Tỷ lệ nộp 50% < 70%, 2 bài trễ hạn)
- **Hành động kiểm thử**: Kiểm tra quy tắc `submission_rate < 0.70` và `late_submissions >= 2`.
- **Kết quả mong đợi**: Cộng +2 điểm nộp thiếu, +1 điểm nộp trễ.
- **Kết quả thực tế**: Hệ thống cộng chính xác +2 điểm nộp thiếu và +1 điểm nộp trễ. Lý do giải thích hiển thị: *"Chỉ hoàn thành 50% bài được giao"* và *"2 bài gần nhất nộp trễ so với hạn chót"*.
- **Trạng thái**: **PASS** (tính toán khi thực thi)
- **Ý nghĩa sư phạm**: Nhận diện sớm dấu hiệu buông xuôi bài tập lab trước khi kỳ học kết thúc.

---

### TC-03: Phát hiện tỷ lệ test case đạt thấp
- **Mã kịch bản**: TC-03
- **Phân loại**: Năng lực lập trình kỹ thuật (Technical mastery)
- **Dữ liệu đầu vào**: `STU007` (Test pass rate = 19% < 50%)
- **Hành động kiểm thử**: Kiểm tra quy tắc `test_pass_rate < 0.50`.
- **Kết quả mong đợi**: Cộng +2 điểm kiểm thử thấp.
- **Kết quả thực tế**: Hệ thống cộng +2 điểm kiểm thử thấp. Lý do hiển thị: *"Tỷ lệ vượt qua kiểm thử đạt 19% (dưới ngưỡng tối thiểu 50%)"*.
- **Trạng thái**: **PASS** (tính toán khi thực thi)
- **Ý nghĩa sư phạm**: Chỉ ra khoảng trống kỹ thuật khi sinh viên không vượt qua được các trường hợp kiểm thử biên (edge cases).

---

### TC-04: Chạy mã nhiều lần nhưng không cải thiện (Debugging Loop)
- **Mã kịch bản**: TC-04
- **Phân loại**: Vòng lặp bế tắc (Trial-and-error debugging)
- **Dữ liệu đầu vào**: `STU003` (Số lần chạy code = 38 $\ge 15$, Test pass rate = 36% < 40%)
- **Hành động kiểm thử**: Kiểm tra quy tắc `code_runs >= 15 && test_pass_rate < 0.40`.
- **Kết quả mong đợi**: Kích hoạt điều kiện bế tắc thử-sai mù quáng, cộng +1 điểm Evidence Score.
- **Kết quả thực tế**: Hệ thống cộng +1 điểm, lý do hiển thị: *"Đã chạy chương trình 38 lần nhưng chỉ vượt 36% bộ kiểm thử (dấu hiệu bế tắc/thử-sai mù quáng)"*.
- **Trạng thái**: **PASS** (tính toán khi thực thi)
- **Ý nghĩa sư phạm**: Phân biệt giữa nỗ lực lành mạnh và nỗ lực bế tắc để can thiệp đúng lúc.

---

### TC-05: Ít hoạt động và vắng mặt trong tuần
- **Mã kịch bản**: TC-05
- **Phân loại**: Mức độ gắn kết (Engagement level)
- **Dữ liệu đầu vào**: `STU008` (Đăng nhập: 2 lần/tuần, Ngày hoạt động: 1 ngày $\le 2$)
- **Hành động kiểm thử**: Kiểm tra quy tắc `active_days_7d <= 2`.
- **Kết quả mong đợi**: Cộng +1 điểm ít hoạt động.
- **Kết quả thực tế**: Cộng +1 điểm ít hoạt động, lý do: *"Số ngày hoạt động trong 7 ngày qua rất ít (1 ngày, 2 lượt đăng nhập)"*.
- **Trạng thái**: **PASS** (tính toán khi thực thi)
- **Ý nghĩa sư phạm**: Cảnh báo sớm nguy cơ bỏ dở môn học (drop-out).

---

### TC-06: Nộp trễ bài tập liên tiếp
- **Mã kịch bản**: TC-06
- **Phân loại**: Hành vi nộp bài (Procrastination)
- **Dữ liệu đầu vào**: `STU010` (Số bài nộp trễ = 2 $\ge 2$)
- **Hành động kiểm thử**: Kiểm tra quy tắc `late_submissions >= lateCount`.
- **Kết quả mong đợi**: Cộng +1 điểm nộp trễ hạn.
- **Kết quả thực tế**: Cộng +1 điểm nộp trễ hạn, lý do hiển thị: *"2 bài gần nhất nộp trễ so với hạn chót quy định"*.
- **Trạng thái**: **PASS** (tính toán khi thực thi)
- **Ý nghĩa sư phạm**: Nhận biết học sinh gặp khó khăn trong việc quản lý thời gian hoặc khối lượng học tập.

---

### TC-07: Xu hướng kết quả kiểm thử suy giảm so với tuần trước
- **Mã kịch bản**: TC-07
- **Phân loại**: Xu hướng học tập (Progress trend)
- **Dữ liệu đầu vào**: `STU002` (Tuần trước test pass 55%, tuần này 33% $\rightarrow$ chênh lệch -22% $\le -3\%$)
- **Hành động kiểm thử**: So sánh `current_test_pass_rate` và `previous_test_pass_rate`.
- **Kết quả mong đợi**: Gán xu hướng `DECLINING`, cộng +1 điểm Evidence Score.
- **Kết quả thực tế**: Xu hướng: `DECLINING`, lý do: *"Kết quả kiểm thử sụt giảm so với tuần trước (từ 55% xuống 33%)"*.
- **Trạng thái**: **PASS** (tính toán khi thực thi)
- **Ý nghĩa sư phạm**: Phát hiện người học từng tiếp thu tốt nhưng bị hổng kiến thức ở các chủ đề nâng cao.

---

### TC-08: Phân tích trường hợp Cảnh báo Sai Dương (False Positive)
- **Mã kịch bản**: TC-08
- **Phân loại**: Audit mô hình & Đạo đức AI
- **Dữ liệu đầu vào**: `STU015` (Hệ thống tính Score = 5 $\rightarrow$ ALERT, nhưng nhãn giáo viên = `NORMAL`)
- **Hành động kiểm thử**: Đưa qua ma trận nhầm lẫn Confusion Matrix.
- **Kết quả mong đợi**: Xếp vào ô False Positive (FP), có mục giải thích nguyên nhân sai dương.
- **Kết quả thực tế**: Phân loại đúng vào ô FP; nguyên nhân: học sinh tự viết code thử nghiệm thuật toán phức tạp khiến tỷ lệ lỗi tăng cao, nhưng giáo viên đánh giá tư duy tốt và không cần can thiệp.
- **Trạng thái**: **PASS** (tính toán khi thực thi)
- **Ý nghĩa sư phạm**: Tôn trọng phong cách học tập khám phá và bảo vệ người học khỏi can thiệp không cần thiết.

---

### TC-09: Phân tích trường hợp Cảnh báo Sai Âm (False Negative)
- **Mã kịch bản**: TC-09
- **Phân loại**: Audit mô hình & Đạo đức AI
- **Dữ liệu đầu vào**: `STU048` (Hệ thống gán Score $\le 2$ $\rightarrow$ NORMAL, nhưng nhãn giáo viên = `NEED_SUPPORT`)
- **Hành động kiểm thử**: Đưa qua ma trận nhầm lẫn Confusion Matrix.
- **Kết quả mong đợi**: Xếp vào ô False Negative (FN), xuất hiện trong danh mục phân tích sai âm.
- **Kết quả thực tế**: Xếp đúng vào ô FN; nguyên nhân: học sinh nộp bài đầy đủ nhưng trên lớp phụ thuộc hoàn toàn vào bạn cùng nhóm.
- **Trạng thái**: **PASS** (tính toán khi thực thi)
- **Ý nghĩa sư phạm**: Dữ liệu số từ LMS không thể thay thế hoàn toàn quan sát thực địa của người thầy.

---

### TC-10: Đánh giá trạng thái WATCH khi Evidence Score đạt đúng 3 điểm
- **Mã kịch bản**: TC-10
- **Phân loại**: Phân loại vùng đệm (Watch Buffer Transition)
- **Dữ liệu đầu vào**: Hồ sơ giả lập biên: submission rate 50% (+2đ), active days 2 ngày (+1đ), các chỉ số khác bình thường. Chạy theo bộ ngưỡng chuẩn yêu cầu (Watch=3, Alert=4).
- **Hành động kiểm thử**: Gọi `calculateDerivedLearner` với hồ sơ biên kiểm thử chuyên biệt.
- **Kết quả mong đợi**: Evidence Score = 3, `alert_status = 'WATCH'` (Theo dõi thêm).
- **Kết quả thực tế**: Evidence Score = 3, `alert_status = 'WATCH'`.
- **Trạng thái**: **PASS** (tính toán khi thực thi)
- **Ý nghĩa sư phạm**: Tạo vùng đệm "Theo dõi thêm" giúp giáo viên chú ý mà không vội vàng áp đặt kế hoạch can thiệp quá sớm.

---

### TC-11: Khả năng chống lỗi mẫu số bằng 0 và dữ liệu thiếu (Division by Zero Resilience)
- **Mã kịch bản**: TC-11
- **Phân loại**: Ổn định hệ thống & Bảo vệ dữ liệu
- **Dữ liệu đầu vào**: `assignments_due = 0`, `code_runs = 0`, `total_tests = 0` (Tuần đầu hoặc chưa giao bài)
- **Hành động kiểm thử**: Tính các biến dẫn xuất tỷ lệ nộp bài, tỷ lệ lỗi, tỷ lệ test pass.
- **Kết quả mong đợi**: Không phát sinh `NaN` hay `Infinity`, các tỷ lệ an toàn bằng 0, không bị phạt điểm nộp bài (due=0) hay test pass (tests=0), `alert_status = NORMAL`.
- **Kết quả thực tế**: Các tỷ lệ tính toán hoàn toàn hữu hạn (finite), không phạt oan học sinh, không gây crash ứng dụng.
- **Trạng thái**: **PASS** (tính toán khi thực thi)
- **Ý nghĩa sư phạm**: Đảm bảo hệ sinh thái toán học ổn định và công bằng trong mọi điều kiện dữ liệu khởi tạo.

---

### TC-12: Xử lý giá trị nằm chính xác tại ngưỡng (Boundary Threshold Values)
- **Mã kịch bản**: TC-12
- **Phân loại**: Kiểm định biên (Strict vs Non-strict comparison)
- **Dữ liệu đầu vào**: `submission_rate = 0.70`, `test_pass_rate = 0.50`, `error_rate = 0.60`, `late_submissions = 2`, `active_days_7d = 2`.
- **Hành động kiểm thử**: Kiểm tra tính tuân thủ của các toán tử so sánh nghiêm ngặt (`<` vs `<=`, `>` vs `>=`) theo cấu hình ngưỡng chuẩn.
- **Kết quả mong đợi**: Các điều kiện nghiêm ngặt (`<0.70`, `<0.50`, `>0.60`) KHÔNG kích hoạt; các điều kiện không nghiêm ngặt (`>=2`, `<=2`) KÍCH HOẠT. Điểm = 2, trạng thái: `NORMAL`.
- **Kết quả thực tế**: Evidence Score = 2, Trạng thái: `NORMAL`.
- **Trạng thái**: **PASS** (tính toán khi thực thi)
- **Ý nghĩa sư phạm**: Tránh phạt oan những sinh viên vừa chạm đúng ngưỡng yêu cầu tối thiểu.

---

### TC-13: Kiểm tra tính toàn vẹn sao lưu: Bắt lỗi bản ghi không hợp lệ ở cuối danh sách
- **Mã kịch bản**: TC-13
- **Phân loại**: An toàn dữ liệu & Kiểm định toàn vẹn
- **Dữ liệu đầu vào**: Tệp JSON sao lưu gồm danh sách 80 học sinh hợp lệ và 1 bản ghi lỗi nằm ở vị trí cuối cùng (#81: `learner_id` bị rỗng).
- **Hành động kiểm thử**: Gọi `StorageService.previewBackup(json)` và kiểm tra kết quả thẩm định.
- **Kết quả mong đợi**: `valid = false`, thông báo lỗi chỉ rõ vị trí và lỗi tại bản ghi thứ 81, từ chối khôi phục và bảo vệ dữ liệu hiện có.
- **Kết quả thực tế**: `valid: false`, bắt lỗi chính xác: *"Hồ sơ thứ 81 thiếu mã định danh learner_id hoặc không hợp lệ"*, không ghi đè dữ liệu.
- **Trạng thái**: **PASS** (tính toán khi thực thi)
- **Ý nghĩa sư phạm**: Ngăn chặn việc khôi phục các tệp sao lưu hỏng làm sai lệch hồ sơ theo dõi học tập của sinh viên.

---

## Danh Sách 02 Kịch Bản Kiểm Thử Giao Diện Thủ Công (Manual UI)

### TC-M01: Kiểm thử Thủ công: Giáo viên xác nhận cảnh báo & lập can thiệp
- **Mã kịch bản**: TC-M01
- **Phân loại**: Giao diện & Tương tác (Human-in-the-Loop Validation)
- **Dữ liệu đầu vào**: Bấm nút *"Xác nhận cần hỗ trợ"* tại hồ sơ `STU023`, nhập ghi chú và chọn hình thức can thiệp sư phạm.
- **Hành động kiểm thử**: Thực hiện thao tác trực tiếp trên modal hồ sơ học sinh và bấm *"Lưu quyết định"*.
- **Kết quả mong đợi**: Trạng thái chuyển thành `CONFIRMED`, lưu thời gian, đồng bộ vào danh sách Can thiệp và Nhật ký AI.
- **Trạng thái mặc định**: **PENDING** (Chờ người dùng/giáo viên thực hiện kiểm tra thực tế trên giao diện và bấm nút xác nhận)
- **Khi được người dùng xác nhận**: Chuyển sang **PASS**, tự động lưu thời điểm kiểm tra, kết quả và ghi chú vào `localStorage` (`codecare_test_cases`).

---

### TC-M02: Kiểm thử Thủ công: Giáo viên ghi đè/bác bỏ cảnh báo (Teacher Override)
- **Mã kịch bản**: TC-M02
- **Phân loại**: Quyền phủ quyết của giáo viên (Teacher Override Authority)
- **Dữ liệu đầu vào**: Bấm nút *"Bác bỏ"* / *"Không cần can thiệp"* đối với `STU015` (Trường hợp False Positive).
- **Hành động kiểm thử**: Thực hiện thao tác bác bỏ trên thẻ cảnh báo hoặc modal hồ sơ học sinh.
- **Kết quả mong đợi**: Trạng thái chuyển thành `DISMISSED`, lưu vào Nhật ký AI, không ép buộc can thiệp sư phạm.
- **Trạng thái mặc định**: **PENDING** (Chờ người dùng/giáo viên thực hiện kiểm tra thực tế trên giao diện và bấm nút xác nhận)
- **Khi được người dùng xác nhận**: Chuyển sang **PASS**, tự động lưu thời điểm kiểm tra, kết quả và ghi chú vào `localStorage` (`codecare_test_cases`).

---

*Tài liệu được cập nhật tự động đồng bộ cùng mã nguồn CodeCare.*
