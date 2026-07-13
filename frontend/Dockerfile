FROM node:22-alpine AS build
WORKDIR /app
RUN npm config set registry https://registry.npmmirror.com \
    && npm install -g pnpm@10.22.0 --registry=https://registry.npmmirror.com
COPY package.json pnpm-lock.yaml* ./
RUN pnpm config set registry https://registry.npmmirror.com \
    && pnpm install --frozen-lockfile
COPY . .
ARG VITE_APP_TARGET=landing
ARG VITE_API_BASE_URL=/api
ARG VITE_USE_MOCK=false
ARG VITE_ANDROID_APK_URL=/downloads/tudou-clock.apk
ARG VITE_IOS_IPA_URL=/downloads/tudou-clock.ipa
ARG VITE_TESTFLIGHT_URL=
ARG VITE_APP_STORE_URL=
ENV VITE_APP_TARGET=$VITE_APP_TARGET
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_USE_MOCK=$VITE_USE_MOCK
ENV VITE_ANDROID_APK_URL=$VITE_ANDROID_APK_URL
ENV VITE_IOS_IPA_URL=$VITE_IOS_IPA_URL
ENV VITE_TESTFLIGHT_URL=$VITE_TESTFLIGHT_URL
ENV VITE_APP_STORE_URL=$VITE_APP_STORE_URL
RUN pnpm build

FROM nginx:1.27-alpine
LABEL org.opencontainers.image.title="Potato Clock" \
      org.opencontainers.image.authors="CintaOvO <D1391571546@outlook.com>" \
      org.opencontainers.image.source="https://github.com/Cinnamo-roll/Cinta-PotatoClock" \
      org.opencontainers.image.url="https://clock.cinoo.xyz" \
      org.opencontainers.image.licenses="PolyForm-Noncommercial-1.0.0"
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
