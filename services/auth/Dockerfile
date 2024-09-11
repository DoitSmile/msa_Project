# 운영체제 설치(node 18버전과 npm과 yarn이 모두 설치되어있는 리눅스)
FROM node:18

WORKDIR /auth-service/
# 내 컴퓨터에 있는 폴더나 파일을 도커 컴퓨터 안으로 복사하기
COPY ./package.json /auth-service/
COPY ./yarn.lock /auth-service/
COPY ./tsconfig.json /auth-service/
RUN yarn install

COPY . /auth-service/

# 도커안에서 실행시키기
CMD yarn start:dev