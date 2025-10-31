# KeypicksVIVU ✈️

Hệ thống đặt vé máy bay trực tuyến

## 📚 Tài liệu

- 🚀 [Hướng dẫn Khởi động nhanh](docs/QUICKSTART.md)
- 🐳 [Hướng dẫn Docker](docs/DOCKER_GUIDE.md)
- 🛠️ [Hướng dẫn Development](docs/DEVELOPMENT_GUIDE.md)
- 📦 [Hướng dẫn Deployment](docs/DEPLOYMENT.md)
- 🗄️ [Setup Database](docs/SETUP_DATABASE.md)
- 💻 [Database Commands](docs/DATABASE_COMMANDS_GUIDE.md)
- 📅 [Datetime Guide](docs/DATETIME_GUIDE.md) - **BẮT BUỘC sử dụng ISO8601 format cho mọi datetime**
- 🎨 [CSS Build Guide](docs/CSS_BUILD_GUIDE.md) - **Hướng dẫn build Tailwind CSS & Font Awesome locally**
- 💰 [Pricing Module](docs/PRICING_MODULE.md) - **Module giá vé (sẽ triển khai sau)**

## 📋 Tính năng chính

- 🔍 Tìm kiếm chuyến bay
- 📅 Đặt vé trực tuyến
- 👤 Quản lý tài khoản người dùng
- 📊 Lịch sử đặt vé
- 🔐 Xác thực và phân quyền
- 💳 Xử lý thanh toán
- 🎨 **CSS Local Hosting** - Tailwind CSS & Font Awesome được host locally (không dùng CDN, tránh third-party cookies)

## 🚀 Khởi động nhanh

Chỉ cần chọn 1 trong 2 cách sau để bắt đầu:

### Option 1: Quick Start Script (Khuyến nghị) ⚡

Script tự động setup mọi thứ chỉ với 1 lệnh!

```bash
# Linux/Mac
chmod +x quick-start.sh
./quick-start.sh

# Windows PowerShell
.\quick-start.ps1
```

**Script sẽ tự động:**
- ✅ Kiểm tra Node.js 24+, npm 10+, Docker
- ✅ Tạo file `.env` từ `env.example`
- ✅ Cài đặt dependencies
- ✅ Khởi động MongoDB và Mongo Express
- ✅ Seed database (nếu bạn chọn Yes)

**Sau khi script chạy xong:**
```bash
npm run dev
```

### Option 2: DevContainer (VS Code) 🐳

Nếu bạn dùng VS Code, mở project và chọn **"Reopen in Container"** khi được hỏi.

DevContainer sẽ tự động:
- ✅ Setup toàn bộ môi trường development
- ✅ Cài đặt Node.js, MongoDB
- ✅ Cài đặt dependencies
- ✅ Sẵn sàng code ngay!

---

### Truy cập ứng dụng

- **App**: http://localhost:3000
- **Mongo Express** (Database UI): http://localhost:8081
  - Username: `admin`
  - Password: `admin123`

> **💡 Lưu ý CSS**: Website sử dụng Tailwind CSS và Font Awesome được host locally. Nếu chỉnh sửa HTML/CSS, chạy `npm run build:css`. Xem [CSS Build Guide](docs/CSS_BUILD_GUIDE.md) để biết thêm chi tiết.

📖 **Xem thêm**: [Quick Start Guide](docs/QUICKSTART.md) và [Development Guide](docs/DEVELOPMENT_GUIDE.md)

## 📁 Cấu trúc dự án

```
KeypicksVIVU/
├── config/                    # Cấu hình ứng dụng
├── middleware/                # Express middlewares
├── models/                    # MongoDB models
├── routes/                    # API routes
├── scripts/                   # Utility scripts (seed data, etc.)
├── docs/                      # Tài liệu hướng dẫn
├── ui/                        # Frontend files
│   ├── css/                   # Stylesheets (Tailwind, Font Awesome, custom)
│   │   ├── tailwind.css              # Built Tailwind CSS (generated)
│   │   ├── tailwind-input.css        # Tailwind source file
│   │   ├── fontawesome.min.css       # Font Awesome (local)
│   │   ├── animations.css
│   │   ├── components.css
│   │   ├── pages.css
│   │   └── responsive.css
│   ├── fonts/                 # Font Awesome fonts (local)
│   ├── js/                    # JavaScript files
│   ├── pages/                 # HTML pages
│   └── img/                   # Images and assets
├── server.js                  # Entry point
├── tailwind.config.js         # Tailwind CSS configuration
├── docker-compose.yml         # MongoDB & Mongo Express containers
├── docker-compose.prod.yml    # Production environment
├── Dockerfile                 # Production Docker image
├── .devcontainer/             # VS Code DevContainer config (nếu cần)
│   └── devcontainer.json
├── quick-start.sh             # Quick start script (Linux/Mac)
└── quick-start.ps1            # Quick start script (Windows)
```

## 🔧 Scripts

### Backend

- `npm start` - Khởi động production server
- `npm run dev` - Khởi động development server với hot reload (chạy locally)
- `npm run seed` - Seed database với dữ liệu mẫu (chạy locally)
- `npm run seed:clear` - Xóa toàn bộ dữ liệu trong database

### Frontend (CSS)

- `npm run build:css` - Build Tailwind CSS cho production (minified)
- `npm run watch:css` - Watch mode cho development (auto-rebuild)

📖 **Chi tiết**: Xem [CSS Build Guide](docs/CSS_BUILD_GUIDE.md) để biết cách build CSS locally và tránh third-party cookies

## 🌐 API Endpoints

### Authentication

- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất

### Flights

- `GET /api/flights` - Lấy danh sách chuyến bay
- `GET /api/flights/:id` - Lấy thông tin chi tiết chuyến bay
- `GET /api/flights/search` - Tìm kiếm chuyến bay

### Bookings

- `POST /api/bookings` - Tạo đặt vé
- `GET /api/bookings` - Lấy danh sách đặt vé
- `GET /api/bookings/:id` - Chi tiết đặt vé
- `PUT /api/bookings/:id` - Cập nhật đặt vé
- `DELETE /api/bookings/:id` - Hủy đặt vé

### Users

- `GET /api/users/profile` - Lấy thông tin profile
- `PUT /api/users/profile` - Cập nhật profile

### Health Check

- `GET /api/health` - Kiểm tra trạng thái server

## 🔐 Biến môi trường

File `.env` được tự động tạo từ `env.example`. Các biến quan trọng:

```env
# Node Environment
NODE_ENV=development
PORT=3000

# MongoDB - Kết nối qua localhost (Docker expose port 27017)
MONGODB_URI=mongodb://admin:admin123@localhost:27017/keypicksvivu?authSource=admin

# JWT Authentication
JWT_SECRET=your-dev-jwt-secret-key-change-in-production
JWT_EXPIRE=7d

# API Configuration
API_BASE_URL=http://localhost:3000/api
```

**⚠️ Lưu ý quan trọng:**

- App chạy locally, kết nối MongoDB qua `localhost:27017`
- MongoDB credentials: `admin` / `admin123` (chỉ dùng cho development)
- **Datetime: BẮT BUỘC sử dụng ISO8601 format** (xem [DATETIME_GUIDE.md](docs/DATETIME_GUIDE.md))

## 🏗️ Development Architecture

### Setup Development

- **MongoDB**: Chạy trong Docker container, expose port `27017`
- **Mongo Express**: Chạy trong Docker container, port `8081`
- **App**: Chạy locally trên máy của bạn, port `3000`
- **Connection**: App kết nối MongoDB qua `localhost:27017`

### Datetime Strategy

- **Format**: BẮT BUỘC ISO8601 (`YYYY-MM-DDTHH:mm:ss.sssZ` hoặc `YYYY-MM-DD`)
- **Backend**: Lưu Date objects, middleware tự động serialize → ISO8601
- **Frontend**: Gửi ISO8601, nhận ISO8601, dùng Utils functions để format
- **Database**: Lưu trữ timestamps ở UTC

Xem chi tiết: [DATETIME_GUIDE.md](docs/DATETIME_GUIDE.md)

📖 **Tài liệu deployment**: [DEPLOYMENT.md](docs/DEPLOYMENT.md) | [Setup Database](docs/SETUP_DATABASE.md)

## 📝 License

ISC

## 👥 Contributors

- Your Team
