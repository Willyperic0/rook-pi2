FROM node:20-alpine
WORKDIR /app

# El build context ya es ./users/users/Rook---PI2
COPY package*.json ./
RUN npm ci || npm install

COPY . .
RUN npm run tsc

ENV NODE_ENV=production
ENV PORT=4002
EXPOSE 4000
CMD ["npm","run","start"]
