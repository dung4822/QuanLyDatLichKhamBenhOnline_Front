# Build frontend rồi phục vụ bằng Caddy. Caddyfile nằm ở repo backend (deploy/Caddyfile), được gắn vào lúc chạy.
# API gọi qua đường dẫn tương đối /api (VITE_API_BASE_URL mặc định), Caddy chuyển tiếp sang container API.
FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM caddy:2
COPY --from=build /app/dist /srv
