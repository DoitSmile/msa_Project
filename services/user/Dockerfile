FROM node:18

WORKDIR /user-service/
COPY ./package.json /user-service/
COPY ./tsconfig.json /user-service/
COPY ./yarn.lock /user-service/
RUN yarn install

COPY . /user-service/
CMD yarn start:dev