FROM node:18

WORKDIR /board-service/
COPY ./package.json /board-service/
COPY ./tsconfig.json /board-service/
COPY ./yarn.lock /board-service/
RUN yarn install

COPY . /board-service/
CMD yarn start:dev