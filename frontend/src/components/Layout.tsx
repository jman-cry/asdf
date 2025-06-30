import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  BookOpen, 
  FolderOpen, 
  Users, 
  Video, 
  User, 
  Settings, 
  LogOut,
  Home,
  Shield
} from 'lucide-react';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, roles: ['admin', 'teacher', 'student'] },
    { name: 'Courses', href: '/courses', icon: BookOpen, roles: ['student'] },
    { name: 'Projects', href: '/projects', icon: FolderOpen, roles: ['student'] },
    { name: 'Friends', href: '/friends', icon: Users, roles: ['student'] },
    { name: 'Video Calls', href: '/video-calls', icon: Video, roles: ['student', 'teacher'] },
    { name: 'Admin Panel', href: '/admin', icon: Shield, roles: ['admin'] },
  ];

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(user?.role || '')
  );

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        <div className="flex h-16 items-center justify-center border-b border-secondary-200">
          <h1 className="text-xl font-bold text-primary-600">LMS Platform</h1>
        </div>
        
        <nav className="mt-8 px-4">
          <ul className="space-y-2">
            {filteredNavigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                      isActive
                        ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                        : 'text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900'
                    }`}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Menu */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-secondary-200">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                <User className="h-4 w-4 text-primary-600" />
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-secondary-900">{user?.username}</p>
              <p className="text-xs text-secondary-500 capitalize">{user?.role}</p>
            </div>
          </div>
          
          <div className="space-y-1">
            <Link
              to="/profile"
              className="flex items-center px-3 py-2 text-sm text-secondary-600 hover:bg-secondary-50 rounded-lg transition-colors duration-200"
            >
              <Settings className="mr-2 h-4 w-4" />
              Profile
            </Link>
            <button
              onClick={logout}
              className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pl-64">
        <main className="py-8 px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;