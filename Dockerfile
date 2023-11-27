## Only use this dockerfile after npm run build command.

FROM node:18.17.0

WORKDIR /genuin-webapp-qa

COPY  package*.json ./
COPY  src ./src
COPY  public ./public
COPY next.config.js ./next.config.js
COPY tsconfig.json ./tsconfig.json
COPY tailwind.config.ts ./tailwind.config.ts
COPY postcss.config.js ./postcss.config.js
COPY .eslintrc.json ./.eslintrc.json
COPY .prettierrc.json ./.prettierrc.json
COPY .env ./.env

# Install project dependencies
RUN npm install

RUN npm run build

EXPOSE 3000

ENV PORT=3000

CMD [ "npm", "start" ]