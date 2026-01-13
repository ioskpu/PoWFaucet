# ⚠️ ACCIÓN INMEDIATA REQUERIDA - Railway Deploy

## 🚨 ANTES DE QUE SE COMPLETE EL DEPLOY

Railway ya está desplegando automáticamente. **Debes agregar esta variable AHORA:**

### 1. Ve a Railway Dashboard

1. Abre: https://railway.app/
2. Selecciona tu proyecto PoWFaucet
3. Ve a la pestaña **"Variables"**

### 2. Agrega esta Variable de Entorno

**Nombre:** `ADMIN_SESSION_SECRET`  
**Valor:** `a7f3c9e2b8d4f1a6c5e9b2d7f4a8c3e6b9d2f5a1c8e4b7d3f6a9c2e5b8d1f4a7`

**Pasos:**
1. Click en **"New Variable"**
2. Pega el nombre: `ADMIN_SESSION_SECRET`
3. Pega el valor: `a7f3c9e2b8d4f1a6c5e9b2d7f4a8c3e6b9d2f5a1c8e4b7d3f6a9c2e5b8d1f4a7`
4. Click en **"Add"**

### 3. El Deploy se Reiniciará Automáticamente

Railway detectará la nueva variable y reiniciará el servicio.

---

## ✅ Verificar que el Deploy fue Exitoso

### 1. Espera 3-5 minutos

El deploy incluye:
- Instalación de nuevas dependencias (`jsonwebtoken`, `bcrypt`)
- Compilación de TypeScript
- Generación del bundle del admin dashboard
- Inicio del servidor

### 2. Revisa los Logs

En Railway → Deployments → View Logs, busca:

```
✅ DEBE APARECER:
[INFO] Admin Dashboard initialized with 1 admin users
[INFO] Faucet server listening on port 8080

❌ NO DEBE APARECER:
[ERROR] Admin Dashboard: sessionSecret must be changed from default value
[ERROR] Admin Dashboard: No admin users configured
```

### 3. Accede al Admin Dashboard

**URL:** `https://tu-dominio.up.railway.app/admin`

**Credenciales:**
- Usuario: `admin`
- Contraseña: `Sara@1256`

---

## 🎯 Qué Esperar

### Pantalla de Login

Deberías ver una pantalla moderna con:
- Fondo con gradiente morado
- Formulario de login con campos de usuario y contraseña
- Botón "Iniciar Sesión"

### Dashboard Principal

Después de login, verás:
- **Sidebar izquierdo** con navegación (Dashboard, Config, Users, Reports, etc.)
- **Métricas principales:** Balance, Actividad, Sistema, Distribución
- **Top Usuarios e IPs** con estadísticas
- **Auto-refresh** cada 30 segundos

### Navegación

Puedes navegar entre:
1. **📊 Dashboard** - Estadísticas en tiempo real
2. **⚙️ Configuración** - Gestión de configuración
3. **👥 Usuarios** - Blacklist/whitelist
4. **📈 Reportes** - Análisis y exportación
5. **📋 Logs** - (En desarrollo)
6. **🚨 Alertas** - (En desarrollo)
7. **🧩 Módulos** - (En desarrollo)

---

## 🚨 Si Algo Sale Mal

### Error: "sessionSecret must be changed from default value"

**Causa:** No agregaste `ADMIN_SESSION_SECRET` en Railway  
**Solución:** Agrega la variable como se indica arriba

### Error: No puedo acceder a /admin

**Causa:** El módulo no se cargó correctamente  
**Solución:** 
1. Revisa los logs de Railway
2. Verifica que `faucet-config.yaml` tiene la sección `admin-dashboard`
3. Asegúrate de que `enabled: true`

### Error 401 al hacer login

**Causa:** Credenciales incorrectas  
**Solución:** 
- Usuario: `admin` (minúsculas)
- Contraseña: `Sara@1256` (exactamente así)

### El servidor no inicia

**Causa:** Error en la compilación o dependencias  
**Solución:**
1. Revisa los logs completos en Railway
2. Busca errores de npm install o npm run build
3. Si es necesario, haz un redeploy manual

---

## 📊 Monitoreo Post-Deploy

### Métricas a Vigilar (primeros 10 minutos)

1. **Uso de memoria:** Debería estar entre 150-250 MB
2. **Tiempo de respuesta:** < 500ms para el dashboard
3. **Logs de errores:** No deberían aparecer errores críticos

### Pruebas Rápidas

1. ✅ Login funciona
2. ✅ Dashboard carga estadísticas
3. ✅ Navegación entre secciones funciona
4. ✅ Balance del faucet se muestra correctamente
5. ✅ Auto-refresh actualiza datos

---

## 🔒 Seguridad Post-Deploy

### Cambiar Contraseña (Recomendado)

Después de verificar que todo funciona:

1. Genera una nueva contraseña:
   ```bash
   node scripts/generate-admin-password.js
   ```

2. Actualiza el `passwordHash` en `faucet-config.yaml`

3. Haz commit y push:
   ```bash
   git add faucet-config.yaml
   git commit -m "security: Update admin password hash"
   git push origin master
   ```

### Rotar Session Secret (Mensualmente)

Genera un nuevo secret cada mes:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Actualiza `ADMIN_SESSION_SECRET` en Railway.

---

## 📞 Contacto de Emergencia

Si encuentras problemas críticos:

1. **Revisa primero:** `RAILWAY_DEPLOY_INSTRUCTIONS.md`
2. **Consulta documentación:** `docs/ideas/02-admin-dashboard/`
3. **Revisa el código:** `src/modules/admin-dashboard/`

---

## ✨ Funcionalidades Disponibles

### Inmediatamente Disponibles:
- ✅ Dashboard con estadísticas en tiempo real
- ✅ Gestión de configuración
- ✅ Gestión de usuarios (blacklist/whitelist)
- ✅ Reportes y análisis
- ✅ Exportación de datos (JSON/CSV)
- ✅ Sistema de alertas
- ✅ Monitoreo de salud del sistema

### En Desarrollo:
- ⏳ Logs del sistema (UI preparada)
- ⏳ Gestión de alertas (UI preparada)
- ⏳ Gestión de módulos (UI preparada)

---

**🚀 ¡El Admin Dashboard está listo para usar!**

*Recuerda: Agrega `ADMIN_SESSION_SECRET` en Railway AHORA si aún no lo has hecho*
