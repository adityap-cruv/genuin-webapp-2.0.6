FROM node:14-slim

WORKDIR /genuin-webapp

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build