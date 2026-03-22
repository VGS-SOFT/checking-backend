import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './users/user.entity';
import { Role } from './roles/role.entity';
import { Permission } from './roles/permission.entity';

const AppDataSource = new DataSource({
  type: 'better-sqlite3',
  database: process.env.DB_PATH || 'database.sqlite',
  entities: [User, Role, Permission],
  synchronize: true,
});

async function seed() {
  await AppDataSource.initialize();
  const roleRepo = AppDataSource.getRepository(Role);
  const userRepo = AppDataSource.getRepository(User);

  const existing = await roleRepo.findOne({ where: { isSystem: true } });
  if (existing) {
    console.log('✅ Already seeded. SuperAdmin role exists.');
    await AppDataSource.destroy();
    return;
  }

  const superAdminRole = roleRepo.create({
    name: 'SuperAdmin',
    description: 'Full system access. Cannot be deleted or modified.',
    level: 0,
    isSystem: true,
    parentId: null,
  });
  await roleRepo.save(superAdminRole);

  const password = await bcrypt.hash('superadmin123', 10);
  const superAdmin = userRepo.create({
    email: 'superadmin@system.local',
    name: 'Super Admin',
    password,
    roleId: superAdminRole.id,
  });
  await userRepo.save(superAdmin);

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  ✅ Seeded! Login credentials:');
  console.log('  Email:    superadmin@system.local');
  console.log('  Password: superadmin123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  await AppDataSource.destroy();
}

seed().catch(console.error);
