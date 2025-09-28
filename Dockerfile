FROM node:18

WORKDIR /app

# Copiar solo package.json y package-lock.json para instalar dependencias
COPY package*.json ./

# Instalar dependencias (solo producción)
RUN npm install --production

# Copiar el resto del proyecto
COPY . .

# Asegurarse de copiar la carpeta docs si tu app la usa
COPY docs ./docs

# Compilar TypeScript
RUN npm run tsc

# Exponer el puerto
EXPOSE 3000

# Ejecutar JS compilado
CMD ["npm", "start"]
