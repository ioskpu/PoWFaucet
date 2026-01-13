# Plan de Implementación: Módulo de Autenticación Web3 (SIWE)

**Idea #1** | **Estado:** 🔄 En Progreso  
**Autor:** Luis Corales  
**Inicio:** Enero 2026

---

## Descripción

Implementar un módulo de autenticación mediante Sign-In with Ethereum (SIWE) que permita a los usuarios verificar la propiedad de su wallet firmando un mensaje, siguiendo el estándar EIP-4361.

---

## Fases de Implementación

### Fase 1: Estructura Base del Módulo
**Estado:** ✅ Completado

- [x] Crear carpeta `src/modules/siwe/`
- [x] Crear `SiweConfig.ts` - Configuración del módulo
- [x] Crear `SiweModule.ts` - Clase principal del módulo
- [x] Crear `SiweDB.ts` - Persistencia de sesiones SIWE
- [x] Registrar módulo en `src/modules/modules.ts`
- [x] Agregar configuración ejemplo en `faucet-config.example.yaml`
- [x] Instalar dependencia `siwe` (v3.0.0)

**Archivos creados:**
```
src/modules/siwe/
├── SiweConfig.ts
├── SiweModule.ts
└── SiweDB.ts
```

---

### Fase 2: Lógica de Autenticación SIWE
**Estado:** ✅ Completado (incluido en Fase 1)

- [x] Instalar dependencia `siwe` (npm package)
- [x] Implementar generación de nonce único
- [x] Implementar creación de mensaje SIWE (EIP-4361)
- [x] Implementar verificación de firma
- [x] Implementar validación de dominio y timestamp
- [x] Agregar manejo de errores específicos

**Endpoints API implementados:**
- `GET /api/siweNonce` - Obtener nonce para firmar
- `POST /api/siweVerify` - Verificar firma

---

### Fase 3: Integración con Hooks del Faucet
**Estado:** ✅ Completado (incluido en Fase 1)

- [x] Hook `ClientConfig` - Enviar config SIWE al cliente
- [x] Hook `SessionStart` - Verificar autenticación SIWE
- [x] Hook `SessionRewardFactor` - Bonus por autenticación SIWE
- [x] Hook `SessionComplete` - Guardar sesión SIWE
- [x] Implementar restricciones recurrentes por wallet autenticada

---

### Fase 4: Interfaz de Usuario (Cliente)
**Estado:** ✅ Completado

- [x] Crear componente React `SiweLogin.tsx`
- [x] Crear estilos `SiweLogin.css`
- [x] Integrar con providers Web3 (ethers.js + MetaMask)
- [x] Mostrar estado de autenticación en UI
- [x] Manejar errores de firma en UI
- [x] Integrar en `FaucetInput.tsx`
- [x] Instalar dependencia `ethers` en cliente

**Archivos creados/modificados:**
```
faucet-client/src/components/frontpage/siwe/
├── SiweLogin.tsx
└── SiweLogin.css

faucet-client/src/components/frontpage/FaucetInput.tsx (modificado)
```

---

### Fase 5: Testing y Documentación
**Estado:** ⏳ Pendiente

- [ ] Tests unitarios para SiweModule
- [ ] Tests de integración
- [ ] Documentar configuración en wiki
- [ ] Actualizar README con nueva funcionalidad

---

### Fase 6: Mejoras UX (Pendiente)
**Estado:** ✅ Completado

- [x] Auto-completar dirección ETH después de autenticación SIWE
- [x] Permitir al usuario cambiar la dirección si lo desea
- [x] Mostrar indicador visual de dirección auto-completada
- [x] Validar que la dirección coincida para aplicar bonus

---

## Configuración Propuesta

```yaml
modules:
  siwe:
    enabled: true
    
    # Dominio permitido para SIWE
    domain: "faucet.example.com"
    
    # URI del faucet
    uri: "https://faucet.example.com"
    
    # Tiempo de expiración del nonce (segundos)
    nonceExpiration: 300  # 5 minutos
    
    # Tiempo de expiración de la sesión SIWE (segundos)
    sessionExpiration: 86400  # 24 horas
    
    # Requerir SIWE para usar el faucet
    required: false
    
    # Factor de recompensa para usuarios autenticados
    rewardFactor: 1.5  # 50% más recompensa
    
    # Restricciones por wallet autenticada
    restrictions:
      - limitCount: 5
        limitAmount: 5000000000000000000  # 5 ETH
        duration: 86400  # 1 día
```

---

## Dependencias a Agregar

```json
{
  "dependencies": {
    "siwe": "^2.1.4"
  }
}
```

---

## Bitácora de Progreso

| Fecha | Fase | Acción | Estado |
|-------|------|--------|--------|
| 12-Ene-2026 | 1 | Crear estructura base | ✅ |
| 12-Ene-2026 | 2 | Implementar lógica SIWE | ✅ |
| 12-Ene-2026 | 3 | Integrar hooks | ✅ |
| 12-Ene-2026 | 4 | Crear UI cliente | ✅ |
| 12-Ene-2026 | 6 | Mejoras UX - Auto-completar | ✅ |
| - | 5 | Testing y docs | ⏳ |

---

## Notas Técnicas

**Referencia de módulos similares:**
- `GithubModule` - Patrón de autenticación OAuth
- `PassportModule` - Verificación de identidad

**Estándar EIP-4361:**
- Spec: https://eips.ethereum.org/EIPS/eip-4361
- Librería: https://github.com/spruceid/siwe

**Flujo de autenticación:**
```
1. Usuario conecta wallet
2. Frontend solicita nonce al backend
3. Backend genera nonce único y lo almacena
4. Frontend construye mensaje SIWE con nonce
5. Usuario firma mensaje con wallet
6. Frontend envía firma al backend
7. Backend verifica firma y crea sesión
8. Usuario puede usar faucet con beneficios
```

---

## Próximo Paso

Continuar con **Fase 5**: Testing y documentación, seguido de **Fase 6**: Mejoras UX (auto-completar dirección).

¿Procedemos con los tests o prefieres implementar primero la mejora UX?
