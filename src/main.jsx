import React, { memo, useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const PRODUCT_COUNT = 10000;
const USER_COUNT = 10000;
const ROW_HEIGHT = 76;
const LIST_HEIGHT = 520;
const OVERSCAN = 8;

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});
const numberFormatter = new Intl.NumberFormat('vi-VN');

function calculateScore(seed) {
  return Math.round(Math.sqrt(seed * 9973) + (seed % 113));
}

function createProducts() {
  const categories = ['Laptop', 'Điện thoại', 'Phụ kiện', 'Màn hình', 'Thiết bị mạng'];
  return Array.from({ length: PRODUCT_COUNT }, (_, index) => {
    const id = index + 1;
    const name = `Sản phẩm cao cấp ${id}`;
    const category = categories[index % categories.length];
    const price = 99000 + ((index * 7919) % 48000000);
    const stock = (index * 37) % 500;
    return { id, name, category, price, stock, rating: ((index * 13) % 50) / 10, score: calculateScore(id + stock), searchText: `${name} ${category}`.toLowerCase() };
  });
}

function createUsers() {
  const roles = ['Admin', 'Manager', 'Staff', 'Customer'];
  const cities = ['Hà Nội', 'TP.HCM', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng'];
  return Array.from({ length: USER_COUNT }, (_, index) => {
    const id = index + 1;
    const name = `Người dùng ${id}`;
    const email = `user${id}@example.com`;
    const city = cities[index % cities.length];
    return { id, name, email, role: roles[index % roles.length], city, orders: (index * 19) % 200, score: calculateScore(id + 10001), searchText: `${name} ${email} ${city}`.toLowerCase() };
  });
}

const initialProducts = createProducts();
const initialUsers = createUsers();

function useDebouncedValue(value, delay = 250) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedValue(value), delay);
    return () => window.clearTimeout(timer);
  }, [delay, value]);
  return debouncedValue;
}

function useVirtualRows(items, rowHeight = ROW_HEIGHT, containerHeight = LIST_HEIGHT) {
  const [scrollTop, setScrollTop] = useState(0);
  const totalHeight = items.length * rowHeight;
  const visibleCount = Math.ceil(containerHeight / rowHeight) + OVERSCAN * 2;
  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - OVERSCAN);
  const endIndex = Math.min(items.length, startIndex + visibleCount);
  return { totalHeight, visibleItems: items.slice(startIndex, endIndex), startIndex, onScroll: (event) => setScrollTop(event.currentTarget.scrollTop) };
}

const ProductRow = memo(function ProductRow({ product, index }) {
  return (
    <article className="row product-row" style={{ transform: `translateY(${index * ROW_HEIGHT}px)` }}>
      <div><b>#{product.id} {product.name}</b><span>{product.category}</span></div>
      <div>{currencyFormatter.format(product.price)}</div>
      <div>Tồn: {product.stock}</div>
      <div>Rating: {product.rating.toFixed(1)}</div>
      <div>Score: {product.score}</div>
    </article>
  );
});

const UserRow = memo(function UserRow({ user, index }) {
  return (
    <article className="row user-row" style={{ transform: `translateY(${index * ROW_HEIGHT}px)` }}>
      <div><b>#{user.id} {user.name}</b><span>{user.email}</span></div>
      <div>{user.role}</div>
      <div>{user.city}</div>
      <div>Orders: {user.orders}</div>
      <div>Score: {user.score}</div>
    </article>
  );
});

function VirtualList({ title, items, type }) {
  const { totalHeight, visibleItems, startIndex, onScroll } = useVirtualRows(items);
  return (
    <section className="panel" aria-label={title}>
      <div className="panel-heading"><h2>{title}</h2><span>{numberFormatter.format(items.length)} bản ghi</span></div>
      <div className="virtual-list" onScroll={onScroll} tabIndex="0">
        <div className="virtual-list-inner" style={{ height: `${totalHeight}px` }}>
          {visibleItems.map((item, offset) => type === 'product'
            ? <ProductRow key={item.id} product={item} index={startIndex + offset} />
            : <UserRow key={item.id} user={item} index={startIndex + offset} />)}
        </div>
      </div>
    </section>
  );
}

function App() {
  const [keyword, setKeyword] = useState('');
  const [sortMode, setSortMode] = useState('price-desc');
  const debouncedKeyword = useDebouncedValue(keyword);
  const normalizedKeyword = debouncedKeyword.trim().toLowerCase();

  const filteredProducts = useMemo(() => {
    const filtered = normalizedKeyword ? initialProducts.filter((product) => product.searchText.includes(normalizedKeyword)) : initialProducts;
    return [...filtered].sort((a, b) => {
      if (sortMode === 'price-asc') return a.price - b.price;
      if (sortMode === 'stock-desc') return b.stock - a.stock;
      return b.price - a.price;
    });
  }, [normalizedKeyword, sortMode]);

  const filteredUsers = useMemo(() => normalizedKeyword ? initialUsers.filter((user) => user.searchText.includes(normalizedKeyword)) : initialUsers, [normalizedKeyword]);
  const totalInventoryValue = useMemo(() => filteredProducts.reduce((sum, product) => sum + product.price * product.stock, 0), [filteredProducts]);
  const renderedRowsEstimate = Math.min(filteredProducts.length, 22) + Math.min(filteredUsers.length, 22);

  return (
    <main className="page-shell">
      <section className="hero">
        <p className="eyebrow">ReactJS Performance Demo - After Optimization</p>
        <h1>Quản lý User/Product với 20.000 bản ghi đã tối ưu</h1>
        <p>Vẫn giữ 10.000 sản phẩm và 10.000 users, nhưng chỉ render các dòng đang nhìn thấy, giảm block main thread và debounce thao tác tìm kiếm.</p>
      </section>
      <section className="toolbar" aria-label="Bộ lọc dữ liệu">
        <label htmlFor="keyword">Tìm kiếm<input id="keyword" value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Nhập tên, email, danh mục..." /></label>
        <label htmlFor="sortMode">Sắp xếp sản phẩm<select id="sortMode" value={sortMode} onChange={(event) => setSortMode(event.target.value)}><option value="price-desc">Giá giảm dần</option><option value="price-asc">Giá tăng dần</option><option value="stock-desc">Tồn kho giảm dần</option></select></label>
      </section>
      <section className="stats-grid" aria-label="Thống kê tổng quan">
        <article><strong>{numberFormatter.format(filteredProducts.length)}</strong><span>Sản phẩm</span></article>
        <article><strong>{numberFormatter.format(filteredUsers.length)}</strong><span>Users</span></article>
        <article><strong>{currencyFormatter.format(totalInventoryValue)}</strong><span>Giá trị tồn kho</span></article>
        <article><strong>~{renderedRowsEstimate}</strong><span>DOM rows thực render</span></article>
      </section>
      <section className="data-layout">
        <VirtualList title="Danh sách sản phẩm" items={filteredProducts} type="product" />
        <VirtualList title="Danh sách users" items={filteredUsers} type="user" />
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
