import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UpdateQuery } from 'mongoose';
import { compare } from 'bcrypt';
import { User } from './schema/user.schema';
import { SignUpDto } from '../auth/dto/signup.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { PaginatedModel } from '../common/interfaces/paginated-model.interface';
import { Role } from '../common/enums/role.enum';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: PaginatedModel<User>,
  ) {}

  create(signUpDto: SignUpDto): Promise<User> {
    return this.userModel.create(signUpDto);
  }

  async createUser(
    createUserDto: CreateUserDto,
  ): Promise<{ user: Partial<User> }> {
    const user = await this.getUserByEmail(createUserDto.email);
    if (user) {
      throw new ConflictException('Email already exists');
    }
    const newUser = await this.userModel.create({
      ...createUserDto,
      isActive: true,
      activatedAt: new Date(),
    });

    return {
      user: {
        id: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        role: newUser.role,
      },
    };
  }

  getUserByEmail(email: string): Promise<User> {
    return this.userModel.findOne({ email });
  }

  async getUserById(userId: string): Promise<{ user: Partial<User> }> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        profile: user.profile,
      },
    };
  }

  updateUserById(userId: string, update: UpdateQuery<User>): Promise<User> {
    return this.userModel.findByIdAndUpdate(userId, update, { new: true });
  }

  async updateUser(
    userId: string,
    update: UpdateQuery<User>,
  ): Promise<{ user: Partial<User> }> {
    const user = await this.userModel.findByIdAndUpdate(userId, update, {
      new: true,
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        profile: user.profile,
      },
    };
  }

  async updatePassword(
    email: string,
    updatePasswordDto: UpdatePasswordDto,
  ): Promise<void> {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isMatched = await compare(updatePasswordDto.password, user.password);
    if (!isMatched) {
      throw new BadRequestException('Invalid password');
    }

    user.password = updatePasswordDto.newPassword;
    await user.save();
  }

  async resetPassword(
    userId: string,
    resetPasswordDto: ResetPasswordDto,
  ): Promise<void> {
    const user = await this.userModel.findOne({
      _id: userId,
      role: Role.USER,
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.password = resetPasswordDto.newPassword;
    await user.save();
  }

  async getUsers(page: number, limit: number) {
    return this.userModel.paginate(
      {},
      {
        page,
        limit,
        projection: '-password -activatedAt',
      },
    );
  }

  async removeUser(userId: string): Promise<User> {
    const user = await this.userModel.findByIdAndDelete(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
