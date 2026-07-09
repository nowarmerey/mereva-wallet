# ---- Build stage ----
FROM node:20-alpine AS builder
WORKDIR /app

# Prisma needs the openssl CLI to detect the system OpenSSL version;
# without it, it downloads engines built for OpenSSL 1.1 which fail on
# modern Alpine (OpenSSL 3).
RUN apk add --no-cache openssl

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

# Same OpenSSL requirement for the Prisma engines at runtime.
RUN apk add --no-cache openssl

# Copy the Next.js standalone server + static assets + public files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
# Prisma engine + schema needed at runtime for migrations
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/prisma ./prisma
# bcryptjs is bundled into the Next server chunks but the seed script
# (prisma/seed-saas.js) requires it as a standalone module.
COPY --from=builder /app/node_modules/bcryptjs ./node_modules/bcryptjs

EXPOSE 3000
ENV PORT=3000 HOSTNAME=0.0.0.0

# Apply migrations then start the standalone server.
# (call the Prisma CLI entrypoint directly — node_modules/.bin isn't copied)
CMD ["sh", "-c", "node node_modules/prisma/build/index.js migrate deploy && node server.js"]
