#'---------
#' Build for prod
#'---------

FROM node:18.10-alpine AS build
WORKDIR /app
COPY --chown=node:node . .
RUN npm ci --only=production && npm i @nestjs/cli && npm run build

#.---------
#. Production
#.---------

FROM node:18.10-alpine
WORKDIR /app
COPY --chown=node:node --from=build /app/dist ./dist
COPY --chown=node:node --from=build /app/node_modules ./node_modules

USER node

CMD ["node", "./dist/main"]
