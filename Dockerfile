## Only use this dockerfile after npm run build command.

FROM node:18.17.0

WORKDIR /genuin-webapp-qa

COPY  . ./.

# Install project dependencies
RUN yarn
RUN yarn add sharp

RUN yarn build

EXPOSE 4000

ENV PORT=4000

CMD [ "yarn", "start" ]