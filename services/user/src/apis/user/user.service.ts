import {
  ConflictException,
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from 'entity_shared';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { IUserEmail } from 'entity_shared';
import { Storage } from '@google-cloud/storage';
import { ConfigService } from '@nestjs/config'; // 환경변수 읽을 수 있음
import { PhoneAuthentication } from './checkphone';
import { CreateUserInput } from '../../../src/interfaces/user-service.interface';

@Injectable()
export class UserService {
  private storage: Storage;
  private bucket: string;
  constructor(
    @InjectRepository(User) // 사용할 entitiy를 명시한 대상 repository로 주입 ( forFeature에 등록한 repository들이 대상)
    private readonly userRepository: Repository<User>,
    private configService: ConfigService,
    private readonly authPhone: PhoneAuthentication,
  ) {
    const projectId = this.configService.get<string>('GCP_PROJECT_ID');
    const keyFilename = this.configService.get<string>('GCP_KEY_FILENAME');

    this.storage = new Storage({
      projectId,
      keyFilename,
    });

    this.bucket = this.configService.get<string>('GCP_STORAGE_BUCKET');
  }

  private verificationCodes: Map<string, { code: string }> = new Map();

  // 아이디로 유저 찾기
  async findId({ id }) {
    return await this.userRepository.findOne({
      where: { id },
    });
  }

  // 회원가입
  async createUser(createUserInput: CreateUserInput): Promise<User> {
    console.log('service:', createUserInput);
    const { email, name, phone, password } = createUserInput;
    console.log('email:', email);
    const hashPassword = await bcrypt.hash(password, 10);
    console.log(hashPassword);
    return await this.userRepository.save({
      email,
      name,
      phone,
      password: hashPassword,
    });
  }

  // 회원 조회
  async fetchUser(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      console.log('회원쪽');
      throw new NotFoundException('User not found');
    }
    console.log('user:', user);
    return user;
  }

  // 회원 수정
  async updateUser(userId: string, updateData: any) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateData.profilePicture) {
      const imageUrl = await this.uploadImage(updateData.profilePicture);
      user.profilePictureUrl = imageUrl;
    }

    // 다른 필드 업데이트
    if (updateData.name) user.name = updateData.name;
    if (updateData.email) user.email = updateData.email;
    if (updateData.phone) user.phone = updateData.phone;

    await this.userRepository.save(user);
    return { success: true, user };
  }

  private async uploadImage(imageData: string): Promise<string> {
    const bucket = this.storage.bucket(this.bucket);
    const fileName = `profile-${Date.now()}.jpg`;
    const file = bucket.file(fileName);

    const buffer = Buffer.from(imageData.split(',')[1], 'base64');

    await file.save(buffer, {
      metadata: {
        contentType: 'image/jpeg',
      },
    });

    const publicUrl = `https://storage.googleapis.com/${this.bucket}/${fileName}`;
    return publicUrl;
  }
  // 회원 탈퇴
  async delUser(userId, password) {
    const user = await this.findId({ id: userId });
    const isAuth = await bcrypt.compare(password, user.password);
    if (isAuth) {
      await this.userRepository.softRemove({ id: userId });
    } else {
      throw new ConflictException('일치하지 않는 비밀번호입니다.');
    }
    return console.log('탈퇴완료');
  }

  // 비밀번호 변경
  async updateUserPassword(userId, updatePasswordInput) {
    console.log('service:', updatePasswordInput);
    console.log('service userId:', userId);
    const { currentPassword, newPassword, confirmNewPassword } =
      updatePasswordInput;

    // 사용자 찾기
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    // 현재 비밀번호 확인
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('현재 비밀번호가 일치하지 않습니다.');
    }

    // 새 비밀번호 확인
    if (currentPassword === newPassword) {
      throw new BadRequestException(
        '새 비밀번호는 현재 비밀번호와 달라야 합니다.',
      );
    }

    if (newPassword !== confirmNewPassword) {
      throw new BadRequestException(
        '새 비밀번호와 확인 비밀번호가 일치하지 않습니다.',
      );
    }

    // 새 비밀번호 해시화 및 저장
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await this.userRepository.update(userId, { password: hashedNewPassword });

    console.log('비밀번호 변경 완료');
    return { success: true, message: '비밀번호가 성공적으로 변경되었습니다.' };
  }

  // 핸드폰 인증번호 전송.
  async sendPhone(phone_num: string): Promise<any> {
    console.log('service phone_num', phone_num);
    const checkValid = await this.authPhone.checkphone(phone_num);
    if (!checkValid) throw new ConflictException('유효하지 않은 핸드폰 번호');
    const myToken = await this.authPhone.getToken();
    const expiry = Date.now() + 300000; // 5분 후 만료
    console.log('expiry:', expiry);
    await this.authPhone.sendTokenToSMS(phone_num, myToken);
    const set = this.verificationCodes.set(phone_num, {
      code: myToken,
    }); // 인증번호 임시저장하기
    console.log('set:', set);
    return set;
  }

  // 핸드폰 인증번호 확인
  async checkValidPhone(authPhoneInput): Promise<any> {
    console.log('authPhoneInput:', authPhoneInput);
    const storedData = this.verificationCodes.get(authPhoneInput.phone_num);
    console.log('storedData:', storedData);
    console.log('storedData:', storedData.code);
    console.log('authPhoneInput.auth_num:', authPhoneInput.auth_num);
    if (storedData.code === authPhoneInput.auth_num) {
      return '인증이 완료되었습니다.';
    } else {
      throw new ConflictException('인증실패');
    }
  }

  async checkEmailAvailability(email: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { email } });
    return !user; // 사용자가 없으면 true (사용 가능), 있으면 false (사용 불가)
  }

  async checkNameAvailability(name: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { name } });
    return !user; // 사용자가 없으면 true (사용 가능), 있으면 false (사용 불가)
  }
}
