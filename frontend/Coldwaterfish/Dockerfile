# 1단계: 빌드 (Vite 환경)
FROM node:20-alpine as build-stage

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 2단계: 배포 (Nginx 환경)
FROM nginx:stable-alpine
# [주의]: Vite는 빌드 결과물이 'dist' 폴더에 생기므로 /app/dist를 복사합니다.
COPY --from=build-stage /app/dist /usr/share/nginx/html
#  nginx.conf를 엔진닉스 설정에 적용합니다.
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]