# 🏷️ Rook – Rama `stable`

Esta es la **rama principal** del proyecto **Rook – PI2**.  
Corresponde al código **estable y listo para producción**.

---

## 🚀 Propósito
- Contiene la **versión final y validada** del sistema.  
- Aquí solo llegan cambios que han pasado por:
  1. [`develop`](../develop) → integración de nuevas features.  
  2. [`deploy`](../deploy) → validación en entorno de staging.  

---

## 🔒 Reglas de la rama
- No se permite **force push** ni **eliminación de la rama**.  
- Todo cambio debe realizarse mediante **Pull Request (PR)**.  
- Requiere al menos **1 aprobación** antes de hacer merge.  
- Los PRs deben estar **actualizados con la última versión** de la rama antes de fusionarse.  
- Se exige que todas las conversaciones en el PR estén **resueltas** antes del merge.  

---

## 📦 Flujo de integración
1. Los desarrolladores trabajan en ramas de feature desde `develop`.  
2. Cuando un conjunto de cambios está listo, se hace PR a `deploy`.  
3. Tras las pruebas en staging, los cambios se fusionan en `stable` mediante PR.  
4. El contenido de `stable` es el que se utiliza para el **despliegue en producción**.  

---

✍️ **Nota:** Esta rama refleja el estado más confiable del sistema.  
Cualquier error aquí impacta directamente en producción, por lo que las reglas de protección son estrictas.


## 📌 Mensaje para el equipo

🚨 **Aviso importante: cambio de rama principal**
La rama por defecto del repositorio ya **no se llama `main`**, ahora se llama **`stable`**.

Si tienes una copia local del repositorio, actualízala con los siguientes comandos:

```bash
# Renombrar la rama local de main a stable
git branch -m main stable

# Obtener la referencia actualizada desde el remoto
git fetch origin

# Enlazar la rama local con la remota stable
git branch -u origin/stable stable

# Actualizar el HEAD remoto para que apunte a stable
git remote set-head origin -a
```

✅ Después de esto, tu rama local `stable` quedará conectada correctamente con el remoto.

---
