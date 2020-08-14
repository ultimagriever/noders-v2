FROM node:lts-alpine

ARG NODE_ENV=production

COPY package.json .
COPY package-lock.json .

RUN npm install

WORKDIR /usr/src/app
COPY . ./

CMD ["npm", "start"]
