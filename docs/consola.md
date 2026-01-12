 
[Region: us-west1]
=========================
Using Detected Dockerfile
=========================
context: 7d97-Gh_x
internal
load build definition from Dockerfile
0ms
internal
load metadata for docker.io/library/node:22-slim
410ms
auth
library/node:pull token for registry-1.docker.io
0ms
internal
load .dockerignore
0ms
internal
load build context
0ms
build-client-env
FROM docker.io/library/node:22-slim@sha256:7378f5a4830ef48eb36d1abf4ef398391db562b5c41a0bded83192fbcea21cc8 cached
5ms
build-client-env
WORKDIR /build cached
237ms
stage-2
WORKDIR /app cached
237ms
build-server-env
RUN npm install cached
0ms
build-server-env
COPY package*.json ./ cached
0ms
stage-2
RUN update-ca-certificates cached
0ms
stage-2
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates cached
0ms
build-client-env
RUN cd faucet-client && node ./build-client.js cached
0ms
build-client-env
COPY ./faucet-client faucet-client cached
0ms
build-client-env
RUN cd faucet-client && npm install cached
0ms
build-client-env
COPY ./static static cached
0ms
build-client-env
COPY ./libs libs cached
0ms
build-client-env
COPY faucet-client/package*.json ./faucet-client/ cached
0ms
stage-2
COPY --from=build-server-env /build/bundle ./bundle cached
0ms
build-server-env
RUN npm run bundle cached
0ms
build-server-env
COPY ./src src cached
0ms
build-server-env
COPY ./webpack.config.js . cached
0ms
build-server-env
COPY ./tsconfig.json . cached
0ms
build-server-env
COPY ./libs libs cached
0ms
stage-2
COPY ./faucet-config.yaml .
0ms
stage-2
COPY ./faucet-config.example.yaml . cached
0ms
stage-2
COPY --from=build-client-env /build/static ./static cached
0ms
Dockerfile:30
-------------------
28 |     COPY --from=build-client-env /build/static ./static
29 |     COPY ./faucet-config.example.yaml .
30 | >>> COPY ./faucet-config.yaml .
31 |     RUN mkdir -p /app/data && chmod 777 /app/data
32 |     RUN cp ./static/index.html ./static/index.seo.html && chmod 777 ./static/index.seo.html
-------------------
ERROR: failed to build: failed to solve: failed to compute cache key: failed to calculate checksum of ref r7aempy18tllkdoamnqntzrvw::y0ai9l71ch78f0n1vtxpmlavb: "/faucet-config.yaml": not found