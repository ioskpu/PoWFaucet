#!/bin/bash

# Script de inicio para Railway
# Reemplaza variables de entorno en el config

CONFIG_FILE="/app/faucet-config.yaml"

# Si existe ETH_RPC_HOST, actualizar el config
if [ -n "$ETH_RPC_HOST" ]; then
  sed -i "s|ethRpcHost:.*|ethRpcHost: \"$ETH_RPC_HOST\"|g" $CONFIG_FILE
fi

# Si existe ETH_WALLET_KEY, actualizar el config
if [ -n "$ETH_WALLET_KEY" ]; then
  sed -i "s|ethWalletKey:.*|ethWalletKey: \"$ETH_WALLET_KEY\"|g" $CONFIG_FILE
fi

# Si existe FAUCET_SECRET, actualizar el config
if [ -n "$FAUCET_SECRET" ]; then
  sed -i "s|faucetSecret:.*|faucetSecret: \"$FAUCET_SECRET\"|g" $CONFIG_FILE
fi

# Si existe RAILWAY_PUBLIC_DOMAIN, actualizar SIWE config
if [ -n "$RAILWAY_PUBLIC_DOMAIN" ]; then
  sed -i "s|#domain:.*|domain: \"$RAILWAY_PUBLIC_DOMAIN\"|g" $CONFIG_FILE
  sed -i "s|#uri:.*|uri: \"https://$RAILWAY_PUBLIC_DOMAIN\"|g" $CONFIG_FILE
fi

# Si existe PORT (Railway lo asigna), actualizar
if [ -n "$PORT" ]; then
  sed -i "s|serverPort:.*|serverPort: $PORT|g" $CONFIG_FILE
fi

# Iniciar el faucet
exec node --no-deprecation bundle/powfaucet.cjs --config $CONFIG_FILE
