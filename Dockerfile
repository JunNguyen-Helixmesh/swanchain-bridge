FROM node:21.5.0

WORKDIR /app

COPY package*.json ./

COPY tsconfig.json ./
RUN npm install -g only-allow
RUN npm install --production

COPY . .

RUN npm run build

EXPOSE 3000

ENV NODE_ENV=production

CMD ["npm", "start"]
