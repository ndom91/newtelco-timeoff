# This stage installs our modules
FROM mhart/alpine-node:12
WORKDIR /app
COPY package.json package-lock.json ./

RUN npm install 
RUN npm run build

FROM mhart/alpine-node:slim-12

WORKDIR /app
COPY --from=0 /app .
COPY . .

CMD PORT=7666 node index.js