# ADR 003: Deploy API Server on Render

## Status
Accepted

## Context
The Express/Node.js API server needed a cloud host. The app is a personal learning tool, so cost and simplicity matter more than scale.

## Decision
Deploy the server on Render's free web service tier. The start command runs Prisma migrations then starts the compiled server:

```
cd server && npx prisma migrate deploy --schema prisma/schema.prisma && node dist/index.js
```

## Consequences
- Free tier spins down after 15 minutes of inactivity, causing 1–5 minute cold starts
- To mitigate cold starts: either upgrade to Render Starter ($7/mo) or use an external keep-alive ping (e.g. UptimeRobot) every 10–14 minutes
- Prisma migration check runs on every startup; this is fast when no pending migrations exist
- Build artifacts (`dist/`) must be committed or built during the Render build step
