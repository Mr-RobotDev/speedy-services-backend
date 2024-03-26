import {
  Body,
  Controller,
  Get,
  Patch,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Account } from '../common/interfaces/account.interface';
import { ImageUploadPipe } from './pipes/image.pipe';
import { MediaService } from '../media/media.service';
import { Folder } from '../common/enums/folder.enum';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller({
  path: 'users',
  version: '1',
})
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly mediaService: MediaService,
  ) {}

  @Roles(Role.ADMIN)
  @Get()
  getUsers(@Query('limit') limit?: number, @Query('page') page?: number) {
    return this.userService.getUsers(page, limit);
  }

  @Roles(Role.ADMIN)
  @Get('stats')
  getUserStats() {
    return this.userService.getUserStats();
  }

  @Get('/me')
  getMe(@CurrentUser() account: Account) {
    return this.userService.getUserById(account.sub);
  }

  @Put('/profile')
  @UseInterceptors(FileInterceptor('file'))
  async updateProfilePic(
    @UploadedFile(new ImageUploadPipe()) file: Express.Multer.File,
    @CurrentUser() account: Account,
  ) {
    const profile = await this.mediaService.uploadImage(file, Folder.PROFILES);
    await this.userService.updateUser(account.sub, { profile });
    return { profile };
  }

  @Patch('/update-user')
  updateUser(
    @CurrentUser() account: Account,
    @Body() updateUsernameDto: UpdateUserDto,
  ) {
    return this.userService.updateUser(account.sub, updateUsernameDto);
  }

  @Patch('/update-password')
  updatePassword(
    @CurrentUser() account: Account,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    return this.userService.updatePassword(account, updatePasswordDto);
  }
}
