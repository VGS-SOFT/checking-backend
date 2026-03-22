import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn } from 'typeorm';
import { Permission } from './permission.entity';
import { User } from '../users/user.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ unique: true }) name: string;
  @Column({ nullable: true }) description: string;
  @Column({ default: 0 }) level: number;
  @Column({ nullable: true }) parentId: string;
  @ManyToOne(() => Role, (role) => role.children, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'parentId' }) parent: Role;
  @OneToMany(() => Role, (role) => role.parent) children: Role[];
  @OneToMany(() => Permission, (p) => p.role, { cascade: true, eager: true }) permissions: Permission[];
  @OneToMany(() => User, (u) => u.role) users: User[];
  @Column({ default: false }) isSystem: boolean;
  @CreateDateColumn() createdAt: Date;
}
