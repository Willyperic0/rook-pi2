FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# 🔧 Corrige el import mal cased dentro del contenedor (sin tocar tu repo)
# Cambia "./routes/UserRoutes" -> "./routes/userRoutes"
RUN sed -i "s|\\./routes/UserRoutes|./routes/userRoutes|g" src/modules/auction/infraestructure/api/index.ts

RUN npm run tsc

ENV NODE_ENV=production
ENV PORT=4000
EXPOSE 3000
CMD ["npm","run","start"]
