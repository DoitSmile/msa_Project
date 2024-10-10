import {
  ConflictException,
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
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
  async fetchUser(userId) {
    console.log("userId:",userId)
    return await this.userRepository.findOne({
      where: { id:userId },
    });
  }

  // 회원 수정 
  async updateUser(userId, updateUserInput) {
    console.log('updateUserInput:', updateUserInput);
    console.log('id:', userId);
  
    try {
      // 사용자 찾기
      const user = await this.userRepository.findOne({ where: { id: userId } });
      
      if (!user) {
        throw new Error('사용자를 찾을 수 없습니다.');
      }
  
      // 비밀번호 확인
      const isPasswordValid = await bcrypt.compare(updateUserInput.password, user.password);
      if (!isPasswordValid) {
        throw new Error('비밀번호가 일치하지 않습니다.');
      }
  
      // 업데이트할 데이터에서 비밀번호 제거
      const { password, ...updateData } = updateUserInput;
  
      // 사용자 정보 업데이트
      const result = await this.userRepository.update(
        { id: userId },
        { ...updateData }
      );
  
      console.log('사용자 정보 업데이트 완료');
      
      if (result.affected > 0) {
        return { success: true, message: '사용자 정보가 성공적으로 업데이트되었습니다.' };
      } else {
        return { success: false, message: '사용자 정보 업데이트에 실패했습니다.' };
      }
    } catch (error) {
      console.error('사용자 업데이트 중 오류 발생:', error);
      throw new Error(error.message || '사용자 정보 업데이트 중 오류가 발생했습니다.');
    }
  }

  // 회원 탈퇴
  async delUser(userId, password) {
    const user = await this.findId({ id:userId });
    const isAuth = await bcrypt.compare(password, user.password);
    if (isAuth) {
      await this.userRepository.softRemove({ id:userId });
    } else {
      throw new ConflictException('일치하지 않는 비밀번호입니다.');
    }
    return console.log('탈퇴완료');
  }

  // 비밀번호 변경 
  async updateUserPassword(userId, updatePasswordInput) {
    console.log("service:", updatePasswordInput);
    console.log("service userId:", userId);
    const { currentPassword, newPassword, confirmNewPassword } = updatePasswordInput;
  
    // 사용자 찾기
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }
  
    // 현재 비밀번호 확인
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('현재 비밀번호가 일치하지 않습니다.');
    }
  
    // 새 비밀번호 확인
    if (currentPassword === newPassword) {
      throw new BadRequestException('새 비밀번호는 현재 비밀번호와 달라야 합니다.');
    }
  
    if (newPassword !== confirmNewPassword) {
      throw new BadRequestException('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
    }
  
    // 새 비밀번호 해시화 및 저장
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await this.userRepository.update(userId, { password: hashedNewPassword });
  
    console.log('비밀번호 변경 완료');
    return { success: true, message: '비밀번호가 성공적으로 변경되었습니다.' };
  }
}