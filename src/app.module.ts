import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { User } from './users/user.entity';
import { Role } from './roles/role.entity';
import { Permission } from './roles/permission.entity';
import { AuthModule } from './auth/auth.module';
import { RolesModule } from './roles/roles.module';
import { UsersModule } from './users/users.module';
import { SduiModule } from './sdui/sdui.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: process.env.DB_PATH || 'database.sqlite',
      entities: [User, Role, Permission],
      synchronize: true,
    }),
    PassportModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'super-secret-change-in-production',
      signOptions: { expiresIn: '7d' },
    }),
    AuthModule,
    RolesModule,
    UsersModule,
    SduiModule,
  ],
})
export class AppModule {}
