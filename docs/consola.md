Starting Container
# logfile for faucet events (comment out for no logging)
faucetLogFile: "faucet-events.log"
# path to file to write the process pid to (comment out to disable)
faucetPidFile: "faucet-pid.txt"
# faucet http/ws server port
serverPort: 8080
Starting PoWFaucet with environment variables...
ETH_RPC_HOST is set: yes
# number of http proxies in front of this faucet
2026-01-13 00:07:21  INFO     Loaded faucet config from yaml file: /app/faucet-config.yaml
Updating RPC host to: https://eth-sepolia.g.alchemy.com/v2/wDT1GI_rKrqJG...
Updating wallet key...
Updating faucet secret...
Updating SIWE domain to: powfaucet-production.up.railway.app
Updating port to: 8080
Config file contents (first 20 lines):
# PoWFaucet config (example)
version: 2
### General Settings
# faucet database (defaults to local sqlite)
database:
  driver: "sqlite"
  file: "faucet-store.db"
2026-01-13 00:07:21  INFO     Initializing PoWFaucet v2.4.2 (AppBasePath: /app, InternalBasePath: /app)
2026-01-13 00:07:22  INFO     Current FaucetStore schema version: uninitialized
2026-01-13 00:07:22  INFO     Upgraded FaucetStore schema from version 0 to version 1
2026-01-13 00:07:22  INFO     Web3 ChainCommon initialized with chainId 11155111
2026-01-13 00:07:22  INFO     Wallet 0xaf1333bf98c34934e62d3eb5c55242E00C06Eeea:  0.237 HolETH  [Nonce: 2]
2026-01-13 00:07:22  INFO     Enabled module: captcha
2026-01-13 00:07:22  INFO     Enabled module: ensname
2026-01-13 00:07:22  INFO     Enabled module: ipinfo
2026-01-13 00:07:22  INFO     Enabled module: ethinfo
2026-01-13 00:07:22  INFO     Enabled module: faucet-balance
2026-01-13 00:07:22  INFO     Enabled module: faucet-outflow
2026-01-13 00:07:22  INFO     Enabled module: recurring-limits
2026-01-13 00:07:22  INFO     Enabled module: concurrency-limit
2026-01-13 00:07:22  INFO     Enabled module: pow
2026-01-13 00:07:22  INFO     Faucet initialization complete.
2026-01-13 00:08:00  INFO     Faucet Process                                     Stats: CPU: 4.11%,  Memory: 41.47 MB/44.13 MB,   Event Loop Lag:  0.23ms