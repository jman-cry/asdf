import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, FolderOpen, Users, Video, Award, Clock } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const studentStats = [
    {
      name: 'One-to-One Points',
      value: user?.oneToOnePoints || 0,
      icon: Award,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      name: 'Group Points',
      value: user?.groupPoints || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      name: 'Active Courses',
      value: '0', // This would come from API
      icon: BookOpen,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      name: 'Projects',
      value: '0', // This would come from API
      icon: FolderOpen,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  const quickActions = [
    {
      name: 'Browse Courses',
      description: 'Explore available courses',
      href: '/courses',
      icon: BookOpen,
      color: 'bg-primary-600',
    },
    {
      name: 'View Projects',
      description: 'Check your project assignments',
      href: '/projects',
      icon: FolderOpen,
      color: 'bg-green-600',
    },
    {
      name: 'Connect with Friends',
      description: 'Manage your study group',
      href: '/friends',
      icon: Users,
      color: 'bg-blue-600',
    },
    {
      name: 'Video Calls',
      description: 'Schedule or join calls',
      href: '/video-calls',
      icon: Video,
      color: 'bg-purple-600',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          {getWelcomeMessage()}, {user?.username}!
        </h1>
        <p className="text-primary-100 text-lg">
          Welcome to your learning dashboard. Ready to continue your journey?
        </p>
        <div className="mt-4 flex items-center text-primary-200">
          <Clock className="h-4 w-4 mr-2" />
          <span className="text-sm">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
        </div>
      </div>

      {/* Stats Grid - Only for students */}
      {user?.role === 'student' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {studentStats.map((stat) => (
            <div key={stat.name} className="card">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-secondary-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-secondary-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      {user?.role === 'student' && (
        <div>
          <h2 className="text-xl font-semibold text-secondary-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action) => (
              <a
                key={action.name}
                href={action.href}
                className="card hover:shadow-md transition-shadow duration-200 group"
              >
                <div className="flex items-center mb-4">
                  <div className={`p-3 rounded-lg ${action.color} group-hover:scale-110 transition-transform duration-200`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-secondary-900 mb-2">{action.name}</h3>
                <p className="text-secondary-600 text-sm">{action.description}</p>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Admin/Teacher Dashboard */}
      {(user?.role === 'admin' || user?.role === 'teacher') && (
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold text-secondary-900 mb-4">
              {user.role === 'admin' ? 'Admin Panel' : 'Teacher Dashboard'}
            </h2>
            <p className="text-secondary-600 mb-6">
              {user.role === 'admin' 
                ? 'Manage courses, projects, and system settings from here.'
                : 'View your scheduled calls and manage your teaching activities.'
              }
            </p>
            
            {user.role === 'admin' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <a href="/admin/courses" className="btn-primary text-center">
                  Manage Courses
                </a>
                <a href="/admin/projects" className="btn-secondary text-center">
                  Manage Projects
                </a>
              </div>
            )}
            
            {user.role === 'teacher' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <a href="/video-calls" className="btn-primary text-center">
                  View Call Requests
                </a>
                <a href="/profile" className="btn-secondary text-center">
                  Update Profile
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="card">
        <h2 className="text-xl font-semibold text-secondary-900 mb-4">Recent Activity</h2>
        <div className="text-center py-8">
          <p className="text-secondary-500">No recent activity to display</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;