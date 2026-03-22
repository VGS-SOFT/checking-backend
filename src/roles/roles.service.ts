import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './role.entity';
import { Permission } from './permission.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role) private roleRepo: Repository<Role>,
    @InjectRepository(Permission) private permRepo: Repository<Permission>,
  ) {}

  async findAll() { return this.roleRepo.find({ relations: ['parent', 'children', 'permissions'] }); }

  async findOne(id: string) {
    const role = await this.roleRepo.findOne({ where: { id }, relations: ['parent', 'children', 'permissions'] });
    if (!role) throw new NotFoundException(`Role ${id} not found`);
    return role;
  }

  async getTree() {
    const all = await this.roleRepo.find({ relations: ['permissions'] });
    const map = new Map<string, any>();
    all.forEach(r => map.set(r.id, { ...r, children: [] }));
    const roots: any[] = [];
    all.forEach(r => {
      if (r.parentId && map.has(r.parentId)) map.get(r.parentId).children.push(map.get(r.id));
      else roots.push(map.get(r.id));
    });
    return roots;
  }

  async create(dto: CreateRoleDto, creatorRole: Role) {
    if (dto.parentId) {
      const parent = await this.roleRepo.findOne({ where: { id: dto.parentId } });
      if (!parent) throw new NotFoundException('Parent role not found');
      if (!creatorRole.isSystem && parent.level < creatorRole.level)
        throw new ForbiddenException('You cannot create roles above your own level');
      const role = this.roleRepo.create({ name: dto.name, description: dto.description, parentId: dto.parentId, level: parent.level + 1, isSystem: false });
      const saved = await this.roleRepo.save(role);
      if (dto.permissions?.length) await this.setPermissions(saved.id, dto.permissions);
      return this.findOne(saved.id);
    }
    const superAdmin = await this.roleRepo.findOne({ where: { isSystem: true } });
    const role = this.roleRepo.create({ name: dto.name, description: dto.description, parentId: superAdmin?.id || null, level: 1, isSystem: false });
    const saved = await this.roleRepo.save(role);
    if (dto.permissions?.length) await this.setPermissions(saved.id, dto.permissions);
    return this.findOne(saved.id);
  }

  async update(id: string, dto: UpdateRoleDto) {
    const role = await this.findOne(id);
    if (role.isSystem) throw new ForbiddenException('Cannot modify system roles');
    if (dto.name) role.name = dto.name;
    if (dto.description !== undefined) role.description = dto.description;
    await this.roleRepo.save(role);
    if (dto.permissions) await this.setPermissions(id, dto.permissions);
    return this.findOne(id);
  }

  async remove(id: string) {
    const role = await this.findOne(id);
    if (role.isSystem) throw new ForbiddenException('Cannot delete system roles');
    if (role.children?.length) await this.roleRepo.update({ parentId: id }, { parentId: role.parentId, level: role.level });
    await this.roleRepo.remove(role);
  }

  async setPermissions(roleId: string, permissions: { resource: string; actions: string[] }[]) {
    await this.permRepo.delete({ roleId });
    const perms = permissions.map(p => this.permRepo.create({ roleId, resource: p.resource, actions: p.actions }));
    await this.permRepo.save(perms);
  }

  async can(roleId: string, resource: string, action: string) {
    const role = await this.roleRepo.findOne({ where: { id: roleId }, relations: ['permissions'] });
    if (!role) return false;
    if (role.isSystem) return true;
    return role.permissions.some(p => p.resource === resource && (p.actions.includes('manage') || p.actions.includes(action)));
  }

  async getRoleCapabilities(roleId: string) {
    const role = await this.roleRepo.findOne({ where: { id: roleId }, relations: ['permissions'] });
    if (!role) return [];
    if (role.isSystem) return [
      { resource: 'users', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'roles', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'settings', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'posts', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'analytics', actions: ['read'] },
    ];
    return role.permissions.map(p => ({ resource: p.resource, actions: p.actions.includes('manage') ? ['create', 'read', 'update', 'delete'] : p.actions }));
  }
}
