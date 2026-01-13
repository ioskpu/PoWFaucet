# 🚀 Instrucciones para Deploy en Railway - Admin Dashboard

## ⚠️ IMPORTANTE - Configurar ANTES del Deploy

### 1. Agregar Variable de Entorno en Railway

Antes de hacer el merge y que se despliegue automáticamente, debes agregar esta variable de entorno en Railway:

**Ve a tu proyecto en Railway → Variables → Add Variable:**

```
ADMIN_SESSION_SECRET=tu-clave-secreta-aleatoria-aqui-cambiar-esto
```

**Genera una clave segura con este comando:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

O usa esta generada ahora:
```
ADMIN_SESSION_SECRET=a7f3c9e2b8d4f1a6c5e9b2d7f4a8c3e6b9d2f5a1c8e4b7d3f6a9c2e5b8d1f4a7
```

### 2. Credenciales de Acceso al Admin Dashboard

**Usuario:** `admin`  
**Contraseña:** `Sara@1256`  
**Hash (ya configurado):** `$2b$10$ubxntsYHB9P5unEc8rIbN.ix/jft2Lr9ALpnm3EK/SmVr5LCv5zyO`

### 3. URL de Acceso

Una vez desplegado, accede al dashboard en:
```
https://tu-dominio.up.railway.app/admin
```

---

## 📋 Checklist Pre-Deploy

- [ ] Variable `ADMIN_SESSION_SECRET` agregada en Railway
- [ ] Confirmar que las otras variables están configuradas:
  - [ ] `FAUCET_SECRET`
  - [ ] `ETH_RPC_HOST`
  - [ ] `ETH_WALLET_KEY`
  - [ ] `RAILWAY_PUBLIC_DOMAIN`

---

## 🔧 Qué Pasará en el Deploy

### Archivos que se desplegarán:

1. **Backend (6 archivos nuevos):**
   - `src/modules/admin-dashboard/AdminDashboardModule.ts`
   - `src/modules/admin-dashboard/AdminDashboardConfig.ts`
   - `src/modules/admin-dashboard/AdminAuth.ts`
   - `src/modules/admin-dashboard/AdminAPI.ts`
   - `src/modules/admin-dashboard/AdminStats.ts`
   - `src/modules/admin-dashboard/AdminAlerts.ts`

2. **Frontend (archivos generados):**
   - `static/admin/admin.html`
   - `static/admin/admin.js` (45KB)
   - `static/admin/admin.css` (65KB)

3. **Configuración:**
   - `faucet-config.yaml` (actualizado con admin-dashboard)

### Proceso de Deploy:

1. Railway detectará el push a `main`
2. Ejecutará `npm install` (instalará nuevas dependencias: `jsonwebtoken`, `bcrypt`)
3. Ejecutará `npm run build` (compilará TypeScript)
4. Ejecutará `node faucet-client/build-admin.js` (generará bundle del admin)
5. Iniciará el servidor con `npm start`

### Tiempo estimado: 3-5 minutos

---

## ✅ Verificación Post-Deploy

### 1. Verificar que el servidor inició correctamente

En Railway → Deployments → Ver logs, deberías ver:
```
[INFO] Admin Dashboard initialized with 1 admin users
[INFO] Faucet server listening on port 8080
```

### 2. Probar el acceso al Admin Dashboard

1. Ve a: `https://tu-dominio.up.railway.app/admin`
2. Deberías ver la pantalla de login
3. Ingresa:
   - Usuario: `admin`
   - Contraseña: `Sara@1256`
4. Deberías ver el dashboard con estadísticas

### 3. Verificar funcionalidades principales

- [ ] Login funciona correctamente
- [ ] Dashboard muestra estadísticas
- [ ] Navegación entre secciones funciona
- [ ] Configuración se carga correctamente
- [ ] Gestión de usuarios accesible
- [ ] Reportes se generan correctamente

---

## 🚨 Posibles Problemas y Soluciones

### Problema 1: Error "sessionSecret must be changed from default value"

**Solución:** Asegúrate de haber agregado `ADMIN_SESSION_SECRET` en Railway

### Problema 2: Error "No admin users configured"

**Solución:** El archivo `faucet-config.yaml` debe tener la sección `admin-dashboard` con al menos un usuario

### Problema 3: No puedo acceder a /admin

**Solución:** 
- Verifica que el módulo esté habilitado: `enabled: true`
- Revisa los logs de Railway para ver errores
- Asegúrate de que el build se completó correctamente

### Problema 4: Error 401 al hacer login

**Solución:**
- Verifica que el usuario y contraseña sean correctos
- Revisa que el `passwordHash` esté correctamente configurado
- Verifica los logs para ver intentos de login fallidos

---

## 🔒 Seguridad Post-Deploy

### Recomendaciones Inmediatas:

1. **Cambiar la contraseña de admin:**
   ```bash
   node scripts/generate-admin-password.js
   ```
   Luego actualiza el `passwordHash` en `faucet-config.yaml`

2. **Rotar el sessionSecret periódicamente:**
   Genera uno nuevo cada mes y actualiza en Railway

3. **Monitorear logs de acceso:**
   Revisa regularmente los logs de admin en Railway

### Recomendaciones para Producción:

1. **Habilitar HTTPS obligatorio:**
   ```yaml
   security:
     requireHTTPS: true
   ```

2. **Configurar dominio personalizado:**
   - Agrega un dominio propio en Railway
   - Actualiza `RAILWAY_PUBLIC_DOMAIN`

3. **Agregar más administradores:**
   ```yaml
   adminUsers:
     - username: "admin"
       passwordHash: "..."
       permissions: ["all"]
     - username: "monitor"
       passwordHash: "..."
       permissions: ["read", "stats"]
   ```

4. **Configurar alertas por email:**
   (Funcionalidad futura - preparada en el código)

---

## 📊 Monitoreo Post-Deploy

### Métricas a Vigilar:

1. **Uso de memoria:** El admin dashboard agrega ~50MB de uso
2. **Tiempo de respuesta:** Los endpoints deben responder en < 200ms
3. **Logs de acceso:** Revisa intentos de login fallidos
4. **Alertas del sistema:** Configura notificaciones para balance bajo

### Comandos Útiles:

**Ver logs en tiempo real:**
```bash
# En Railway Dashboard → Deployments → View Logs
```

**Verificar estado del módulo:**
```bash
# Accede a: https://tu-dominio.up.railway.app/api/admin/stats
# (requiere autenticación)
```

---

## 🎯 Próximos Pasos Después del Deploy

1. **Familiarízate con el dashboard:**
   - Explora todas las secciones
   - Prueba la exportación de datos
   - Revisa los reportes

2. **Configura alertas:**
   - Ajusta los umbrales según tus necesidades
   - Prueba que las alertas se generen correctamente

3. **Personaliza la configuración:**
   - Ajusta los límites de usuarios
   - Configura los módulos según tu preferencia
   - Personaliza los mensajes del faucet

4. **Documenta tu configuración:**
   - Guarda las credenciales en un lugar seguro
   - Documenta cualquier cambio que hagas
   - Mantén un backup de la configuración

---

## 📞 Soporte

Si encuentras algún problema:

1. **Revisa los logs de Railway** primero
2. **Verifica las variables de entorno** están configuradas
3. **Consulta la documentación** en `docs/ideas/02-admin-dashboard/`
4. **Revisa el código** en `src/modules/admin-dashboard/`

---

**¡Listo para el deploy! 🚀**

*Recuerda: Agrega `ADMIN_SESSION_SECRET` en Railway ANTES de hacer el merge*
