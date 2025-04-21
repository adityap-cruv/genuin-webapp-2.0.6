## Only use this dockerfile after npm run build command.

FROM node:18.17.0

WORKDIR /genuin-webapp-qa

COPY  . ./.

# Install project dependencies
RUN npm install
RUN npm i sharp

RUN npm run build

EXPOSE 4000

ENV PORT=4000

CMD [ "npm", "start" ]