You reached the start of the range
Jan 12, 2026, 7:50 PM
Starting Container
ETH_RPC_HOST is set: yes
Updating RPC host to: https://eth-sepolia.g.alchemy.com/v2/wDT1GI_rKrqJG...
Updating wallet key...
# PoWFaucet config (example)
version: 2
# faucet database (defaults to local sqlite)
Updating faucet secret...
Updating SIWE domain to: powfaucet-production.up.railway.app
### General Settings
Updating port to: 8080
Config file contents (first 20 lines):
database:
  driver: "sqlite"
Starting PoWFaucet with environment variables...
  file: "faucet-store.db"
# logfile for faucet events (comment out for no logging)
faucetLogFile: "faucet-events.log"
# path to file to write the process pid to (comment out to disable)
faucetPidFile: "faucet-pid.txt"
# faucet http/ws server port
serverPort: 8080
# number of http proxies in front of this faucet
2026-01-13 00:52:07  INFO     Loaded faucet config from yaml file: /app/faucet-config.yaml
2026-01-13 00:52:07  INFO     Initializing PoWFaucet v2.4.2 (AppBasePath: /app, InternalBasePath: /app)
2026-01-13 00:52:08  INFO     Current FaucetStore schema version: uninitialized
2026-01-13 00:52:08  INFO     Upgraded FaucetStore schema from version 0 to version 1
2026-01-13 00:52:08  INFO     Web3 ChainCommon initialized with chainId 11155111
2026-01-13 00:52:08  INFO     Wallet 0xaf1333bf98c34934e62d3eb5c55242E00C06Eeea:  0.237 HolETH  [Nonce: 2]
2026-01-13 00:52:08  INFO     Enabled module: captcha
2026-01-13 00:52:08  INFO     Enabled module: siwe
2026-01-13 00:52:08  INFO     Enabled module: ensname
2026-01-13 00:52:08  INFO     Enabled module: ipinfo
2026-01-13 00:52:08  INFO     Enabled module: ethinfo
2026-01-13 00:52:08  INFO     Enabled module: faucet-balance
2026-01-13 00:52:08  INFO     Enabled module: faucet-outflow
2026-01-13 00:52:08  INFO     Enabled module: recurring-limits
2026-01-13 00:52:08  INFO     Enabled module: concurrency-limit
2026-01-13 00:52:08  INFO     Enabled module: pow
2026-01-13 00:52:08  INFO     Faucet initialization complete.
2026-01-13 00:53:00  INFO     Faucet Process                                     Stats: CPU: 3.52%,  Memory: 42.26 MB/44.38 MB,   Event Loop Lag:  0.21ms
2026-01-13 00:54:00  INFO     Faucet Process                                     Stats: CPU: 0.03%,  Memory: 42.49 MB/44.38 MB,   Event Loop Lag:  0.11ms
2026-01-13 00:55:00  INFO     Faucet Process                                     Stats: CPU: 0.03%,  Memory: 42.58 MB/44.38 MB,   Event Loop Lag:  0.09ms