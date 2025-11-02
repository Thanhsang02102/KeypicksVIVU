# DevContainer for KeypicksVIVU

This DevContainer is configured to provide a complete development environment with debugging support for Express.js server.

## Quick Start

VS Code will automatically detect this DevContainer configuration and prompt you to reopen in container.

Or manually:

1. Press `F1`
2. Select **Dev Containers: Reopen in Container**
3. Wait for container to build and start

## Full Documentation

📖 **See complete guide**: [DEVELOPMENT_GUIDE.md - DevContainer Section](../docs/DEVELOPMENT_GUIDE.md#-devcontainer-setup-recommended-for-debugging)

## Quick Debugging

1. Open file to debug (e.g., `server.js`, `routes/flights.js`)
2. Click left margin to set breakpoint (red dot appears)
3. Press `F5` and select **Debug Express with Nodemon**
4. Access `http://localhost:3000` to trigger breakpoints

## Available Debug Configurations

- **Debug Express with Nodemon** - Recommended (hot reload)
- **Debug Express Server** - Standard debugging
- **Attach to Process** - Attach to running process
- **Debug Seed Script** - Debug database seeding

## Ports

- `3000` - Express Server
- `27017` - MongoDB
- `8081` - Mongo Express (Admin UI)

## VS Code Tasks

Press `Ctrl+Shift+P` > **Tasks: Run Task**:

- Start Server
- Seed Database
- Build CSS
- Watch CSS
- Docker: Up/Down/Logs

---

**Happy Debugging! 🐛**
