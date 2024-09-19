FROM node:18

WORKDIR /post-service/
COPY ./package.json /post-service/
COPY ./tsconfig.json /post-service/
COPY ./yarn.lock /post-service/
RUN yarn install

COPY . /post-service/
CMD yarn start:dev