FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev \
  && npm cache clean --force \
  && rm -rf \
    /opt/yarn* \
    /usr/local/bin/corepack \
    /usr/local/bin/npm \
    /usr/local/bin/npx \
    /usr/local/bin/yarn \
    /usr/local/bin/yarnpkg \
    /usr/local/lib/node_modules/corepack \
    /usr/local/lib/node_modules/npm

COPY dist ./dist

EXPOSE 8080

USER node

CMD ["node", "dist/index.js"]
