.PHONY: help dev dev-build dev-down dev-logs prod prod-build prod-down prod-logs clean seed seed-clear db-reset db-backup db-restore shell db-shell restart-app health stats install logs-app logs-db ps timezone

help: ## Hiển thị trợ giúp
	@echo "KeypicksVIVU - Docker Commands"
	@echo ""
	@echo "📝 Lưu ý: Tất cả commands chạy trong Docker containers"
	@echo "   - Timezone: UTC trong tất cả containers"
	@echo "   - MongoDB: Sử dụng service name 'mongodb' (không dùng localhost)"
	@echo "   - Seed data: Tự động convert từ Asia/Ho_Chi_Minh sang UTC"
	@echo ""
	@echo "Development:"
	@echo "  make dev         - Khởi động môi trường dev"
	@echo "  make dev-build   - Build và khởi động môi trường dev"
	@echo "  make dev-down    - Dừng môi trường dev"
	@echo "  make dev-logs    - Xem logs của môi trường dev"
	@echo ""
	@echo "Database:"
	@echo "  make seed        - Seed dữ liệu mẫu (Vietnam timezone → UTC)"
	@echo "  make seed-clear  - Xóa toàn bộ dữ liệu trong database"
	@echo "  make db-reset    - Reset database (xóa + seed lại)"
	@echo "  make db-shell    - Truy cập MongoDB shell (trong container)"
	@echo "  make db-backup   - Backup database"
	@echo "  make db-restore  - Restore database từ backup"
	@echo ""
	@echo "Production:"
	@echo "  make prod        - Khởi động môi trường production"
	@echo "  make prod-build  - Build và khởi động môi trường production"
	@echo "  make prod-down   - Dừng môi trường production"
	@echo "  make prod-logs   - Xem logs của môi trường production"
	@echo ""
	@echo "Utilities:"
	@echo "  make clean       - Dọn dẹp containers, volumes và images"
	@echo "  make shell       - Truy cập shell của app container"
	@echo "  make health      - Kiểm tra health của ứng dụng"
	@echo "  make stats       - Xem resource usage"
	@echo "  make timezone    - Kiểm tra timezone trong containers"

# Development Commands
dev: ## Khởi động môi trường development
	docker-compose up

dev-build: ## Build và khởi động môi trường development
	docker-compose up --build

dev-down: ## Dừng môi trường development
	docker-compose down

dev-logs: ## Xem logs của môi trường development
	docker-compose logs -f

# Production Commands
prod: ## Khởi động môi trường production
	@if [ ! -f .env ]; then \
		echo "❌ File .env không tồn tại. Vui lòng tạo từ env.example"; \
		exit 1; \
	fi
	docker-compose -f docker-compose.prod.yml up -d

prod-build: ## Build và khởi động môi trường production
	@if [ ! -f .env ]; then \
		echo "❌ File .env không tồn tại. Vui lòng tạo từ env.example"; \
		exit 1; \
	fi
	docker-compose -f docker-compose.prod.yml up --build -d

prod-down: ## Dừng môi trường production
	docker-compose -f docker-compose.prod.yml down

prod-logs: ## Xem logs của môi trường production
	docker-compose -f docker-compose.prod.yml logs -f

# Database Commands
seed: ## Seed dữ liệu mẫu vào database (chạy trong Docker container)
	@echo "🌱 Đang seed database..."
	@echo "📅 Data sẽ được convert từ Asia/Ho_Chi_Minh (UTC+7) sang UTC"
	@docker-compose exec -T app npm run seed
	@echo "✅ Seed hoàn tất!"

seed-clear: ## Xóa toàn bộ dữ liệu trong database
	@echo "🗑️  Đang xóa dữ liệu..."
	@docker-compose exec -T mongodb mongosh -u admin -p admin123 --authenticationDatabase admin --eval "use keypicksvivu; db.dropDatabase();"
	@echo "✅ Đã xóa database!"

db-reset: ## Reset database (xóa + seed lại)
	@echo "🔄 Đang reset database..."
	@$(MAKE) seed-clear
	@sleep 2
	@$(MAKE) seed
	@echo "✅ Database đã được reset!"

db-backup: ## Backup database
	@echo "💾 Đang backup database..."
	@mkdir -p backups
	@docker-compose exec -T mongodb mongodump --username admin --password admin123 --authenticationDatabase admin --db keypicksvivu --archive > backups/keypicksvivu_$(shell date +%Y%m%d_%H%M%S).dump
	@echo "✅ Backup hoàn tất! Lưu tại: backups/"

db-restore: ## Restore database từ backup (sử dụng: make db-restore FILE=backups/file.dump)
	@if [ -z "$(FILE)" ]; then \
		echo "❌ Vui lòng chỉ định file: make db-restore FILE=backups/file.dump"; \
		exit 1; \
	fi
	@echo "📥 Đang restore database từ $(FILE)..."
	@docker-compose exec -T mongodb mongorestore --username admin --password admin123 --authenticationDatabase admin --archive < $(FILE)
	@echo "✅ Restore hoàn tất!"

# Utility Commands
clean: ## Dọn dẹp containers, volumes và images
	docker-compose down -v
	docker-compose -f docker-compose.prod.yml down -v
	docker system prune -f

shell: ## Truy cập shell của app container (dev)
	docker-compose exec app sh

db-shell: ## Truy cập MongoDB shell (trong container, timezone UTC)
	@echo "🐚 Đang kết nối MongoDB shell (trong Docker container)..."
	@echo "⏰ Timezone: UTC - Tất cả timestamps trong DB là UTC"
	docker-compose exec mongodb mongosh -u admin -p admin123 --authenticationDatabase admin

restart-app: ## Restart app container (dev)
	docker-compose restart app

health: ## Kiểm tra health của ứng dụng
	@curl -s http://localhost:3000/api/health | jq . || curl -s http://localhost:3000/api/health

stats: ## Xem resource usage
	docker stats --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"

# Quick commands
install: ## Install dependencies trong container
	docker-compose exec app npm install

logs-app: ## Xem logs của app container
	docker-compose logs -f app

logs-db: ## Xem logs của MongoDB container
	docker-compose logs -f mongodb

ps: ## Xem status của containers
	docker-compose ps

timezone: ## Kiểm tra timezone trong containers
	@echo "⏰ Kiểm tra timezone trong containers..."
	@echo ""
	@echo "App Container:"
	@docker-compose exec app sh -c "echo 'TZ='\$$TZ && date"
	@echo ""
	@echo "MongoDB Container:"
	@docker-compose exec mongodb sh -c "echo 'TZ='\$$TZ && date"
	@echo ""
	@echo "✅ Cả hai containers phải hiển thị UTC"

