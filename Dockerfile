FROM node:lts-alpine

EXPOSE 3000
ENV TZ=Asia/Shanghai

WORKDIR /app
COPY . .

RUN yarn config set registry https://registry.npmmirror.com/
RUN yarn

CMD ["npm", "run", "start"]