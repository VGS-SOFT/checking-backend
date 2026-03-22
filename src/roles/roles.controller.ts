import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequirePermission } from '../common/permission.decorator';
import { PermissionGuard } from '../common/permission.guard';

@Controller('roles')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class RolesController {
  constructor(private rolesService: RolesService) {}
  @Get() @RequirePermission('roles', 'read') findAll() { return this.rolesService.findAll(); }
  @Get('tree') @RequirePermission('roles', 'read') getTree() { return this.rolesService.getTree(); }
  @Get(':id') @RequirePermission('roles', 'read') findOne(@Param('id') id: string) { return this.rolesService.findOne(id); }
  @Post() @RequirePermission('roles', 'create') create(@Body() dto: CreateRoleDto, @Request() req) { return this.rolesService.create(dto, req.user.role); }
  @Patch(':id') @RequirePermission('roles', 'update') update(@Param('id') id: string, @Body() dto: UpdateRoleDto) { return this.rolesService.update(id, dto); }
  @Delete(':id') @RequirePermission('roles', 'delete') remove(@Param('id') id: string) { return this.rolesService.remove(id); }
}
