[Region: us-west1]
=========================
Using Detected Dockerfile
=========================
context: 9wt3-zJAb
internal
load build definition from Dockerfile
0ms
internal
load metadata for docker.io/library/node:22-slim
126ms
internal
load .dockerignore
1ms
internal
load build context
0ms
build-client-env
FROM docker.io/library/node:22-slim@sha256:6f5144a04c933bb2b7d5e8bb822d8ecf827635056deb4c503a650a63e12dd862 cached
7ms
stage-2
WORKDIR /app
293ms
build-client-env
WORKDIR /build
297ms
stage-2
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates bash
4s
done.
build-client-env
COPY faucet-client/package*.json ./faucet-client/
42ms
build-server-env
COPY package*.json ./
49ms
build-client-env
COPY ./libs libs
80ms
build-server-env
RUN npm install
5s
npm notice
build-client-env
COPY ./static static
28ms
build-client-env
RUN cd faucet-client && npm install
6s
npm notice
stage-2
RUN update-ca-certificates
599ms
done.
build-server-env
COPY ./libs libs
154ms
build-server-env
COPY ./tsconfig.json .
23ms
build-server-env
COPY ./webpack.config.js .
25ms
build-server-env
COPY ./src src
28ms
build-server-env
RUN npm run bundle
3s
> @powfaucet/server@2.5 bundle
> tsc && webpack --mode production

src/modules/admin-dashboard/AdminAPI.ts(759,46): error TS2339: Property 'ip' does not exist on type '{ address: string; reason: string; addedBy: string; timestamp: number; lastActivity: number; }'.

src/modules/admin-dashboard/AdminAPI.ts(911,58): error TS2339: Property 'getTaskName' does not exist on type 'FaucetSessionTask'.

src/modules/admin-dashboard/AdminAPI.ts(940,21): error TS2339: Property 'kill' does not exist on type 'FaucetSession'.

src/modules/admin-dashboard/AdminAPI.ts(1256,37): error TS2339: Property 'validateConfig' does not exist on type 'AdminAPI'.

src/modules/admin-dashboard/AdminAPI.ts(1296,37): error TS2339: Property 'validateConfig' does not exist on type 'AdminAPI'.

src/modules/admin-dashboard/AdminAPI.ts(1362,37): error TS2339: Property 'validateConfig' does not exist on type 'AdminAPI'.

src/modules/admin-dashboard/AdminAPI.ts(1633,35): error TS2339: Property 'getMemoryUsage' does not exist on type 'FaucetProcess'.
build-client-env
COPY ./faucet-client faucet-client
178ms
build-client-env
RUN cd faucet-client && node ./build-client.js
2s
Building pow-faucet-client...
[baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
Dockerfile:10
-------------------
8 |     COPY ./webpack.config.js .
9 |     COPY ./src src
10 | >>> RUN npm run bundle
11 |
12 |     # build-client env
-------------------
ERROR: failed to build: failed to solve: process "/bin/sh -c npm run bundle" did not complete successfully: exit code: 2