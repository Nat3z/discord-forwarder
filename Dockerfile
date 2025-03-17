FROM oven/bun:alpine
COPY package.json .
COPY bun.lock .
COPY . .
RUN bun install

CMD ["bun", "run", "start"]