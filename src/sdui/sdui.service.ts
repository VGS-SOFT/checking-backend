import { Injectable } from '@nestjs/common';
import { RolesService } from '../roles/roles.service';

@Injectable()
export class SduiService {
  constructor(private rolesService: RolesService) {}

  async buildSchema(user: any) {
    const capabilities = await this.rolesService.getRoleCapabilities(user.roleId);
    const capMap = new Map(capabilities.map(c => [c.resource, c.actions]));
    const can = (resource: string, action: string) => {
      if (user.role?.isSystem) return true;
      const actions = capMap.get(resource) || [];
      return actions.includes(action) || actions.includes('manage');
    };
    const navigation: any[] = [];
    const pages: any[] = [];

    navigation.push({ id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', page: 'dashboard' });
    pages.push({ id: 'dashboard', title: 'Dashboard', icon: 'LayoutDashboard', components: [
      { type: 'WelcomeBanner', id: 'welcome', props: { name: user.name, role: user.role?.name, isSystem: user.role?.isSystem } },
      { type: 'StatsGrid', id: 'stats', props: { stats: capabilities.map(c => ({ resource: c.resource, actions: c.actions })) } },
      { type: 'CapabilityMatrix', id: 'matrix', props: { capabilities } },
    ]});

    if (can('users', 'read')) {
      navigation.push({ id: 'users', label: 'Users', icon: 'Users', page: 'users' });
      pages.push({ id: 'users', title: 'User Management', icon: 'Users', components: [
        { type: 'PageHeader', id: 'users-header', props: { title: 'Users', actions: can('users', 'create') ? [{ label: 'Add User', action: 'CREATE_USER' }] : [] } },
        { type: 'DataTable', id: 'users-table', props: { endpoint: '/api/users', columns: ['name', 'email', 'role', 'status', 'createdAt'], actions: [...(can('users', 'update') ? [{ label: 'Edit', action: 'EDIT_USER' }] : []), ...(can('users', 'delete') ? [{ label: 'Delete', action: 'DELETE_USER' }] : [])] } },
      ]});
    }
    if (can('roles', 'read')) {
      navigation.push({ id: 'roles', label: 'Roles & Permissions', icon: 'Shield', page: 'roles' });
      pages.push({ id: 'roles', title: 'Roles & Permissions', icon: 'Shield', components: [
        { type: 'PageHeader', id: 'roles-header', props: { title: 'Roles & Permissions', actions: can('roles', 'create') ? [{ label: 'Create Role', action: 'CREATE_ROLE' }] : [] } },
        { type: 'RoleTree', id: 'role-tree', props: { endpoint: '/api/roles/tree', canCreate: can('roles', 'create'), canEdit: can('roles', 'update'), canDelete: can('roles', 'delete') } },
      ]});
    }
    if (can('posts', 'read')) {
      navigation.push({ id: 'posts', label: 'Content', icon: 'FileText', page: 'posts' });
      pages.push({ id: 'posts', title: 'Content', icon: 'FileText', components: [
        { type: 'PageHeader', id: 'posts-header', props: { title: 'Content', actions: can('posts', 'create') ? [{ label: 'New Post', action: 'CREATE_POST' }] : [] } },
        { type: 'KanbanBoard', id: 'posts-kanban', props: { columns: ['Draft', 'Review', 'Published'], canEdit: can('posts', 'update'), canDelete: can('posts', 'delete') } },
      ]});
    }
    if (can('analytics', 'read')) {
      navigation.push({ id: 'analytics', label: 'Analytics', icon: 'BarChart2', page: 'analytics' });
      pages.push({ id: 'analytics', title: 'Analytics', icon: 'BarChart2', components: [
        { type: 'ChartGrid', id: 'charts', props: { charts: [{ type: 'line', title: 'User Activity' }, { type: 'bar', title: 'Role Distribution' }, { type: 'pie', title: 'Permission Coverage' }] } },
      ]});
    }
    if (can('settings', 'read')) {
      navigation.push({ id: 'settings', label: 'Settings', icon: 'Settings', page: 'settings' });
      pages.push({ id: 'settings', title: 'Settings', icon: 'Settings', components: [
        { type: 'SettingsForm', id: 'settings-form', props: { readOnly: !can('settings', 'update'), sections: [{ id: 'general', label: 'General', fields: ['siteName', 'timezone', 'language'] }, { id: 'security', label: 'Security', fields: ['sessionTimeout', 'mfaRequired'] }, { id: 'notifications', label: 'Notifications', fields: ['emailAlerts', 'slackWebhook'] }] } },
      ]});
    }

    return {
      user: { id: user.id, name: user.name, email: user.email, role: { id: user.role?.id, name: user.role?.name, level: user.role?.level, isSystem: user.role?.isSystem } },
      navigation,
      pages,
      capabilities,
    };
  }
}
