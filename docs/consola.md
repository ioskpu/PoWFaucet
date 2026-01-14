Starting Container
Starting PoWFaucet with environment variables...
ETH_RPC_HOST is set: yes
Updating RPC host to: https://eth-sepolia.g.alchemy.com/v2/wDT1GI_rKrqJG...
Updating wallet key...
Updating faucet secret...
Updating SIWE domain to: powfaucet-production.up.railway.app
Updating admin session secret...
Updating port to: 8080
Config file contents (first 20 lines):
# PoWFaucet config (example)
version: 2
### General Settings
# faucet database (defaults to local sqlite)
database:
  driver: "sqlite"
  file: "faucet-store.db"
# logfile for faucet events (comment out for no logging)
faucetLogFile: "faucet-events.log"
# path to file to write the process pid to (comment out to disable)
faucetPidFile: "faucet-pid.txt"
# faucet http/ws server port
serverPort: 8080
# number of http proxies in front of this faucet
2026-01-14 00:52:37  INFO     Loaded faucet config from yaml file: /app/faucet-config.yaml
2026-01-14 00:52:37  INFO     Initializing PoWFaucet v2.5 (AppBasePath: /app, InternalBasePath: /app)
2026-01-14 00:52:39  INFO     Faucet initialization complete.
2026-01-14 00:52:38  INFO     Current FaucetStore schema version: uninitialized
2026-01-14 00:52:38  INFO     Upgraded FaucetStore schema from version 0 to version 1
2026-01-14 00:52:39  INFO     Web3 ChainCommon initialized with chainId 11155111
2026-01-14 00:52:39  INFO     Wallet 0xaf1333bf98c34934e62d3eb5c55242E00C06Eeea:  0.237 HolETH  [Nonce: 2]
2026-01-14 00:52:39  INFO     Enabled module: captcha
2026-01-14 00:52:39  INFO     Enabled module: siwe
2026-01-14 00:52:39  INFO     Admin Alerts initialized with 3 alert rules
2026-01-14 00:52:39  INFO     Admin Dashboard initialized with 1 admin users
2026-01-14 00:52:39  INFO     Enabled module: admin-dashboard
2026-01-14 00:52:39  INFO     Enabled module: ensname
2026-01-14 00:52:39  INFO     Enabled module: ipinfo
2026-01-14 00:52:39  INFO     Enabled module: ethinfo
2026-01-14 00:52:39  INFO     Enabled module: faucet-balance
2026-01-14 00:52:39  INFO     Enabled module: faucet-outflow
2026-01-14 00:52:39  INFO     Enabled module: recurring-limits
2026-01-14 00:52:39  INFO     Enabled module: concurrency-limit
2026-01-14 00:52:39  INFO     Enabled module: pow
2026-01-14 00:53:00  INFO     Faucet Process                                     Stats: CPU: 8.20%,  Memory: 43.68 MB/45.68 MB,   Event Loop Lag:  0.18ms
2026-01-14 00:53:09  WARNING  ALERT [lowBalance]: Balance del faucet (0.2375 ETH) está por debajo del umbral (1.0000 ETH)
2026-01-14 00:54:00  INFO     Faucet Process                                     Stats: CPU: 0.05%,  Memory: 43.92 MB/45.68 MB,   Event Loop Lag:  0.28ms
2026-01-14 00:55:00  INFO     Faucet Process                                     Stats: CPU: 0.03%,  Memory: 44.01 MB/45.68 MB,   Event Loop Lag:  0.08ms
2026-01-14 00:56:00  INFO     Faucet Process                                     Stats: CPU: 0.03%,  Memory: 44.14 MB/45.68 MB,   Event Loop Lag:  0.06ms
2026-01-14 00:57:00  INFO     Faucet Process                                     Stats: CPU: 0.08%,  Memory: 44.33 MB/47.06 MB,   Event Loop Lag:  0.21ms