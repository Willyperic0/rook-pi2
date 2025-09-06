# Antes vs. Ahora

## Antes (versión previa)

* Backend con Express + Socket.IO ya tenía el **módulo de subastas funcional end-to-end**:

  * Crear subasta (con o sin buy-now).
  * Pujar.
  * Compra inmediata.
  * Cierre automático (scheduler).
  * Notificaciones por Socket.IO.
* Arquitectura hexagonal establecida con adapters in-memory, puertos y servicios.
* Router de subastas (`/api/auctions`) montado en Express.
* Cliente mínimo HTML servía para chat/notificaciones.
* Validaciones básicas implementadas (monto mayor al precio actual, créditos suficientes en puja y buy-now).
* Persistencia solo en memoria.

---

## Ahora (estado actual)

### Funcionalidad nueva: **Verificación estricta de usuarios y créditos**

* **Autenticación mínima por header** `x-user-id`:

  * Si no hay header → **401 No autenticado**.
  * Si el ID no existe en el `UserGateway` → **403 Usuario no registrado**.
* **Restricción de acceso**: solo usuarios registrados pueden interactuar con las subastas (crear, pujar, buy-now).
* **Validación de créditos al crear subasta**:

  * Subasta de 24h → requiere ≥1 crédito.
  * Subasta de 48h → requiere ≥3 créditos.
  * Si no cumple, se bloquea con mensaje claro.
* **Mantuvimos validaciones existentes**:

  * Pujar → créditos ≥ monto ofertado + monto > precio actual.
  * Buy-now → créditos ≥ precio de compra inmediata (y se descuentan).
* **Mensajes de error claros** en cada caso (401/403/400 según corresponda).

### Cambios clave (técnicos)

1. **Middlewares**:

   * `requireAuthFactory`: exige header con usuario registrado.
   * `requireCreditsForCreateFactory`: valida créditos mínimos (1/3) antes de crear subasta.
2. **Router de subastas**:

   * Endpoints ahora usan `res.locals.userId` en lugar de confiar en el body.
   * Se aplica `requireAuthFactory` globalmente.
   * El endpoint de creación aplica `requireCreditsForCreateFactory`.
3. **Servicio AuctionAppService**:

   * Conserva la validación como “fuente de verdad” (defensa en profundidad).
   * Mensajes más explícitos en caso de créditos insuficientes o usuario inexistente.
4. **Semilla de usuarios**:

   * Se definieron usuarios de prueba (`user-1`, `user-2`, `user-3`) con créditos.
   * Solo estos IDs pueden interactuar con el sistema en memoria.
5. **Cumplimiento de historia de usuario (SCRUM-17)**:

   * Usuarios no registrados no pueden ver ni interactuar.
   * Restricción estricta por créditos (1/3 para crear, suficientes para pujar y buy-now).
   * Bloqueo con mensajes claros si no cumplen requisitos.

---

## Resultado

* El sistema ahora **cumple totalmente la historia de verificación de usuarios y créditos**, asegurando que **solo jugadores válidos y con créditos suficientes** pueden interactuar con las subastas.
* Queda listo para cerrar las subtareas de backend:

  * Restringir acceso a no registrados.
  * Validar créditos en publicación (1/3).
  * Validar créditos en puja y compra inmediata.
* Próximo paso: automatizar estas validaciones en **tests Jest** (SCRUM-52) y luego avanzar hacia endpoints de listado/detalle para completar el módulo.