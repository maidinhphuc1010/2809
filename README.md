# ReactJS Performance Optimization Demo

Demo ReactJS quản lý 10.000 sản phẩm và 10.000 users, đo hiệu năng bằng Lighthouse trước và sau tối ưu.

## Công nghệ

- ReactJS
- Vite
- Lighthouse

## Chức năng

- Hiển thị danh sách sản phẩm và users với dữ liệu lớn.
- Tìm kiếm user/product.
- Sắp xếp sản phẩm theo giá/tồn kho.
- Thống kê số lượng và tổng giá trị tồn kho.
- Tối ưu hiệu năng bằng virtualized list, debounce, memoization và precompute search text.

## Cài đặt

```bash
npm install
```

## Chạy development

```bash
npm run dev
```

## Build production

```bash
npm run build
```

## Preview production

```bash
npm run preview
```

## Lighthouse Reports

Các report đã lưu trong thư mục `reports/`:

- `reports/lighthouse-before.report.html`
- `reports/lighthouse-before.report.json`
- `reports/lighthouse-after.report.html`
- `reports/lighthouse-after.report.json`
- `reports/performance-optimization-report.md`

## Kết quả chính

| Metric | Trước tối ưu | Sau tối ưu |
|---|---:|---:|
| Performance | 39 | 100 |
| FCP | 1.2 s | 1.2 s |
| LCP | 5.9 s | 1.4 s |
| TBT | 14,550 ms | 10 ms |
| CLS | 0 | 0 |
| Speed Index | 14.2 s | 1.2 s |

## Kết luận

Sau tối ưu, Performance tăng từ 39 lên 100. Cải thiện lớn nhất là TBT giảm từ 14,550 ms xuống 10 ms nhờ không render toàn bộ 20.000 rows vào DOM mà dùng virtualized list.
