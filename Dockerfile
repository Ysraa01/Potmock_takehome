FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY src ./src

ENV NODE_ENV=production
ENV PORT=3000
ENV POTMOCK_DB=/tmp/potmock.db

EXPOSE 3000
CMD ["node", "src/server.js"]
