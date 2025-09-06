FROM node:20-alpine AS build
WORKDIR /app

ARG VITE_API_BASE
ARG VITE_ITEMS_BASE
ARG VITE_USERS_BASE
ARG VITE_SOCKET_PATH
ARG VITE_WS_URL

COPY frontend/package*.json ./frontend/
WORKDIR /app/frontend
RUN npm install
COPY frontend ./

ENV VITE_API_BASE=${VITE_API_BASE}
ENV VITE_ITEMS_BASE=${VITE_ITEMS_BASE}
ENV VITE_USERS_BASE=${VITE_USERS_BASE}
ENV VITE_SOCKET_PATH=${VITE_SOCKET_PATH}
ENV VITE_WS_URL=${VITE_WS_URL}

# 👉 Saltamos el tsc, solo build con vite
RUN npx vite build

FROM nginx:1.27-alpine
COPY --from=build /app/frontend/dist /usr/share/nginx/html
RUN sed -i 's/try_files \$uri \$uri\/ =404;/try_files \$uri \/index.html;/' /etc/nginx/conf.d/default.conf
EXPOSE 80
