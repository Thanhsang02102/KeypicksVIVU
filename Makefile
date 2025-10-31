.PHONY: help dev dev-build dev-down dev-logs prod prod-build prod-down prod-logs clean seed seed-clear db-reset db-backup db-restore shell db-shell restart-app health stats install logs-app logs-db ps timezone

help: ## Hiển thị trợ giúp
	@echo "KeypicksVIVU - Docker Commands"
	@echo ""
	@echo "📝 Lưu ý: MongoDB chạy trong Docker, App chạy locally"
	@echo "   - MongoDB: Expose port 27017, kết nối qua localhost"
	@echo "   - App: Chạy với 'npm run dev' trên host machine"
	@echo "   - Seed data: Chạy 'npm run seed' trên host machine"
	@echo ""
	@echo "Development:"
	@echo "  make dev         - Khởi động MongoDB và Mongo Express"
	@echo "  make dev-down    - Dừng môi trường dev"
	@echo "  make dev-logs    - Xem logs của môi trường dev"
	@echo ""
	@echo "Database:"
	@echo "  make db-shell    - Truy cập MongoDB shell"
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
	@echo "  make stats       - Xem resource usage"

# Development Commands
dev: ## Khởi động MongoDB và Mongo Express
	docker-compose up -d mongodb mongo-express
	@echo ""
	@echo "✅ MongoDB và Mongo Express đã khởi động!"
	@echo "🗄️  MongoDB:      mongodb://localhost:27017"
	@echo "🗄️  Mongo Express: http://localhost:8081"
	@echo ""
	@echo "💡 Bây giờ chạy app locally: npm run dev"

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

# Database Commands (chạy trực tiếp từ host machine)
# Lưu ý: seed và seed-clear nên chạy bằng 'npm run seed' và 'npm run seed:clear' trên host

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

db-shell: ## Truy cập MongoDB shell
	@echo "🐚 Đang kết nối MongoDB shell..."
	docker-compose exec mongodb mongosh -u admin -p admin123 --authenticationDatabase admin

stats: ## Xem resource usage
	docker stats --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"

logs-db: ## Xem logs của MongoDB container
	docker-compose logs -f mongodb

ps: ## Xem status của containers
	docker-compose ps

