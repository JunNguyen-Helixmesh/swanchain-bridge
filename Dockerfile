FROM node:21.5.0

WORKDIR /app

COPY package*.json ./

COPY tsconfig.json ./
RUN npm install -g only-allow
RUN npm install --omit=dev

COPY . .

# Set build-time variables (arguments)
ARG NEXT_PUBLIC_PRODUCT_ID

# Set environment variables for the container
ENV NEXT_PUBLIC_PRODUCT_ID=$NEXT_PUBLIC_PRODUCT_ID

RUN npm run build

EXPOSE 3000

ENV NODE_ENV=production

CMD ["npm", "start"]
