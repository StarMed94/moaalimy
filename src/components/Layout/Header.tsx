import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, 
  LogOut, 
  BookOpen, 
  Calendar, 
  DollarSign,
  Menu,
  X,
  Home
} from 'lucide-react';
import { useState } from 'react';

const Header: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getNavigationItems = () => {
    if (!profile) return [];

    const commonItems = [
      { icon: Home, label: 'الرئيسية', path: '/' },
    ];

    if (profile.user_type === 'teacher') {
      return [
        ...commonItems,
        { icon: BookOpen, label: 'دروسي', path: '/teacher/lessons' },
        { icon: Calendar, label: 'الحجوزات', path: '/teacher/bookings' },
        { icon: DollarSign, label: 'الأرباح', path: '/teacher/earnings' },
      ];
    }

    if (profile.user_type === 'student') {
      return [
        ...commonItems,
        { icon: BookOpen, label: 'البحث عن دروس', path: '/lessons' },
        { icon: Calendar, label: 'حجوزاتي', path: '/student/bookings' },
        { icon: User, label: 'المعلمين', path: '/teachers' },
      ];
    }

    if (profile.user_type === 'admin') {
      return [
        ...commonItems,
        { icon: User, label: 'إدارة المستخدمين', path: '/admin/users' },
        { icon: BookOpen, label: 'إدارة الدروس', path: '/admin/lessons' },
        { icon: DollarSign, label: 'التقارير المالية', path: '/admin/reports' },
      ];
    }

    return commonItems;
  };

  const navigationItems = getNavigationItems();

  return (
    <header className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 space-x-reverse">
            <div className="bg-blue-600 text-white p-2 rounded-lg">
              <BookOpen className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold text-gray-900">منصة التعليم</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8 space-x-reverse">
            {navigationItems.map(({ icon: Icon, label, path }) => (
              <Link
                key={path}
                to={path}
                className="flex items-center space-x-2 space-x-reverse px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </Link>
            ))}
          </nav>

          {/* User Menu */}
          {user ? (
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-gray-900">{profile?.full_name}</p>
                <p className="text-xs text-gray-500 capitalize">{profile?.user_type}</p>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Link
                  to="/profile"
                  className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                >
                  <User className="h-5 w-5" />
                </Link>
                <button
                  onClick={handleSignOut}
                  className="p-2 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-4 space-x-reverse">
              <Link
                to="/login"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                تسجيل الدخول
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium"
              >
                إنشاء حساب
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            {navigationItems.map(({ icon: Icon, label, path }) => (
              <Link
                key={path}
                to={path}
                className="flex items-center space-x-3 space-x-reverse px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                onClick={() => setIsMenuOpen(false)}
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </Link>
            ))}
            {user && (
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-3 space-x-reverse w-full px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-5 w-5" />
                <span>تسجيل الخروج</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
