import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PipelineStage, UpdateQuery } from 'mongoose';
import { compare } from 'bcrypt';
import { User } from './schema/user.schema';
import { SignUpDto } from '../auth/dto/signup.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { Account } from '../common/interfaces/account.interface';
import { PaginatedModel } from '../common/interfaces/paginated-model.interface';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: PaginatedModel<User>,
  ) {}

  createUser(signupDto: SignUpDto): Promise<User> {
    return this.userModel.create(signupDto);
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
        id: user._id,
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
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        profile: user.profile,
      },
    };
  }

  async updatePassword(
    account: Account,
    updatePasswordDto: UpdatePasswordDto,
  ): Promise<void> {
    const user = await this.userModel.findOne({ email: account.email });
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

  async getUsers(page: number, limit: number) {
    return this.userModel.paginate(
      {
        role: Role.USER,
      },
      {
        page,
        limit,
        projection: '-password -activatedAt',
      },
    );
  }

  async getUserStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59,
    );

    const pipeline: PipelineStage[] = [
      {
        $facet: {
          totalUsers: [{ $count: 'count' }],
          totalUsersThisMonth: [
            { $match: { createdAt: { $gte: startOfMonth } } },
            { $count: 'count' },
          ],
          totalUsersThisYear: [
            { $match: { createdAt: { $gte: startOfYear } } },
            { $count: 'count' },
          ],
          lastMonthCount: [
            {
              $match: {
                createdAt: { $gte: lastMonthStart, $lt: lastMonthEnd },
              },
            },
            { $count: 'count' },
          ],
        },
      },
      {
        $project: {
          totalUsers: { $arrayElemAt: ['$totalUsers.count', 0] },
          totalUsersLastMonth: { $arrayElemAt: ['$lastMonthCount.count', 0] },
          totalUsersThisMonth: {
            $arrayElemAt: ['$totalUsersThisMonth.count', 0],
          },
          totalUsersThisYear: {
            $arrayElemAt: ['$totalUsersThisYear.count', 0],
          },
          percentageChange: {
            $cond: {
              if: { $eq: [{ $arrayElemAt: ['$lastMonthCount.count', 0] }, 0] },
              then: {
                $cond: {
                  if: {
                    $gt: [
                      { $arrayElemAt: ['$totalUsersThisMonth.count', 0] },
                      0,
                    ],
                  },
                  then: 100,
                  else: 0,
                },
              },
              else: {
                $multiply: [
                  {
                    $divide: [
                      {
                        $subtract: [
                          { $arrayElemAt: ['$totalUsersThisMonth.count', 0] },
                          { $arrayElemAt: ['$lastMonthCount.count', 0] },
                        ],
                      },
                      { $arrayElemAt: ['$lastMonthCount.count', 0] },
                    ],
                  },
                  100,
                ],
              },
            },
          },
        },
      },
    ];

    const [stats] = await this.userModel.aggregate(pipeline);
    return stats;
  }
}
