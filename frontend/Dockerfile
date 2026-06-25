FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile
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
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
