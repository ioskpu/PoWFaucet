# PoWFaucet
<img src="https://faucets.pk910.de/images/logo-cat-small.png" height="90px" />

[![GitHub release (última versión)](https://img.shields.io/github/v/release/pk910/PoWFaucet?label=Última%20Versión)](https://github.com/pk910/PoWFaucet/releases/latest)
[![codecov](https://codecov.io/gh/pk910/PoWFaucet/branch/master/graph/badge.svg)](https://codecov.io/gh/pk910/PoWFaucet)

Faucet modularizado para cadenas EVM con diferentes métodos de protección (Captcha, Minería, IP, Balance en Mainnet, Gitcoin Passport, **Autenticación SIWE** y más)

---

**Desarrollador Original:** [pk910](https://github.com/pk910)  
**Adaptación y Mantenimiento:** Luis Corales

---

# ¿Por qué?

Los faucets para testnets de ETH son constantemente atacados por bots. Este faucet intenta reducir la eficiencia de estas solicitudes automatizadas mediante varios métodos de protección.

Este faucet es conocido principalmente por su protección basada en prueba de trabajo (PoW), que actualmente es la mejor y más confiable forma de distribuir fondos en una red con reservas limitadas. **Además, ahora soporta autenticación SIWE (Sign-In with Ethereum)**, permitiendo a los usuarios verificar la propiedad de su wallet y recibir recompensas mejoradas.

**Aclaración importante:** Este faucet NO genera nuevas monedas con el proceso de "minería".
Es solo uno de los métodos de protección que utiliza el faucet para evitar que alguien solicite grandes cantidades de fondos y vacíe la wallet del faucet.
¡Si deseas ejecutar tu propia instancia, necesitas transferir los fondos que quieras distribuir a la wallet del faucet tú mismo!

Para una descripción más detallada, consulta la [Wiki del Proyecto](https://github.com/pk910/PoWFaucet/wiki)

# Características Principales

## 🔐 Autenticación SIWE (¡NUEVO!)
- **Sign-In with Ethereum** siguiendo el estándar EIP-4361
- **Recompensas mejoradas** para usuarios autenticados (multiplicador de bonus configurable)
- **Auto-completado de dirección** después de la autenticación de wallet
- **Restricciones basadas en wallet** y límites personalizados
- **Interfaz moderna** con integración MetaMask
- **Autenticación segura basada en nonce** sin transacciones on-chain

## 🛡️ Múltiples Métodos de Protección
- **Minería Proof-of-Work** - Protección anti-bot más efectiva
- **Verificación Captcha** - Desafíos de verificación humana
- **Límites basados en IP** - Restricciones geográficas y de red
- **Verificación de Balance en Mainnet** - Verificar tenencias reales de ETH
- **Gitcoin Passport** - Verificación de identidad descentralizada
- **Resolución de Nombres ENS** - Soporte para Ethereum Name Service
- **Restricciones basadas en tiempo** - Períodos de enfriamiento y limitación de velocidad

## 🎯 Características Avanzadas
- **Arquitectura Modular** - Habilitar/deshabilitar características según necesidad
- **Soporte Multi-token** - ETH nativo y tokens ERC20
- **Monitoreo en Tiempo Real** - Estadísticas en vivo y verificaciones de salud
- **Recompensas Configurables** - Cantidades de pago flexibles y condiciones
- **Gestión de Sesiones** - Sesiones de usuario persistentes con seguimiento de progreso
- **Interfaz Web Moderna** - Diseño responsivo con actualizaciones en tiempo real

# Instancias Activas

<table>
  <thead>
    <tr>
      <th>Testnet</th>
      <th>Enlace</th>
      <th></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><a href="https://github.com/eth-clients/sepolia">Sepolia Testnet</a></td>
      <td><a href="https://sepolia-faucet.pk910.de">https://sepolia-faucet.pk910.de</a></td>
      <td>
        <a href="#"><img alt="Versión del Faucet" src="https://img.shields.io/endpoint?url=https%3A%2F%2Ffaucets.pk910.de%2Fbadges%2Fversion.php%3Ffaucet%3Dsepolia-faucet" /></a>
        <a href="https://stats.uptimerobot.com/lW1jltO2k0/794659718"><img alt="Uptime (30 días)" src="https://img.shields.io/uptimerobot/ratio/m794659718-c8c94ebdcae5283c5df1a5ad" /></a>
        <a href="https://sepolia.etherscan.io/address/0x6Cc9397c3B38739daCbfaA68EaD5F5D77Ba5F455"><img alt="Balance del Faucet" src="https://img.shields.io/endpoint?url=https%3A%2F%2Ffaucets.pk910.de%2Fbadges%2Fbalance.php%3Ffaucet%3Dsepolia-faucet" /></a>
      </td>
    </tr>
    <tr>
      <td><a href="https://github.com/eth-clients/hoodi">Hoodi Testnet</a></td>
      <td><a href="https://hoodi-faucet.pk910.de">https://hoodi-faucet.pk910.de</a></td>
      <td>
        <a href="#"><img alt="Versión del Faucet" src="https://img.shields.io/endpoint?url=https%3A%2F%2Ffaucets.pk910.de%2Fbadges%2Fversion.php%3Ffaucet%3Dhoodi-faucet" /></a>
        <a href="https://stats.uptimerobot.com/lW1jltO2k0/798768812"><img alt="Uptime (30 días)" src="https://img.shields.io/uptimerobot/ratio/m798768812-b78b2e9493487dc45fb42731" /></a>
        <a href="https://hoodi.etherscan.io/address/0x6Cc9397c3B38739daCbfaA68EaD5F5D77Ba5F455"><img alt="Balance del Faucet" src="https://img.shields.io/endpoint?url=https%3A%2F%2Ffaucets.pk910.de%2Fbadges%2Fbalance.php%3Ffaucet%3Dhoodi-faucet" /></a>
      </td>
    </tr>
    <tr>
      <td><a href="https://github.com/eth-clients/holesky">Holešovice Testnet</a></td>
      <td><a href="https://holesky-faucet.pk910.de">https://holesky-faucet.pk910.de</a></td>
      <td>
        <a href="#"><img alt="Versión del Faucet" src="https://img.shields.io/endpoint?url=https%3A%2F%2Ffaucets.pk910.de%2Fbadges%2Fversion.php%3Ffaucet%3Dholesky-faucet" /></a>
        <a href="https://stats.uptimerobot.com/lW1jltO2k0/795198747"><img alt="Uptime (30 días)" src="https://img.shields.io/uptimerobot/ratio/m795198747-dbc5794093556ee744ed909a" /></a>
        <a href="https://holesky.etherscan.io/address/0x6Cc9397c3B38739daCbfaA68EaD5F5D77Ba5F455"><img alt="Balance del Faucet" src="https://img.shields.io/endpoint?url=https%3A%2F%2Ffaucets.pk910.de%2Fbadges%2Fbalance.php%3Ffaucet%3Dholesky-faucet" /></a>
      </td>
    </tr>
    <tr>
      <td><a href="https://github.com/ephemery-testnet/ephemery-resources">Ephemery Testnet</a></td>
      <td><a href="https://ephemery-faucet.pk910.de">https://ephemery-faucet.pk910.de</a></td>
      <td>
        <a href="#"><img alt="Versión del Faucet" src="https://img.shields.io/endpoint?url=https%3A%2F%2Ffaucets.pk910.de%2Fbadges%2Fversion.php%3Ffaucet%3Dephemery-faucet" /></a>
        <a href="https://stats.uptimerobot.com/lW1jltO2k0/794659832"><img alt="Uptime (30 días)" src="https://img.shields.io/uptimerobot/ratio/m794659832-bc531ed47aa35b919d3f8d98" /></a>
        <a href="https://explorer.ephemery.dev/address/0x6Cc9397c3B38739daCbfaA68EaD5F5D77Ba5F455"><img alt="Balance del Faucet" src="https://img.shields.io/endpoint?url=https%3A%2F%2Ffaucets.pk910.de%2Fbadges%2Fbalance.php%3Ffaucet%3Dephemery-faucet" /></a>
      </td>
    </tr>
  </tbody>
</table>

# Ejecutar Tu Propia Instancia

Lee la [Wiki para Operadores](https://github.com/pk910/PoWFaucet/wiki/Operator-Wiki) para ver las instrucciones de instalación y configuración.

También puedes encontrar algunas instancias de demostración con diferentes combinaciones de módulos aquí: [Instancias Demo](https://github.com/pk910/PoWFaucet/blob/master/docs/demo/README.md)

## Configuración Rápida de SIWE

Para habilitar la autenticación SIWE en tu faucet, agrega esto a tu `faucet-config.yaml`:

```yaml
modules:
  siwe:
    enabled: true
    domain: "tu-dominio-faucet.com"  # Debe coincidir con tu dominio público
    uri: "https://tu-dominio-faucet.com"
    nonceExpiration: 300  # 5 minutos
    sessionExpiration: 86400  # 24 horas
    required: false  # Hacer opcional inicialmente
    rewardFactor: 1.5  # 50% de bonus para usuarios autenticados
    restrictions:
      - limitCount: 5
        duration: 86400  # Límite diario por wallet autenticada
```

Para configuración detallada de SIWE, consulta: [Guía de Configuración SIWE](./docs/guides/siwe-setup.md)

## Documentación

- 📖 [Documentación del Módulo SIWE](./docs/modules/siwe.md) - Guía completa de características SIWE
- 🚀 [Guía de Configuración SIWE](./docs/guides/siwe-setup.md) - Configuración paso a paso
- 💡 [Plan de Ideas y Mejoras](./docs/PLAN_IDEAS_MEJORAS.md) - Hoja de ruta y características futuras
- 🔧 [Desarrollo de Módulos](./docs/guides/) - Guías de configuración adicionales

# Módulos de Protección Disponibles

| Módulo | Descripción |
|--------|-------------|
| **SIWE** | **Autenticación Sign-In with Ethereum (EIP-4361) con recompensas mejoradas** |
| **Captcha** | Protección mediante HCaptcha, ReCAPTCHA o Turnstile |
| **PoW (Minería)** | Prueba de trabajo con algoritmos Argon2, Scrypt, CryptoNight |
| **IP Info** | Restricciones basadas en información de IP (hosting, proxy, país) |
| **ETH Info** | Verificación de balance máximo y contratos |
| **GitHub** | Autenticación y verificación de cuentas de GitHub |
| **Mainnet Wallet** | Verificación de balance y transacciones en mainnet |
| **Gitcoin Passport** | Integración con sistema de identidad descentralizada |
| **ENS Name** | Resolución y verificación de nombres ENS |
| **Recurring Limits** | Límites recurrentes por dirección/IP |
| **Concurrency Limit** | Control de sesiones simultáneas |
| **Faucet Balance** | Restricciones basadas en el balance del faucet |
| **Faucet Outflow** | Control del flujo de salida de fondos |
| **Voucher** | Sistema de vouchers/cupones |
| **Whitelist** | Lista blanca de direcciones |
| **Zupass** | Integración con Zupass para eventos |

# Bugs y Funcionalidades

No dudes en reportar bugs y agregar nuevas funcionalidades mediante PRs.

# Agradecimientos

Este faucet contiene partes de código de los siguientes proyectos:

[pow-captcha](https://git.sequentialread.com/forest/pow-captcha) - script de compilación faucet-wasm

[FaucETH](https://github.com/komputing/FaucETH) - diseño de la página del faucet

**Contribuidores del Módulo SIWE:**
- **Luis Corales** - Implementación de autenticación SIWE, mejoras de UI moderna, localización en español, y suite de testing completa

# Licencia

[![Licencia: AGPL v3](https://img.shields.io/badge/Licencia-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
