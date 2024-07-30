FROM node:21.5.0

WORKDIR /app

COPY package*.json ./

COPY tsconfig.json ./
RUN npm install -g only-allow
RUN npm install --omit=dev

COPY . .

# ENV NEXT_PUBLIC_PRODUCT_ID=
# ENV NEXT_PUBLIC_GALXE_ACCESS_TOKEN=
# ENV NEXT_PUBLIC_GALXE_CREDENTIAL_ID=

RUN npm run build

EXPOSE 3000

ENV NODE_ENV=production

CMD ["npm", "start"]
