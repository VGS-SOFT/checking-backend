import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

  async findAll() {
    const users = await this.userRepo.find({ relations: ['role'] });
    return users.map(({ password, ...u }) => u);
  }

  async findOne(id: string) {
    const user = await this.userRepo.findOne({ where: { id }, relations: ['role', 'role.permissions'] });
    if (!user) throw new NotFoundException('User not found');
    const { password, ...rest } = user as any;
    return rest;
  }

  async create(data: { email: string; name: string; password: string; roleId?: string }) {
    const existing = await this.userRepo.findOne({ where: { email: data.email } });
    if (existing) throw new ConflictException('Email already exists');
    const hashed = await bcrypt.hash(data.password, 10);
    const user = this.userRepo.create({ ...data, password: hashed });
    const saved = await this.userRepo.save(user);
    const { password, ...rest } = saved as any;
    return rest;
  }

  async update(id: string, data: Partial<{ name: string; email: string; roleId: string; isActive: boolean }>) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    Object.assign(user, data);
    await this.userRepo.save(user);
    return this.findOne(id);
  }

  async remove(id: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    await this.userRepo.remove(user);
  }
}
