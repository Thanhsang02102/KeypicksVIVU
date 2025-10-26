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

### 🐳 Docker-First Development (Khuyến nghị)

**Dự án được thiết kế để chạy hoàn toàn trong Docker environment:**

- ✅ **Timezone**: UTC trong tất cả containers (MongoDB & Express server)
- ✅ **Seed Data**: Tự động convert từ Asia/Ho_Chi_Minh (UTC+7) sang UTC
- ✅ **Network**: Containers sử dụng service names (`mongodb`, `app`) - không dùng localhost
- ✅ **Consistency**: Đảm bảo môi trường dev giống production

#### Setup lần đầu

Chạy script tự động setup:

```bash
# Linux/Mac
./init.sh

# Windows PowerShell
.\init.ps1
```

Script sẽ tự động:

- ✅ Kiểm tra Docker installation
- ✅ Tạo file `.env`
- ✅ Pull và build Docker images với timezone UTC
- ✅ Khởi động services (nếu bạn chọn)
- ✅ Seed database với Vietnam timezone data (tự động convert sang UTC)
- ✅ Build Tailwind CSS locally

> **💡 Lưu ý CSS**: Website sử dụng Tailwind CSS và Font Awesome được host locally (không dùng CDN). Nếu bạn chỉnh sửa HTML/CSS, chạy `npm run build:css` để rebuild. Xem [CSS Build Guide](docs/CSS_BUILD_GUIDE.md) để biết thêm chi tiết.

#### Development Commands

```bash
# Khởi động tất cả services (app + MongoDB + Mongo Express)
docker-compose up

# Hoặc dùng Makefile
make dev

# Seed database (Vietnam timezone → UTC)
make seed

# Kiểm tra timezone
make timezone
```

**Truy cập từ host machine:**

- Ứng dụng: http://localhost:3000
- Mongo Express (DB Admin): http://localhost:8081
  - Username: `admin`
  - Password: `admin123`

**Lưu ý**: Chỉ truy cập từ host machine qua localhost. Bên trong containers, services kết nối với nhau qua service names (`mongodb`, `app`).

#### 🐞 DevContainer & Debugging (VS Code)

**Khuyến nghị cho debugging và development trong VS Code:**

DevContainer cho phép bạn phát triển trong một container Docker được cấu hình sẵn với tất cả tools và extensions cần thiết.

**Setup:**

1. Cài đặt extension **Dev Containers** trong VS Code
2. Nhấn `F1` > **Dev Containers: Reopen in Container**
3. Đợi container khởi động (lần đầu mất vài phút)

**Tính năng:**

- ✅ Auto-install extensions (ESLint, Prettier, MongoDB, Docker, Tailwind CSS)
- ✅ Full debugging support với breakpoints
- ✅ Hot reload với nodemon
- ✅ MongoDB integration trực tiếp trong VS Code
- ✅ VS Code tasks (Start Server, Seed DB, Build CSS, etc.)

**Debug:**

- Nhấn `F5` để start debugging
- Chọn **Debug Express with Nodemon** (recommended)
- Đặt breakpoints bằng cách click vào lề bên trái
- Debug console, watch variables, call stack đầy đủ

📖 **Xem thêm**: [Development Guide - DevContainer Section](docs/DEVELOPMENT_GUIDE.md#-devcontainer-setup-recommended-for-debugging)

#### Production

```bash
# Khởi động production environment
docker-compose -f docker-compose.prod.yml up -d

# Hoặc dùng Makefile
make prod
```

📖 **Xem thêm**: [Hướng dẫn Docker](docs/DOCKER_GUIDE.md) và [Development Guide](docs/DEVELOPMENT_GUIDE.md)

## 📁 Cấu trúc dự án

```
KeypicksVIVU/
├── config/              # Cấu hình ứng dụng
├── middleware/          # Express middlewares
├── models/              # MongoDB models
├── routes/              # API routes
├── scripts/             # Utility scripts (seed data, etc.)
├── docs/                # Tài liệu hướng dẫn
├── ui/                  # Frontend files
│   ├── css/             # Stylesheets (Tailwind, Font Awesome, custom)
│   │   ├── tailwind.css        # Built Tailwind CSS (generated)
│   │   ├── tailwind-input.css  # Tailwind source file
│   │   ├── fontawesome.min.css # Font Awesome (local)
│   │   ├── animations.css
│   │   ├── components.css
│   │   ├── pages.css
│   │   └── responsive.css
│   ├── fonts/           # Font Awesome fonts (local)
│   ├── js/              # JavaScript files
│   ├── pages/           # HTML pages
│   └── img/             # Images and assets
├── server.js            # Entry point
├── tailwind.config.js   # Tailwind CSS configuration
├── Dockerfile           # Production Docker image
├── Dockerfile.dev       # Development Docker image
├── docker-compose.yml   # Dev environment
└── docker-compose.prod.yml # Production environment
```

## 🔧 Scripts

### Backend

- `npm start` - Khởi động production server
- `npm run dev` - Khởi động development server với hot reload
- `npm run seed` - Seed database với dữ liệu mẫu

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
TZ=UTC  # Timezone UTC cho consistency

# MongoDB - Sử dụng Docker service name
MONGODB_URI=mongodb://admin:admin123@mongodb:27017/keypicksvivu?authSource=admin

# JWT Authentication
JWT_SECRET=your-dev-jwt-secret-key-change-in-production
JWT_EXPIRE=7d

# API - Relative path cho Docker environment
API_BASE_URL=/api
```

**⚠️ Lưu ý quan trọng:**

- Không dùng `localhost` trong MONGODB_URI - sử dụng service name `mongodb`
- Timezone luôn là `UTC` trong containers
- **Datetime: BẮT BUỘC sử dụng ISO8601 format** (xem [DATETIME_GUIDE.md](docs/DATETIME_GUIDE.md))

## 🐳 Docker Architecture

Dự án được thiết kế **Docker-first** với các đặc điểm:

### Docker Images

- **Dockerfile** - Production-ready image với multi-stage build
- **Dockerfile.dev** - Development image với hot reload và timezone UTC

### Docker Compose

- **docker-compose.yml** - Development environment:
  - 🚀 Express App (Node 24 Alpine, timezone UTC)
  - 🗄️ MongoDB 7.0 (timezone UTC)
  - 🖥️ Mongo Express (Database UI)
- **docker-compose.prod.yml** - Production environment

### Datetime Strategy

- **Format**: BẮT BUỘC ISO8601 (`YYYY-MM-DDTHH:mm:ss.sssZ` hoặc `YYYY-MM-DD`)
- **Backend**: Lưu Date objects, middleware tự động serialize → ISO8601
- **Frontend**: Gửi ISO8601, nhận ISO8601, dùng Utils functions để format
- **Database**: Lưu trữ timestamps ở UTC
- **Benefits**:
  - Đơn giản, chuẩn quốc tế
  - Tự động xử lý bởi middleware
  - Không có timezone bugs

Xem chi tiết: [DATETIME_GUIDE.md](docs/DATETIME_GUIDE.md)

### Network Architecture

- **Internal**: Containers kết nối qua service names (`mongodb`, `app`)
- **External**: Host machine truy cập qua `localhost:3000`, `localhost:8081`

Xem [Hướng dẫn Docker](docs/DOCKER_GUIDE.md) và [Setup Database](docs/SETUP_DATABASE.md) để biết chi tiết.

## 📝 License

ISC

## 👥 Contributors

- Your Team
