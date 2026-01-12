# Guía de Deploy en Railway

## Requisitos Previos

1. Cuenta en [Railway](https://railway.app)
2. Wallet de Ethereum con fondos en Sepolia testnet
3. URL de RPC (Infura, Alchemy, o público)

## Pasos para Deploy

### 1. Crear Proyecto en Railway

1. Ve a [railway.app](https://railway.app) y crea un nuevo proyecto
2. Selecciona "Deploy from GitHub repo"
3. Conecta tu repositorio

### 2. Configurar Variables de Entorno

En Railway, ve a tu servicio → Variables y agrega:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `ETH_RPC_HOST` | URL del RPC de Sepolia | `https://sepolia.infura.io/v3/TU_API_KEY` |
| `ETH_WALLET_KEY` | Private key sin 0x | `abc123...` (64 caracteres hex) |
| `FAUCET_SECRET` | String aleatorio para firmar sesiones | `MiSecretoSuperSeguro123!` |
| `RAILWAY_PUBLIC_DOMAIN` | Tu dominio de Railway | `tu-app.up.railway.app` |

### 3. Obtener RPC Gratuito

**Opción A - Infura:**
1. Crea cuenta en [infura.io](https://infura.io)
2. Crea un proyecto
3. Copia el endpoint de Sepolia

**Opción B - Alchemy:**
1. Crea cuenta en [alchemy.com](https://alchemy.com)
2. Crea una app en Sepolia
3. Copia el HTTPS URL

**Opción C - RPC Público (menos confiable):**
```
https://rpc.sepolia.org
https://ethereum-sepolia.publicnode.com
```

### 4. Crear Wallet de Testnet

1. Crea una wallet nueva (solo para el faucet)
2. Exporta la private key
3. Obtén Sepolia ETH de otro faucet:
   - https://sepoliafaucet.com
   - https://www.alchemy.com/faucets/ethereum-sepolia

### 5. Agregar Volumen Persistente (Opcional pero Recomendado)

Para que la base de datos SQLite persista entre deploys:

1. En Railway, agrega un volumen
2. Mount path: `/app/data`

### 6. Deploy

Railway detectará el Dockerfile y hará build automáticamente.

## Verificar Deploy

Una vez desplegado, visita:
- `https://tu-app.up.railway.app` - Frontend
- `https://tu-app.up.railway.app/api/getFaucetConfig` - API status

## Probar SIWE

1. Abre el faucet en tu navegador
2. Ingresa una dirección ETH
3. Verás el botón "Sign-In with Ethereum"
4. Conecta MetaMask y firma el mensaje
5. Deberías ver el bonus de 50% activado

## Troubleshooting

**Error de RPC:**
- Verifica que `ETH_RPC_HOST` sea correcto
- Prueba con otro proveedor de RPC

**Error de wallet:**
- Verifica que `ETH_WALLET_KEY` tenga 64 caracteres (sin 0x)
- Asegúrate de que la wallet tenga fondos

**SIWE no funciona:**
- Verifica que `RAILWAY_PUBLIC_DOMAIN` coincida con tu dominio real
- Revisa la consola del navegador para errores

## Costos

Railway tiene un tier gratuito con:
- 500 horas de ejecución/mes
- 100 GB de ancho de banda
- Suficiente para pruebas

Para producción, considera el plan Pro ($5/mes).
