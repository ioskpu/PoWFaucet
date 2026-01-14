#!/bin/bash

# Script de inicio para Railway
# Reemplaza variables de entorno en el config

CONFIG_FILE="/app/faucet-config.yaml"

echo "Starting PoWFaucet with environment variables..."
echo "ETH_RPC_HOST is set: $([ -n "$ETH_RPC_HOST" ] && echo 'yes' || echo 'no')"

# Si existe ETH_RPC_HOST, actualizar el config
if [ -n "$ETH_RPC_HOST" ]; then
  echo "Updating RPC host to: ${ETH_RPC_HOST:0:50}..."
  sed -i "s|ethRpcHost:.*|ethRpcHost: \"$ETH_RPC_HOST\"|g" $CONFIG_FILE
fi

# Si existe ETH_WALLET_KEY, actualizar el config
if [ -n "$ETH_WALLET_KEY" ]; then
  echo "Updating wallet key..."
  sed -i "s|ethWalletKey:.*|ethWalletKey: \"$ETH_WALLET_KEY\"|g" $CONFIG_FILE
fi

# Si existe FAUCET_SECRET, actualizar el config
if [ -n "$FAUCET_SECRET" ]; then
  echo "Updating faucet secret..."
  sed -i "s|faucetSecret:.*|faucetSecret: \"$FAUCET_SECRET\"|g" $CONFIG_FILE
fi

# Si existe RAILWAY_PUBLIC_DOMAIN, actualizar SIWE config
if [ -n "$RAILWAY_PUBLIC_DOMAIN" ]; then
  echo "Updating SIWE domain to: $RAILWAY_PUBLIC_DOMAIN"
  sed -i "s|#domain:.*|domain: \"$RAILWAY_PUBLIC_DOMAIN\"|g" $CONFIG_FILE
  sed -i "s|#uri:.*|uri: \"https://$RAILWAY_PUBLIC_DOMAIN\"|g" $CONFIG_FILE
fi

# Si existe ADMIN_SESSION_SECRET, actualizar admin-dashboard config
if [ -n "$ADMIN_SESSION_SECRET" ]; then
  echo "Updating admin session secret..."
  sed -i "s|sessionSecret:.*\"\${ADMIN_SESSION_SECRET}\"|sessionSecret: \"$ADMIN_SESSION_SECRET\"|g" $CONFIG_FILE
fi

# Si existe PORT (Railway lo asigna), actualizar
if [ -n "$PORT" ]; then
  echo "Updating port to: $PORT"
  sed -i "s|serverPort:.*|serverPort: $PORT|g" $CONFIG_FILE
fi

echo "Config file contents (first 20 lines):"
head -20 $CONFIG_FILE

# Iniciar el faucet
exec node --no-deprecation bundle/powfaucet.cjs --config $CONFIG_FILE
