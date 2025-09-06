FROM node:20-alpine
WORKDIR /app

# El build context ya es ./items/items/Rook---PI2
COPY package*.json ./
RUN npm ci || npm install

COPY . .
RUN npm run tsc

ENV NODE_ENV=production
ENV PORT=4001
EXPOSE 3002
CMD ["npm","run","start"]
