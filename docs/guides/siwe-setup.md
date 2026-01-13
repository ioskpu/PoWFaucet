# Guía de Configuración: Módulo SIWE

Esta guía te ayudará a configurar el módulo SIWE (Sign-In with Ethereum) en tu instancia de PoWFaucet.

## Requisitos Previos

- PoWFaucet v2.4.2 o superior
- Node.js 18+ con soporte para ES modules
- Dominio público con HTTPS (para producción)
- Wallet compatible (MetaMask recomendado)

## Instalación

### 1. Verificar Dependencias

El módulo SIWE ya incluye todas las dependencias necesarias:

```json
{
  "dependencies": {
    "siwe": "^2.1.4",
    "ethers": "^6.0.0"
  }
}
```

### 2. Configuración Básica

Edita tu archivo `faucet-config.yaml`:

```yaml
modules:
  siwe:
    enabled: true
    domain: "tu-dominio.com"  # ⚠️ IMPORTANTE: Debe coincidir exactamente
    uri: "https://tu-dominio.com"
    nonceExpiration: 300
    sessionExpiration: 86400
    required: false
    rewardFactor: 1.5
    restrictions: []
```

### 3. Configuración de Dominio

**⚠️ CRÍTICO**: El parámetro `domain` debe coincidir exactamente con tu dominio público:

```yaml
# ✅ Correcto
domain: "faucet.example.com"
uri: "https://faucet.example.com"

# ❌ Incorrecto
domain: "localhost:8080"  # No funciona en producción
domain: "example.com"     # Si tu faucet está en faucet.example.com
```

## Configuración por Entorno

### Desarrollo Local

```yaml
modules:
  siwe:
    enabled: true
    domain: "localhost"
    uri: "http://localhost:8080"
    nonceExpiration: 600  # 10 minutos para testing
    sessionExpiration: 3600  # 1 hora
    required: false
    rewardFactor: 2.0  # Factor alto para testing
    restrictions: []
```

### Producción

```yaml
modules:
  siwe:
    enabled: true
    domain: "faucet.sepolia.example.com"
    uri: "https://faucet.sepolia.example.com"
    nonceExpiration: 300  # 5 minutos
    sessionExpiration: 86400  # 24 horas
    required: false  # Opcional al inicio
    rewardFactor: 1.5  # 50% bonus
    restrictions:
      - limitCount: 5
        duration: 86400
        message: "Límite diario de 5 sesiones para wallets autenticadas"
```

### Railway/Vercel

Para deployments en plataformas cloud, usa variables de entorno:

```bash
# Variables de entorno
SIWE_DOMAIN=faucet-production.up.railway.app
SIWE_URI=https://faucet-production.up.railway.app
```

Y en tu `docker-entrypoint.sh`:

```bash
if [ -n "$SIWE_DOMAIN" ]; then
  echo "Updating SIWE domain to: $SIWE_DOMAIN"
  sed -i "s/domain: .*/domain: \"$SIWE_DOMAIN\"/" /app/faucet-config.yaml
fi

if [ -n "$SIWE_URI" ]; then
  echo "Updating SIWE URI to: $SIWE_URI"
  sed -i "s|uri: .*|uri: \"$SIWE_URI\"|" /app/faucet-config.yaml
fi
```

## Configuración Avanzada

### Restricciones por Wallet

```yaml
restrictions:
  # Límite diario por wallet
  - limitCount: 10
    duration: 86400  # 24 horas
    message: "Has alcanzado el límite diario de 10 sesiones"
  
  # Límite por hora
  - limitCount: 3
    duration: 3600  # 1 hora
    message: "Máximo 3 sesiones por hora"
  
  # Límite por cantidad
  - limitAmount: 5000000000000000000  # 5 ETH en wei
    duration: 86400
    message: "Límite diario de 5 ETH alcanzado"
```

### Factores de Recompensa

```yaml
# Configuraciones comunes
rewardFactor: 1.0   # Sin bonus (solo autenticación)
rewardFactor: 1.25  # 25% adicional
rewardFactor: 1.5   # 50% adicional (recomendado)
rewardFactor: 2.0   # 100% adicional (generoso)
```

### SIWE Obligatorio

```yaml
# Para faucets que requieren autenticación
required: true
rewardFactor: 1.0  # No hay bonus, es obligatorio
restrictions:
  - limitCount: 1
    duration: 86400
    message: "Solo una sesión por día por wallet"
```

## Verificación de Configuración

### 1. Verificar Logs de Inicio

```bash
# Buscar en los logs
grep -i "siwe" faucet-events.log

# Deberías ver:
# [INFO] Enabled module: siwe
# [INFO] SIWE module initialized with domain: tu-dominio.com
```

### 2. Probar Endpoints

```bash
# Probar generación de nonce
curl https://tu-dominio.com/api/siweNonce

# Respuesta esperada:
# {"nonce":"a1b2c3d4...","expiresIn":300}
```

### 3. Verificar Frontend

1. Abre tu faucet en el navegador
2. Deberías ver el botón "Sign-In with Ethereum"
3. Al hacer clic, debería abrir MetaMask
4. Después de firmar, la dirección se auto-completa

## Troubleshooting

### Error: "Domain mismatch"

**Problema**: El dominio en la configuración no coincide con el mensaje SIWE.

**Solución**:
```yaml
# Verifica que coincidan exactamente
domain: "faucet.example.com"  # Sin https://, sin puerto
uri: "https://faucet.example.com"  # URL completa
```

### Error: "Invalid or expired nonce"

**Problema**: Nonce expirado o ya usado.

**Soluciones**:
1. Aumentar `nonceExpiration` para desarrollo
2. Verificar sincronización de tiempo del servidor
3. Limpiar cache del navegador

### Error: "Signature verification failed"

**Problema**: La firma no es válida.

**Soluciones**:
1. Verificar que MetaMask esté en la red correcta
2. Comprobar que el mensaje se construya correctamente
3. Revisar logs del servidor para detalles

### Frontend no muestra botón SIWE

**Problema**: El componente no se renderiza.

**Soluciones**:
1. Verificar que `enabled: true` en la configuración
2. Comprobar que el módulo se cargue correctamente
3. Revisar console del navegador para errores JavaScript

### Auto-completado no funciona

**Problema**: La dirección no se completa automáticamente.

**Soluciones**:
1. Verificar que la autenticación sea exitosa
2. Comprobar que MetaMask esté conectado
3. Revisar que la dirección coincida exactamente

## Monitoreo

### Logs Importantes

```bash
# Autenticaciones exitosas
grep "authenticated via SIWE" faucet-events.log

# Errores de autenticación
grep "SIWE.*error" faucet-events.log

# Nonces generados
grep "SIWE nonce generated" faucet-events.log
```

### Métricas a Monitorear

- Tasa de autenticación exitosa vs fallida
- Tiempo promedio de autenticación
- Uso de factores de recompensa
- Violaciones de restricciones

## Mejores Prácticas

### Seguridad

1. **Usa HTTPS en producción** - SIWE requiere conexión segura
2. **Configura dominios exactos** - Evita ataques de phishing
3. **Mantén nonces cortos** - 5-10 minutos máximo
4. **Implementa rate limiting** - Previene ataques de fuerza bruta
5. **Monitorea logs** - Detecta patrones sospechosos

### UX

1. **Explica los beneficios** - Usuarios deben entender por qué autenticarse
2. **Haz SIWE opcional** - Al menos inicialmente
3. **Proporciona feedback** - Muestra estado de autenticación claramente
4. **Permite cambiar dirección** - Flexibilidad para casos de uso avanzados

### Performance

1. **Limpia nonces regularmente** - Evita crecimiento de base de datos
2. **Usa índices apropiados** - Para consultas rápidas
3. **Cachea configuración** - Evita lecturas repetidas
4. **Optimiza restricciones** - Consultas eficientes

## Migración

### Desde Versión Sin SIWE

1. Agrega la configuración del módulo
2. Reinicia el servidor
3. Las tablas se crean automáticamente
4. Los usuarios existentes no se ven afectados

### Actualización de Configuración

```bash
# Backup de configuración actual
cp faucet-config.yaml faucet-config.yaml.backup

# Editar configuración
nano faucet-config.yaml

# Reiniciar servidor
systemctl restart powfaucet
```

## Soporte

Si encuentras problemas:

1. **Revisa esta guía** - Cubre los casos más comunes
2. **Consulta los logs** - Información detallada de errores
3. **Verifica la configuración** - Errores tipográficos son comunes
4. **Prueba en desarrollo** - Aísla el problema
5. **Reporta bugs** - Con logs y configuración (sin datos sensibles)

---

**Próximo paso**: [Configurar Dashboard de Administración](./dashboard-setup.md)