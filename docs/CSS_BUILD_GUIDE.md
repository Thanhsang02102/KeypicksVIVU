# Hướng dẫn Build CSS Locally

## Tổng quan

Website KeyPicks VIVU đã được cấu hình để sử dụng **Tailwind CSS** và **Font Awesome** locally thay vì từ CDN. Điều này giúp:

- ✅ Tránh vấn đề cookie của bên thứ 3 (third-party cookies)
- ✅ Tăng tốc độ tải trang (không phụ thuộc vào CDN bên ngoài)
- ✅ Hoạt động offline
- ✅ Kiểm soát tốt hơn về phiên bản và customization

## Cấu trúc File

```
ui/
├── css/
│   ├── tailwind-input.css      # Input file cho Tailwind (chứa @tailwind directives)
│   ├── tailwind.css            # Output file đã build (được generate tự động)
│   ├── fontawesome.min.css     # Font Awesome CSS
│   ├── animations.css          # Custom animations
│   ├── components.css          # Custom components
│   ├── pages.css               # Page-specific styles
│   └── responsive.css          # Responsive styles
├── fonts/                      # Font Awesome fonts (local)
│   ├── fa-brands-400.ttf
│   ├── fa-brands-400.woff2
│   ├── fa-regular-400.ttf
│   ├── fa-regular-400.woff2
│   ├── fa-solid-900.ttf
│   └── fa-solid-900.woff2
└── ...

tailwind.config.js              # Cấu hình Tailwind CSS
```

## Build Commands

### Build Tailwind CSS (Production)

```bash
npm run build:css
```

Lệnh này sẽ:
- Đọc file `ui/css/tailwind-input.css`
- Scan tất cả HTML và JS files trong thư mục `ui/`
- Generate file `ui/css/tailwind.css` đã minified

### Watch Mode (Development)

```bash
npm run watch:css
```

Lệnh này sẽ watch file changes và tự động rebuild khi có thay đổi. Hữu ích khi đang develop.

## Cấu hình Tailwind

File `tailwind.config.js` chứa cấu hình Tailwind:

```javascript
module.exports = {
  content: [
    "./ui/**/*.{html,js}",
    "./ui/*.{html,js}"
  ],
  theme: {
    extend: {
      colors: {
        'vna-primary': '#0B4F9A',
        'vna-secondary': '#ffc107',
      },
    },
  },
  plugins: [],
}
```

## Thêm Custom Styles

### Thêm Tailwind Utilities

Thêm vào file `ui/css/tailwind-input.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom utilities */
@layer utilities {
  .custom-class {
    /* your styles */
  }
}
```

### Thêm Custom Components

```css
@layer components {
  .btn-primary {
    @apply bg-blue-500 text-white px-4 py-2 rounded;
  }
}
```

Sau đó chạy `npm run build:css` để rebuild.

## Sử dụng trong HTML

Tất cả HTML files đã được cấu hình để load CSS local:

**Cho trang chủ (`ui/index.html`):**
```html
<link rel="stylesheet" href="css/tailwind.css">
<link rel="stylesheet" href="css/fontawesome.min.css">
<link rel="stylesheet" href="style.css">
```

**Cho các trang trong `ui/pages/`:**
```html
<link rel="stylesheet" href="../css/tailwind.css">
<link rel="stylesheet" href="../css/fontawesome.min.css">
```

## Update Dependencies

### Update Tailwind CSS

```bash
npm update tailwindcss
npm run build:css
```

### Update Font Awesome

```bash
npm update @fortawesome/fontawesome-free
# Sau đó copy lại files:
cp -r node_modules/@fortawesome/fontawesome-free/webfonts/* ui/fonts/
cp node_modules/@fortawesome/fontawesome-free/css/all.min.css ui/css/fontawesome.min.css
# Sửa đường dẫn font trong fontawesome.min.css (../webfonts/ -> ../fonts/)
```

## Troubleshooting

### CSS không cập nhật sau khi thay đổi

1. Rebuild CSS: `npm run build:css`
2. Clear browser cache (Ctrl+Shift+R hoặc Cmd+Shift+R)
3. Kiểm tra console để xem có lỗi load CSS không

### Font Awesome icons không hiển thị

1. Kiểm tra đường dẫn font trong `ui/css/fontawesome.min.css` phải là `../fonts/`
2. Verify các font files tồn tại trong `ui/fonts/`
3. Kiểm tra network tab trong DevTools để xem font có load thành công không

### Tailwind classes không hoạt động

1. Verify class đó tồn tại trong Tailwind CSS
2. Kiểm tra file HTML có trong `content` array của `tailwind.config.js` không
3. Rebuild CSS: `npm run build:css`

## Development Workflow

1. **Bắt đầu development:**
   ```bash
   npm run watch:css    # Terminal 1 - Watch CSS changes
   npm run dev          # Terminal 2 - Run backend server
   ```

2. **Thay đổi HTML/CSS:**
   - CSS sẽ tự động rebuild nhờ watch mode
   - Refresh browser để xem thay đổi

3. **Deploy production:**
   ```bash
   npm run build:css    # Build CSS minified
   npm start            # Start production server
   ```

## Performance Notes

- File `tailwind.css` đã được minified cho production
- Chỉ các classes được sử dụng trong HTML mới được include (PurgeCSS)
- Font Awesome fonts được cache bởi browser
- Tổng kích thước CSS + Fonts: ~500KB (đã nén)

## Lợi ích so với CDN

| Tiêu chí | CDN | Local |
|----------|-----|-------|
| Third-party cookies | ❌ Có | ✅ Không |
| Tốc độ (sau cache) | Nhanh | ✅ Rất nhanh |
| Offline support | ❌ Không | ✅ Có |
| Customization | Giới hạn | ✅ Đầy đủ |
| Privacy | ❌ Tracking | ✅ Privacy-friendly |
| Build step | Không | Có (1 lần) |

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Font Awesome Documentation](https://fontawesome.com/docs)
- [PostCSS Documentation](https://postcss.org/)

