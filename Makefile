.PHONY: install dev-server dev-client migrate seed reset build clean

# Install all dependencies
install:
	cd server && npm install
	cd client && npm install

# Run the Express server in dev mode (port 3001)
dev-server:
	cd server && npm run dev

# Run the Vite client in dev mode (port 5173)
dev-client:
	cd client && npm run dev

# Run Prisma migrations
migrate:
	cd server && npx prisma migrate dev

# Seed the database with sample data
seed:
	cd server && npm run seed

# Reset the database, re-migrate, and re-seed
reset:
	cd server && npx prisma migrate reset --force --skip-seed
	cd server && npm run seed

# Build server (tsc) and client (vite build)
build:
	cd server && npm run build
	cd client && npm run build

# Remove build artifacts
clean:
	rm -rf server/dist
	rm -rf client/dist
