FROM oven/bun:alpine
COPY package.json .
COPY bun.lock .
COPY src/ .
COPY index.ts .
RUN bun install

CMD ["bun", "run", "start"]