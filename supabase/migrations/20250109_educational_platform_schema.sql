/*
# Educational Platform Database Schema
Complete database setup for the educational platform connecting teachers with students

## Query Description: 
This migration creates the complete database structure for the educational platform including user profiles, subjects, lessons, bookings, transactions, and reviews. This is a safe initial setup that will not affect any existing data as we're creating new tables from scratch.

## Metadata:
- Schema-Category: "Safe"
- Impact-Level: "Medium"  
- Requires-Backup: false
- Reversible: true

## Structure Details:
- profiles: User profiles (teachers, students, admin)
- subjects: Academic subjects/specializations
- lessons: Available lessons/courses
- bookings: Lesson bookings and scheduling
- transactions: Payment tracking with 10% platform commission
- reviews: Student reviews and ratings

## Security Implications:
- RLS Status: Enabled
- Policy Changes: Yes
- Auth Requirements: Integration with Supabase auth.users

## Performance Impact:
- Indexes: Added for optimal query performance
- Triggers: Added for automatic profile creation
- Estimated Impact: Minimal performance impact for new installation
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_type AS ENUM ('teacher', 'student', 'admin');
CREATE TYPE difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  user_type user_type NOT NULL DEFAULT 'student',
  phone TEXT,
  bio TEXT,
  experience_years INTEGER DEFAULT 0,
  hourly_rate DECIMAL(10,2) DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  rating DECIMAL(3,2) DEFAULT 0,
  total_students INTEGER DEFAULT 0,
  total_lessons INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  price DECIMAL(10,2) NOT NULL,
  max_students INTEGER DEFAULT 1,
  difficulty_level difficulty_level DEFAULT 'beginner',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status booking_status DEFAULT 'pending',
  meeting_link TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  platform_commission DECIMAL(10,2) NOT NULL,
  teacher_amount DECIMAL(10,2) NOT NULL,
  payment_status payment_status DEFAULT 'pending',
  payment_method TEXT,
  transaction_ref TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_is_verified ON profiles(is_verified);
CREATE INDEX IF NOT EXISTS idx_profiles_rating ON profiles(rating);
CREATE INDEX IF NOT EXISTS idx_lessons_teacher_id ON lessons(teacher_id);
CREATE INDEX IF NOT EXISTS idx_lessons_subject_id ON lessons(subject_id);
CREATE INDEX IF NOT EXISTS idx_lessons_is_active ON lessons(is_active);
CREATE INDEX IF NOT EXISTS idx_bookings_student_id ON bookings(student_id);
CREATE INDEX IF NOT EXISTS idx_bookings_teacher_id ON bookings(teacher_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_scheduled_at ON bookings(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_transactions_student_id ON transactions(student_id);
CREATE INDEX IF NOT EXISTS idx_transactions_teacher_id ON transactions(teacher_id);
CREATE INDEX IF NOT EXISTS idx_transactions_payment_status ON transactions(payment_status);
CREATE INDEX IF NOT EXISTS idx_reviews_teacher_id ON reviews(teacher_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all verified teacher profiles" ON profiles
  FOR SELECT USING (user_type = 'teacher' AND is_verified = true);

CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- RLS Policies for subjects
CREATE POLICY "Anyone can view subjects" ON subjects FOR SELECT USING (true);

CREATE POLICY "Admins can insert subjects" ON subjects
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

CREATE POLICY "Admins can update subjects" ON subjects
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- RLS Policies for lessons
CREATE POLICY "Anyone can view active lessons" ON lessons
  FOR SELECT USING (is_active = true);

CREATE POLICY "Teachers can view their own lessons" ON lessons
  FOR SELECT USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can insert their own lessons" ON lessons
  FOR INSERT WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Teachers can update their own lessons" ON lessons
  FOR UPDATE USING (teacher_id = auth.uid());

CREATE POLICY "Admins can view all lessons" ON lessons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- RLS Policies for bookings
CREATE POLICY "Students can view their own bookings" ON bookings
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Teachers can view their bookings" ON bookings
  FOR SELECT USING (teacher_id = auth.uid());

CREATE POLICY "Students can insert their own bookings" ON bookings
  FOR INSERT WITH CHECK (student_id = auth.uid());

CREATE POLICY "Teachers can update their bookings status" ON bookings
  FOR UPDATE USING (teacher_id = auth.uid());

CREATE POLICY "Students can update their bookings" ON bookings
  FOR UPDATE USING (student_id = auth.uid());

CREATE POLICY "Admins can view all bookings" ON bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- RLS Policies for transactions
CREATE POLICY "Students can view their transactions" ON transactions
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Teachers can view their transactions" ON transactions
  FOR SELECT USING (teacher_id = auth.uid());

CREATE POLICY "System can insert transactions" ON transactions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all transactions" ON transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- RLS Policies for reviews
CREATE POLICY "Anyone can view reviews" ON reviews FOR SELECT USING (true);

CREATE POLICY "Students can insert reviews for their bookings" ON reviews
  FOR INSERT WITH CHECK (
    student_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM bookings 
      WHERE id = booking_id AND student_id = auth.uid() AND status = 'completed'
    )
  );

CREATE POLICY "Students can update their own reviews" ON reviews
  FOR UPDATE USING (student_id = auth.uid());

-- Function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, user_type)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', 'مستخدم جديد'),
    COALESCE(new.raw_user_meta_data->>'user_type', 'student')::user_type
  );
  RETURN new;
END;
$$ language plpgsql security definer;

-- Trigger to automatically create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language plpgsql;

-- Triggers for updated_at
CREATE TRIGGER handle_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_lessons_updated_at BEFORE UPDATE ON lessons
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Function to calculate platform commission (10%)
CREATE OR REPLACE FUNCTION public.calculate_transaction_amounts()
RETURNS trigger AS $$
BEGIN
  NEW.platform_commission = NEW.total_amount * 0.10;
  NEW.teacher_amount = NEW.total_amount - NEW.platform_commission;
  RETURN NEW;
END;
$$ language plpgsql;

-- Trigger to auto-calculate commission
CREATE TRIGGER calculate_transaction_amounts_trigger
  BEFORE INSERT OR UPDATE ON transactions
  FOR EACH ROW EXECUTE PROCEDURE public.calculate_transaction_amounts();

-- Function to update teacher rating and stats
CREATE OR REPLACE FUNCTION public.update_teacher_stats()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Update teacher rating
    UPDATE profiles SET
      rating = (
        SELECT COALESCE(AVG(rating::decimal), 0)
        FROM reviews
        WHERE teacher_id = NEW.teacher_id
      ),
      updated_at = timezone('utc'::text, now())
    WHERE id = NEW.teacher_id;
    
    RETURN NEW;
  END IF;
  
  IF TG_OP = 'UPDATE' THEN
    -- Update teacher rating
    UPDATE profiles SET
      rating = (
        SELECT COALESCE(AVG(rating::decimal), 0)
        FROM reviews
        WHERE teacher_id = NEW.teacher_id
      ),
      updated_at = timezone('utc'::text, now())
    WHERE id = NEW.teacher_id;
    
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$ language plpgsql;

-- Trigger to update teacher stats when review is added/updated
CREATE TRIGGER update_teacher_stats_trigger
  AFTER INSERT OR UPDATE ON reviews
  FOR EACH ROW EXECUTE PROCEDURE public.update_teacher_stats();

-- Insert sample subjects
INSERT INTO subjects (name, description, icon_name) VALUES
('الرياضيات', 'دروس في الجبر والهندسة والحساب', 'calculator'),
('اللغة العربية', 'قواعد اللغة والأدب والبلاغة', 'book-open'),
('اللغة الإنجليزية', 'محادثة وقواعد ومفردات', 'message-circle'),
('الفيزياء', 'الميكانيكا والكهرباء والبصريات', 'zap'),
('الكيمياء', 'الكيمياء العضوية وغير العضوية', 'flask'),
('الأحياء', 'علم الخلايا والوراثة والتطور', 'leaf'),
('التاريخ', 'التاريخ الإسلامي والعالمي', 'clock'),
('الجغرافيا', 'الجغرافيا الطبيعية والبشرية', 'map'),
('الحاسوب', 'البرمجة وتطبيقات الحاسوب', 'monitor'),
('الاقتصاد', 'الاقتصاد الجزئي والكلي', 'trending-up')
ON CONFLICT DO NOTHING;

-- Create admin user (this will need to be updated with actual admin email)
-- Note: The admin user should be created through the authentication system first
-- Then their profile will be automatically created and can be updated to admin type

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
