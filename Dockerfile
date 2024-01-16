FROM node:latest
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
RUN npm run build
ENV NODE_ENV=production
CMD [ "npm", "start" ]