# ---------- BUILD STAGE ----------
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# ---------- PRODUCTION STAGE ----------
FROM node:20-alpine
WORKDIR /app

COPY --from=build /app/build ./build
COPY server.js ./
COPY package*.json ./

RUN npm install --only=production

ENV PORT=10000
EXPOSE 10000

CMD ["node", "server.js"]
