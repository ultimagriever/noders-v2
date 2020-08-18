FROM node:lts-alpine
WORKDIR /usr/src/app

ARG NODE_ENV=production

COPY package.json .
COPY package-lock.json .

RUN NODE_ENV=${NODE_ENV} npm install

COPY . ./

CMD ["npm", "start"]
