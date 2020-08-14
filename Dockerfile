FROM node:lts-alpine

ARG NODE_ENV=production

COPY package.json .
COPY package-lock.json .

RUN npm install

COPY . ./

CMD ["npm", "start"]
