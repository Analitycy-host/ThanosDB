# Stage 1 - Building
FROM node:current-alpine as builder
WORKDIR /builder
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2 - Running
FROM node:current-alpine as runner
WORKDIR /app
COPY package*.json ./
RUN npm install --only-production
COPY --from=builder /builder/build ./build
ENV NODE_ENV=production

CMD [ "npm", "start" ]