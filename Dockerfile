FROM node:lts-alpine

EXPOSE 3000
ENV TZ=Asia/Shanghai

WORKDIR /app
COPY . .

RUN yarn config set registry https://registry.npmmirror.com/
RUN yarn

CMD ["npm", "run", "start"]docker run -d --name cursor-api -e x-cursor-checksum=xxxxxx -p 3000:3000 zhx47/cursor-api:latestcd cursor-api
npm install
npm run dev
