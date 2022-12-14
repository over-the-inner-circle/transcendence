FROM node:18-alpine

COPY . src
WORKDIR src

RUN npm install
RUN npm run build

CMD ["npm", "start"]
