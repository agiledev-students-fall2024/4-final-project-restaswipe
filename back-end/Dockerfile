FROM node:22-alpine

COPY package.json package.json
COPY package-lock.json package-lock.json
COPY . .

RUN npm install

ENV .env

EXPOSE 8000

CMD [ "npm", "start" ]
