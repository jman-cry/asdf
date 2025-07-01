import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Home, ArrowLeft, BookOpen, Users, Video, FolderOpen, HelpCircle } from 'lucide-react';

const NotFound: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // In a real app, you'd implement actual search functionality
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const quickLinks = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      description: 'Return to your main dashboard'
    },
    {
      name: 'Courses',
      href: '/courses',
      icon: BookOpen,
      description: 'Browse available courses'
    },
    {
      name: 'Projects',
      href: '/projects',
      icon: FolderOpen,
      description: 'View your projects'
    },
    {
      name: 'Friends',
      href: '/friends',
      icon: Users,
      description: 'Manage your connections'
    },
    {
      name: 'Video Calls',
      href: '/video-calls',
      icon: Video,
      description: 'Schedule or join calls'
    },
    {
      name: 'Help Center',
      href: '/help',
      icon: HelpCircle,
      description: 'Get support and answers'
    }
  ];

  const popularPages = [
    { name: 'Login', href: '/login' },
    { name: 'Register', href: '/register' },
    { name: 'Profile Settings', href: '/profile' },
    { name: 'Course Catalog', href: '/courses' },
    { name: 'Project Gallery', href: '/projects' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center px-4">
      <div className="max-w-4xl w-full text-center">
        {/* 404 Animation */}
        <div className="mb-8">
          <div className="relative inline-block">
            <h1 className="text-9xl font-bold text-primary-200 select-none">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center animate-bounce">
                <Search className="h-12 w-12 text-primary-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-secondary-900 mb-4">
            Oops! Page Not Found
          </h2>
          <p className="text-lg text-secondary-600 mb-6 max-w-2xl mx-auto">
            The page you're looking for seems to have wandered off into the digital void. 
            Don't worry though – we'll help you find your way back to learning!
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-12">
          <form onSubmit={handleSearch} className="max-w-md mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for courses, projects, or help..."
                className="w-full px-4 py-3 pl-12 pr-16 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary-600 text-white px-4 py-1.5 rounded-md hover:bg-primary-700 transition-colors duration-200"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold text-secondary-900 mb-6">
            Quick Navigation
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="bg-white p-6 rounded-xl shadow-sm border border-secondary-200 hover:shadow-md hover:border-primary-300 transition-all duration-200 group"
              >
                <div className="flex items-center mb-3">
                  <div className="bg-primary-100 p-2 rounded-lg group-hover:bg-primary-200 transition-colors duration-200">
                    <link.icon className="h-5 w-5 text-primary-600" />
                  </div>
                  <h4 className="ml-3 font-semibold text-secondary-900 group-hover:text-primary-600 transition-colors duration-200">
                    {link.name}
                  </h4>
                </div>
                <p className="text-sm text-secondary-600 text-left">
                  {link.description}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Popular Pages */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold text-secondary-900 mb-6">
            Popular Pages
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {popularPages.map((page) => (
              <Link
                key={page.name}
                to={page.href}
                className="bg-white px-4 py-2 rounded-full border border-secondary-200 text-secondary-700 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200"
              >
                {page.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center px-6 py-3 bg-secondary-100 text-secondary-700 rounded-lg hover:bg-secondary-200 transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </button>
          
          <Link
            to="/"
            className="flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
          >
            <Home className="h-4 w-4 mr-2" />
            Return Home
          </Link>
        </div>

        {/* Help Text */}
        <div className="mt-12 p-6 bg-primary-50 rounded-xl border border-primary-200">
          <h4 className="font-semibold text-primary-900 mb-2">
            Still can't find what you're looking for?
          </h4>
          <p className="text-primary-700 mb-4">
            Our support team is here to help you navigate the platform and find the resources you need.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="mailto:support@lmsplatform.com"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Contact Support
            </a>
            <span className="hidden sm:inline text-primary-400">•</span>
            <Link
              to="/help"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Browse Help Center
            </Link>
            <span className="hidden sm:inline text-primary-400">•</span>
            <a
              href="/sitemap"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              View Site Map
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;