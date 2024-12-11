FROM node:22-alpine

WORKDIR /usr/src/app
COPY package.json package.json
COPY package-lock.json package-lock.json

# Copy only package files to install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

EXPOSE 8000
EXPOSE 8080


CMD [ "npm", "start" ]
