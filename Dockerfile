## Only use this dockerfile after npm run build command.

FROM node:14-slim

WORKDIR /genuin-webapp-qa

COPY  package*.json ./
COPY  .next ./.next
COPY  node_modules ./node_modules
COPY  public ./public

EXPOSE 4000

ENV PORT=4000
CMD [ "npm", "start" ]