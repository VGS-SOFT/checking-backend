import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionGuard } from '../common/permission.guard';
import { RequirePermission } from '../common/permission.decorator';
import { IsEmail, IsString, IsOptional, IsUUID, IsBoolean } from 'class-validator';

class CreateUserDto {
  @IsEmail() email: string;
  @IsString() name: string;
  @IsString() password: string;
  @IsOptional() @IsUUID() roleId?: string;
}

class UpdateUserDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsUUID() roleId?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
}

@Controller('users')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}
  @Get() @RequirePermission('users', 'read') findAll() { return this.usersService.findAll(); }
  @Get(':id') @RequirePermission('users', 'read') findOne(@Param('id') id: string) { return this.usersService.findOne(id); }
  @Post() @RequirePermission('users', 'create') create(@Body() dto: CreateUserDto) { return this.usersService.create(dto); }
  @Patch(':id') @RequirePermission('users', 'update') update(@Param('id') id: string, @Body() dto: UpdateUserDto) { return this.usersService.update(id, dto); }
  @Delete(':id') @RequirePermission('users', 'delete') remove(@Param('id') id: string) { return this.usersService.remove(id); }
}
