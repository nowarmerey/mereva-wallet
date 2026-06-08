# ---- Build stage ----
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies (use lockfile if present)
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci || npm install

# Build the app
COPY . .
RUN npx prisma generate
RUN npm run build

# ---- Runtime stage ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy the Next.js standalone server + static assets + public files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
# Prisma engine + schema needed at runtime for migrations
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000
ENV PORT=3000 HOSTNAME=0.0.0.0

# Apply migrations then start the standalone server.
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
