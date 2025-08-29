import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  Star, 
  TrendingUp,
  Search,
  ArrowRight,
  Calendar,
  DollarSign
} from 'lucide-react';
import { supabase, Subject, Profile } from '../../lib/supabase';

const HomePage: React.FC = () => {
  const { user, profile } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topTeachers, setTopTeachers] = useState<Profile[]>([]);
  const [stats, setStats] = useState({
    totalTeachers: 0,
    totalStudents: 0,
    totalLessons: 0,
    totalSubjects: 0
  });

  useEffect(() => {
    fetchSubjects();
    fetchTopTeachers();
    fetchStats();
  }, []);

  const fetchSubjects = async () => {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .limit(8);

    if (error) {
      console.error('Error fetching subjects:', error);
    } else {
      setSubjects(data || []);
    }
  };

  const fetchTopTeachers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_type', 'teacher')
      .eq('is_verified', true)
      .order('rating', { ascending: false })
      .limit(6);

    if (error) {
      console.error('Error fetching teachers:', error);
    } else {
      setTopTeachers(data || []);
    }
  };

  const fetchStats = async () => {
    const [teachersRes, studentsRes, lessonsRes, subjectsRes] = await Promise.all([
      supabase.from('profiles').select('id').eq('user_type', 'teacher'),
      supabase.from('profiles').select('id').eq('user_type', 'student'),
      supabase.from('lessons').select('id').eq('is_active', true),
      supabase.from('subjects').select('id')
    ]);

    setStats({
      totalTeachers: teachersRes.data?.length || 0,
      totalStudents: studentsRes.data?.length || 0,
      totalLessons: lessonsRes.data?.length || 0,
      totalSubjects: subjectsRes.data?.length || 0
    });
  };

  if (!user) {
    return (
      <div className="space-y-16">
        {/* Hero Section */}
        <section className="text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              منصة التعليم الذكية
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              اكتشف أفضل المعلمين في جميع التخصصات واحجز دروساً تفاعلية تناسب مستواك وأهدافك التعليمية
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                ابدأ التعلم الآن
                <ArrowRight className="mr-2 h-5 w-5" />
              </Link>
              <Link
                to="/teachers"
                className="border border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                تصفح المعلمين
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-white py-16 rounded-xl shadow-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600">{stats.totalTeachers}</div>
              <div className="text-gray-600">معلم خبير</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">{stats.totalStudents}</div>
              <div className="text-gray-600">طالب نشط</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">{stats.totalLessons}</div>
              <div className="text-gray-600">درس متاح</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600">{stats.totalSubjects}</div>
              <div className="text-gray-600">تخصص أكاديمي</div>
            </div>
          </div>
        </section>

        {/* Subjects Section */}
        <section>
          <h2 className="text-3xl font-bold text-center mb-12">التخصصات المتاحة</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {subjects.map((subject) => (
              <Link
                key={subject.id}
                to={`/lessons?subject=${subject.id}`}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center group"
              >
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{subject.name}</h3>
                <p className="text-sm text-gray-600">{subject.description}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Top Teachers Section */}
        <section>
          <h2 className="text-3xl font-bold text-center mb-12">أفضل المعلمين</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topTeachers.map((teacher) => (
              <div key={teacher.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center space-x-4 space-x-reverse mb-4">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {teacher.full_name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{teacher.full_name}</h3>
                    <div className="flex items-center space-x-1 space-x-reverse">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600">{teacher.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{teacher.bio}</p>
                <div className="flex justify-between items-center">
                  <span className="text-blue-600 font-semibold">{teacher.hourly_rate} ر.س/ساعة</span>
                  <Link
                    to={`/teacher/${teacher.id}`}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    عرض الملف الشخصي
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  // Dashboard for authenticated users
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          مرحباً {profile?.full_name}
        </h1>
        <p className="text-gray-600">
          {profile?.user_type === 'teacher' && 'لوحة تحكم المعلم'}
          {profile?.user_type === 'student' && 'لوحة تحكم الطالب'}
          {profile?.user_type === 'admin' && 'لوحة تحكم المدير'}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {profile?.user_type === 'teacher' && (
          <>
            <Link
              to="/teacher/lessons"
              className="bg-blue-600 text-white p-6 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <BookOpen className="h-8 w-8 mb-3" />
              <h3 className="font-semibold mb-2">إدارة دروسي</h3>
              <p className="text-blue-100">إنشاء وتعديل الدروس</p>
            </Link>
            <Link
              to="/teacher/bookings"
              className="bg-green-600 text-white p-6 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Calendar className="h-8 w-8 mb-3" />
              <h3 className="font-semibold mb-2">الحجوزات</h3>
              <p className="text-green-100">إدارة مواعيد الدروس</p>
            </Link>
            <Link
              to="/teacher/earnings"
              className="bg-purple-600 text-white p-6 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <DollarSign className="h-8 w-8 mb-3" />
              <h3 className="font-semibold mb-2">الأرباح</h3>
              <p className="text-purple-100">تتبع الدخل والمدفوعات</p>
            </Link>
          </>
        )}

        {profile?.user_type === 'student' && (
          <>
            <Link
              to="/lessons"
              className="bg-blue-600 text-white p-6 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Search className="h-8 w-8 mb-3" />
              <h3 className="font-semibold mb-2">البحث عن دروس</h3>
              <p className="text-blue-100">اكتشف دروس جديدة</p>
            </Link>
            <Link
              to="/student/bookings"
              className="bg-green-600 text-white p-6 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Calendar className="h-8 w-8 mb-3" />
              <h3 className="font-semibold mb-2">حجوزاتي</h3>
              <p className="text-green-100">إدارة دروسي المحجوزة</p>
            </Link>
            <Link
              to="/teachers"
              className="bg-purple-600 text-white p-6 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Users className="h-8 w-8 mb-3" />
              <h3 className="font-semibold mb-2">المعلمين</h3>
              <p className="text-purple-100">تصفح المعلمين المتاحين</p>
            </Link>
          </>
        )}

        {profile?.user_type === 'admin' && (
          <>
            <Link
              to="/admin/users"
              className="bg-blue-600 text-white p-6 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Users className="h-8 w-8 mb-3" />
              <h3 className="font-semibold mb-2">إدارة المستخدمين</h3>
              <p className="text-blue-100">المعلمين والطلاب</p>
            </Link>
            <Link
              to="/admin/lessons"
              className="bg-green-600 text-white p-6 rounded-lg hover:bg-green-700 transition-colors"
            >
              <BookOpen className="h-8 w-8 mb-3" />
              <h3 className="font-semibold mb-2">إدارة الدروس</h3>
              <p className="text-green-100">مراقبة جميع الدروس</p>
            </Link>
            <Link
              to="/admin/reports"
              className="bg-purple-600 text-white p-6 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <TrendingUp className="h-8 w-8 mb-3" />
              <h3 className="font-semibold mb-2">التقارير المالية</h3>
              <p className="text-purple-100">إحصائيات ومبيعات</p>
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default HomePage;
