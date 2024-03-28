import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { SignUpDto } from './dto/signup.dto';
import { ActivateAccountDto } from './dto/activate-account.dto';
import { LoginDto } from './dto/login.dto';
import { LoginSuccess } from './types/login-success.type';
import { User } from './types/user.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(signUpDto: SignUpDto): Promise<{ user: User }> {
    const user = await this.userService.getUserByEmail(signUpDto.email);
    if (user) {
      throw new ConflictException('Email already exists');
    }

    const newUser = await this.userService.createUser(signUpDto);
    return {
      user: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        role: newUser.role,
      },
    };
  }

  async activateAccount(
    activeAccountDto: ActivateAccountDto,
  ): Promise<{ isActive: true }> {
    const user = await this.userService.getUserByEmail(activeAccountDto.email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.isActive) {
      throw new BadRequestException('This account is already active!');
    }

    await this.userService.updateUserById(user._id, {
      isActive: true,
      activatedAt: new Date(),
    });

    return {
      isActive: true,
    };
  }

  async login(loginDto: LoginDto): Promise<LoginSuccess> {
    const user = await this.userService.getUserByEmail(loginDto.email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!user.isActive) {
      throw new BadRequestException('Your account is not active yet!');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid password');
    }
    const payload = {
      sub: user._id,
      email: user.email,
      role: user.role,
    };
    const token = await this.jwtService.signAsync(payload);
    return {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        profile: user.profile,
      },
      token,
    };
  }
}
