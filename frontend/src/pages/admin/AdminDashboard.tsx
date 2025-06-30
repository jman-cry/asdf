import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, FolderOpen, Users, BarChart3, Settings } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const adminActions = [
    {
      name: 'Manage Courses',
      description: 'Create, edit, and manage courses and lessons',
      href: '/admin/courses',
      icon: BookOpen,
      color: 'bg-primary-600',
    },
    {
      name: 'Manage Projects',
      description: 'Create and manage project assignments',
      href: '/admin/projects',
      icon: FolderOpen,
      color: 'bg-green-600',
    },
    {
      name: 'User Management',
      description: 'View and manage user accounts',
      href: '/admin/users',
      icon: Users,
      color: 'bg-blue-600',
    },
    {
      name: 'Analytics',
      description: 'View system analytics and reports',
      href: '/admin/analytics',
      icon: BarChart3,
      color: 'bg-purple-600',
    },
  ];

  const stats = [
    { name: 'Total Users', value: '0', change: '+0%' },
    { name: 'Active Courses', value: '0', change: '+0%' },
    { name: 'Total Projects', value: '0', change: '+0%' },
    { name: 'Video Calls Today', value: '0', change: '+0%' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-primary-100 text-lg">
          Manage your LMS platform from this central control panel
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">{stat.name}</p>
                <p className="text-2xl font-bold text-secondary-900">{stat.value}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-green-600">{stat.change}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-secondary-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {adminActions.map((action) => (
            <Link
              key={action.name}
              to={action.href}
              className="card hover:shadow-md transition-shadow duration-200 group"
            >
              <div className="flex items-center mb-4">
                <div className={`p-3 rounded-lg ${action.color} group-hover:scale-110 transition-transform duration-200`}>
                  <action.icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-secondary-900 mb-2">{action.name}</h3>
              <p className="text-secondary-600 text-sm">{action.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h2 className="text-xl font-semibold text-secondary-900 mb-4">Recent Activity</h2>
        <div className="text-center py-8">
          <Settings className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
          <p className="text-secondary-500">No recent activity to display</p>
          <p className="text-sm text-secondary-400 mt-2">
            System activity and logs will appear here
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;