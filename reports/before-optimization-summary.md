# Lighthouse Report - Before Optimization

Ứng dụng: ReactJS quản lý User/Product với 10.000 sản phẩm và 10.000 users.

## Mục tiêu bản trước tối ưu

Trang được xây dựng cố ý chưa tối ưu để làm baseline đo hiệu năng:

- Render trực tiếp toàn bộ 20.000 dòng dữ liệu vào DOM.
- Tính toán `expensiveScore` trên main thread.
- Lọc/sắp xếp dữ liệu lớn đồng bộ khi nhập search hoặc đổi sort.
- Chưa dùng virtualization/windowing.
- Chưa tách component/lazy loading/code splitting.

## Lighthouse scores

| Hạng mục | Điểm |
|---|---:|
| Performance | 39 |
| Accessibility | 0 |
| Best Practices | 96 |
| SEO | 0 |

## Chỉ số hiệu năng chính

| Metric | Giá trị |
|---|---:|
| First Contentful Paint (FCP) | 1.2 s |
| Largest Contentful Paint (LCP) | 5.9 s |
| Total Blocking Time (TBT) | 14,550 ms |
| Cumulative Layout Shift (CLS) | 0 |
| Speed Index | 14.2 s |

## File report đã lưu

- HTML: `reports/lighthouse-before.report.html`
- JSON: `reports/lighthouse-before.report.json`

## Ghi chú

Lighthouse có báo runtime warning: `Waiting for DevTools protocol response has exceeded the allotted time`, nhưng vẫn xuất được report và các metric. Nguyên nhân phù hợp với baseline chưa tối ưu: DOM rất lớn và main thread bị block nặng.
