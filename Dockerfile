FROM node:24-alpine

RUN corepack enable

WORKDIR /app

COPY package.json ./
RUN pnpm install

COPY . .

EXPOSE 3001

CMD ["pnpm", "dev"]
