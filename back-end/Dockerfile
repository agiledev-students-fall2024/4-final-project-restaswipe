FROM node:22-alpine

COPY package.json package.json
COPY package-lock.json package-lock.json

RUN npm install

ENV .env

EXPOSE 8000

COPY . .

CMD [ "npm", "start" ]
