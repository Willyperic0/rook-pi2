# Proyecto Rook-PI2 🏰⚔️

Este repositorio contiene el **monorepositorio** del proyecto **Rook-PI2**, una plataforma de **subastas en línea** .

El proyecto está desarrollado en **TypeScript/Node.js** para los microservicios y **React + Vite** para el frontend, siguiendo principios de **arquitectura modular** (domain, application, infrastructure).

---

## 📂 Estructura del Monorepo

```bash
rook-pi2/
├── client/            # Frontend (React + Vite + Tailwind)
│   └── RookClient/
│       └── frontend/
│
├── services/
│   ├── api/           # API Gateway principal (Auction, Inventory, User)
│   ├── users/         # Microservicio de usuarios
│   └── items/         # Microservicio de ítems
│
└── docs/              # Documentación Swagger/OpenAPI
```

---

## 🚀 Puesta en Marcha

### 1. Frontend

```bash
cd client/RookClient/frontend
npm install
npm run dev     # desarrollo
npm run build   # compilación
```

> Acceso por defecto: `http://localhost:5173`

### 2. Users Service

```bash
cd services/users
npm install
npm run dev     # corre en http://localhost:4000
npm run build   # compila a ./build
```

### 3. Items Service

```bash
cd services/items
npm install
npm run dev     # corre en http://localhost:3002
npm run build
```

### 4. API Gateway

```bash
cd services/api
npm install
npm run dev     # corre en http://localhost:3000
npm run build
```

> Swagger Docs disponibles en: `http://localhost:3000/api/docs`

---

## 🌱 Rama `develop`

* La rama `develop` es nuestro **entorno de integración**.
* Aquí consolidamos cambios de documentación, fixes y nuevas features antes de `main`.
* Flujo de trabajo recomendado:

  1. Crear una rama desde `develop` (`feature/...`, `fix/...`, `docs/...`).
  2. Realizar commit con mensajes alineados a las rúbricas (ej: `docs(api): ...`).
  3. Abrir PR hacia `develop`.

👉 **Nunca se hacen cambios directos en `stable`**.
