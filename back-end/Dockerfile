FROM node:22-alpine

WORKDIR /usr/src/app

# Copy only package files to install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

EXPOSE 8000
CMD [ "npm", "start" ]
