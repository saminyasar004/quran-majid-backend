# Build stage
FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
# prisma generate is already part of the build script in package.json
RUN yarn build

# Production stage
FROM node:22-alpine
WORKDIR /app
COPY package.json yarn.lock ./
# Install only production dependencies (now includes prisma CLI)
RUN yarn install --frozen-lockfile --production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
# Generate prisma client for the production environment
RUN npx prisma generate
EXPOSE 4000
CMD ["yarn", "start:prod"]