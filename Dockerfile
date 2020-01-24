FROM node:12-alpine

# Make node-gyp install
RUN apk add g++ make python

# Create app directory
RUN mkdir -p /usr/src/app && chown node:node /usr/src/app

WORKDIR /usr/src/app

# Bundle app source
COPY --chown=node:node package*.json /usr/src/app/
COPY --chown=node:node src/ ./src
COPY --chown=node:node public/ ./public
COPY --chown=node:node next.config.js ./
COPY --chown=node:node next-auth.config.js ./
COPY --chown=node:node next-auth.functions.js ./
COPY --chown=node:node next-auth.providers.js ./
COPY --chown=node:node .env ./
COPY --chown=node:node index.js ./
COPY --chown=node:node serviceacct.json ./

USER node

# Install and build
RUN npm install 
RUN npm run build

CMD ["node", "index.js"]
