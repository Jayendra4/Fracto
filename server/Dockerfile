# base image
FROM node:24 AS base

WORKDIR /hof

ARG PORT

RUN npm install pm2 --location=global

COPY package.json .
COPY package-lock.json .
COPY prisma/schema.prisma prisma/schema.prisma

ENV HUSKY=0

RUN npm install

COPY . .

EXPOSE ${PORT}

# development image
FROM base AS hof-dev

CMD ["npm", "run", "start:dev"]

# production image
FROM base AS hof

RUN npm run build

CMD ["pm2-runtime", "start", "ecosystem.config.js"]
