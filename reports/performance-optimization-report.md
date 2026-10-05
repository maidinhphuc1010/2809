# Báo cáo tối ưu hiệu năng ReactJS

## 1. Thông tin bài làm

- Ứng dụng: Trang quản lý User/Product bằng ReactJS.
- Dữ liệu kiểm thử: 10.000 sản phẩm và 10.000 users.
- Công cụ build: Vite.
- Công cụ đo hiệu năng: Lighthouse.
- Môi trường đo: Production build chạy bằng `vite preview` tại `http://127.0.0.1:4173`.

## 2. Hiện trạng trước khi tối ưu

Phiên bản ban đầu cố ý chưa tối ưu để tạo baseline:

- Render trực tiếp toàn bộ 10.000 sản phẩm và 10.000 users ra DOM.
- Tổng số row DOM xấp xỉ 20.000.
- Có tính toán nặng lặp lại trong quá trình filter/map dữ liệu.
- Tìm kiếm và sắp xếp chạy đồng bộ trên main thread.
- Chưa có debounce khi nhập tìm kiếm.
- Chưa dùng virtualized list/windowing.

## 3. Các kỹ thuật đã tối ưu

### 3.1. Virtualized list

Thay vì render toàn bộ 20.000 dòng, ứng dụng chỉ render các dòng đang hiển thị trong khung scroll.

- Mỗi danh sách có chiều cao cố định 520px.
- Mỗi row có chiều cao 76px.
- Có overscan để scroll mượt hơn.
- Tổng DOM rows thực render chỉ khoảng 40-50 dòng thay vì 20.000 dòng.

Hiệu quả:

- Giảm số lượng DOM node cực lớn.
- Giảm thời gian layout, paint và style calculation.
- Giảm Total Blocking Time.

### 3.2. Debounce tìm kiếm

Thêm hook `useDebouncedValue` với delay 250ms.

Hiệu quả:

- Khi người dùng gõ liên tục, app không filter lại 20.000 bản ghi ở mỗi phím bấm.
- Giảm re-render không cần thiết.
- Cải thiện độ phản hồi UI.

### 3.3. Precompute dữ liệu tìm kiếm

Mỗi item có sẵn trường `searchText` dạng lowercase.

Trước tối ưu, mỗi lần filter phải nối chuỗi và gọi `toLowerCase()` nhiều lần. Sau tối ưu, filter chỉ cần kiểm tra:

```js
item.searchText.includes(normalizedKeyword)
```

Hiệu quả:

- Giảm chi phí xử lý chuỗi khi lọc dữ liệu lớn.
- Giảm tải main thread.

### 3.4. Giảm tính toán nặng trong render/filter

Bản trước dùng `expensiveScore` trong map/filter, làm tăng thời gian xử lý. Bản sau chuyển sang tính score nhẹ hơn và tính sẵn trong bước tạo dữ liệu.

Hiệu quả:

- Không tính toán nặng lặp lại khi render.
- Giảm blocking time.

### 3.5. Memoization

Sử dụng:

- `useMemo` cho filter/sort sản phẩm.
- `useMemo` cho filter users.
- `useMemo` cho tổng giá trị tồn kho.
- `React.memo` cho row sản phẩm và row user.
- Formatter tiền tệ và số được tạo một lần ngoài component.

Hiệu quả:

- Giảm số lần tính toán lại không cần thiết.
- Giảm chi phí tạo object/function trong render.

### 3.6. Bổ sung SEO/accessibility cơ bản

- Thêm meta description.
- Giữ `html lang="vi"`.
- Liên kết `label` với input/select bằng `htmlFor` và `id`.
- Thêm `aria-label` cho các section chính.

Hiệu quả:

- Cải thiện điểm Accessibility và SEO trên Lighthouse.

## 4. Kết quả Lighthouse trước và sau tối ưu

| Chỉ số | Trước tối ưu | Sau tối ưu | Cải thiện |
|---|---:|---:|---:|
| Performance | 39 | 100 | +61 điểm |
| Accessibility | 0 | 100 | +100 điểm |
| Best Practices | 96 | 96 | 0 điểm |
| SEO | 0 | 91 | +91 điểm |

## 5. So sánh các metric hiệu năng chính

| Metric | Trước tối ưu | Sau tối ưu | Nhận xét |
|---|---:|---:|---|
| FCP | 1.2 s | 1.2 s | Gần như giữ nguyên vì nội dung đầu tiên vẫn hiển thị nhanh. |
| LCP | 5.9 s | 1.4 s | Cải thiện rõ do giảm render/layout DOM lớn. |
| TBT | 14,550 ms | 10 ms | Cải thiện rất mạnh nhờ virtualized list và giảm tính toán nặng. |
| CLS | 0 | 0 | Ổn định, không bị layout shift. |
| Speed Index | 14.2 s | 1.2 s | Cải thiện mạnh do giảm lượng DOM render ban đầu. |

## 6. File report Lighthouse

### Trước tối ưu

- HTML: `reports/lighthouse-before.report.html`
- JSON: `reports/lighthouse-before.report.json`

### Sau tối ưu

- HTML: `reports/lighthouse-after.report.html`
- JSON: `reports/lighthouse-after.report.json`

## 7. Kết luận

Sau khi tối ưu, điểm Performance tăng từ **39** lên **100**. Chỉ số quan trọng nhất được cải thiện là **Total Blocking Time**, giảm từ **14,550 ms** xuống **10 ms**.

Nguyên nhân chính là ứng dụng không còn render toàn bộ 20.000 dòng vào DOM. Thay vào đó, app sử dụng virtualized list để chỉ render phần dữ liệu đang nhìn thấy. Kết hợp với debounce, memoization và precompute dữ liệu tìm kiếm, trang trở nên nhẹ hơn và phản hồi nhanh hơn đáng kể.
