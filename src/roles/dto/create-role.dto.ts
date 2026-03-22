import { IsString, IsOptional, IsArray, ValidateNested, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class PermissionDto {
  @IsString() resource: string;
  @IsArray() @IsString({ each: true }) actions: string[];
}

export class CreateRoleDto {
  @IsString() name: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsUUID() parentId?: string;
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => PermissionDto) permissions?: PermissionDto[];
}
