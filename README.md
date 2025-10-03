# Rook---PI2

## Notificaciones por correo

Configura las siguientes variables de entorno para habilitar el envío de correos mediante SendGrid (puedes colocarlas en `src/modules/notifications/infraestructure/config/.env` o en tu entorno de ejecución):

```
SENDGRID_API_KEY=tu_api_key_de_sendgrid
FROM_EMAIL=noreply@thenexusbattles.xyz
```

Si no se define la API key o el remitente, el módulo seguirá funcionando pero no enviará correos y mantendrá las notificaciones con estado `FAILED`.
