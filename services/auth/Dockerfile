FROM node:18

WORKDIR /auth-service/
COPY ./package.json /auth-service/
COPY ./yarn.lock /auth-service/
COPY ./tsconfig.json /auth-service/
RUN yarn install

COPY . /auth-service/
CMD yarn start:dev