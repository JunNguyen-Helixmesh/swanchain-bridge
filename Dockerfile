# 使用官方 Node.js 基础镜像
FROM node:latest

# 设置容器内的工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json（如果可用）
COPY package*.json ./

# 安装项目依赖
RUN npm install

# 复制项目文件和目录到工作目录
COPY . .

# 构建应用
RUN npm run build

# 暴露端口 3000
EXPOSE 3000

# 设置环境变量
ENV NODE_ENV production

# 启动 Next.js 应用
CMD ["npm", "start"]
