import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '@shared/entites/user/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import {
  IUserEmail,
} from '@shared/interfaces/user/user-service.interface';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) // 사용할 entitiy를 명시한 대상 repository로 주입 ( forFeature에 등록한 repository들이 대상)
    private readonly userRepository: Repository<User>,
  ) {}

  // 이메일로 유저 찾기
  async findEmail({ email }: IUserEmail) {
    return await this.userRepository.findOne({
      where: { email },
    });
  }

  // 아이디로 유저 찾기
  async findId({ id }) {
    return await this.userRepository.findOne({
      where: { id },
    });
  }

  // 회원가입
  async createUser(createUserInput): Promise<User> {
    console.log('service:', createUserInput);
    const { email, name, phone, password } = createUserInput;
    console.log('email:', email);
    const user = await this.findEmail({ email });

    // null 이면 fasle와 동일하게 작동
    if (user) throw new ConflictException('이미 존재하는 이메일입니다.');
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
  async fetchUser(id) {
    return await this.userRepository.findOne({
      where: { id },
    });
  }
  // 회원 수정
  async updateUser(updateUserInput, id) {
    console.log('updateUserInput:', updateUserInput);
    console.log('id:', id);
    return await this.userRepository.update({ id }, { ...updateUserInput });
  }

  // 회원 탈퇴
  async delUser(password, id) {
    const user = await this.findId({ id });
    const isAuth = await bcrypt.compare(password, user.password);
    if (isAuth) {
      await this.userRepository.softRemove({ id });
    } else {
      throw new ConflictException('일치하지 않는 비밀번호입니다.');
    }
    return console.log('탈퇴완료');
  }

  // 비밀번호를 확인하는 함수
  async validPassword(new_password, new_password_check, id) {
    if (new_password === new_password_check) {
      const hashpassword = await bcrypt.hash(new_password, 10);
      await this.userRepository.update({ id }, { password: hashpassword });
      console.log('비밀번호 변경 완료');
    } else {
      throw new ConflictException('새로 입력한 비밀번호가 일치하지 않습니다.');
    }
  }

  // 기존 비밀번호와 새로입력한 비밀번호 일치 확인
  validNewPassword(password, new_password) {
    if (password === new_password) {
      throw new UnauthorizedException('기존과 다른 비밀번호를 입력해주세요');
    }
  }

  // // 비밀번호 변경
  // async updateUserPassword({ updatePasswordInput }: IUserUpdatePassword, id) {
  //   const { password, new_password, new_password_check } = updatePasswordInput;

  //   const user = await this.findId({ id });

  //   if (password === new_password) {
  //     throw new UnauthorizedException('기존과 다른 비밀번호를 입력해주세요');
  //   }

  //   const isAuth = await bcrypt.compare(password, user.password);

  //   if (isAuth) {
  //     this.validNewPassword(password, new_password);
  //     await this.validPassword(new_password, new_password_check, id);
  //   } else {
  //     console.log('비밀번호 불일치');
  //     throw new ConflictException('비밀번호가 일치하지 않습니다.');
  //   }
  // }
}
