FROM node:12-alpine

# Make node-gyp install
RUN apk add g++ make python

ENV PORT 7000

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json /usr/src/app/

RUN npm install

# Bundle app source

COPY src/ ./src
COPY public/ ./public
COPY next.config.js ./
COPY next-auth.config.js ./
COPY next-auth.functions.js ./
COPY next-auth.providers.js ./

RUN npm run build

EXPOSE 7000

CMD [ "npm", "start" ]
