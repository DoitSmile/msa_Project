import 'dotenv/config';
export class PhoneAuthentication {
  coolsms = require('coolsms-node-sdk').default;

  async checkphone(myphone) {
    console.log("myphone:",myphone)
    if (myphone.length < 10 || myphone.length > 11) {
      console.log('유효하지 않은 핸드폰 번호');
      return false;
    } else {
      console.log('유효한 번호');
      return true;
    }
  }

  getToken() {
    const result = String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
    return result;
  }

  async sendTokenToSMS(myphone, token) {
    const SMS_KEY = process.env.SMS_KEY;
    const SMS_SECRET = process.env.SMS_SECRET;
    const SMS_SENDER = process.env.SMS_SENDER;
    const messageService = await new this.coolsms(SMS_KEY, SMS_SECRET);
    const result = await messageService.sendOne({
      to: myphone,
      from: SMS_SENDER,
      text: `[YEON] 안녕하세요?! 요청하신 인증번호는 [${token}] 입니다.`,
    });
    console.log(result);
  }
}
