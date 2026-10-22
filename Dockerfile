FROM node:22-alpine AS development

RUN corepack enable && corepack prepare pnpm@10 --activate

WORKDIR /app

COPY package*.json pnpm*.yml ./

RUN pnpm install

COPY . .

EXPOSE 3000

CMD ["pnpm", "start:dev"]