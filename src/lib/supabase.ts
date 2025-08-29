import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Types
export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  user_type: 'teacher' | 'student' | 'admin';
  phone?: string;
  bio?: string;
  experience_years: number;
  hourly_rate: number;
  is_verified: boolean;
  rating: number;
  total_students: number;
  total_lessons: number;
  created_at: string;
  updated_at: string;
}

export interface Subject {
  id: string;
  name: string;
  description?: string;
  icon_name?: string;
  created_at: string;
}

export interface Lesson {
  id: string;
  teacher_id: string;
  subject_id: string;
  title: string;
  description: string;
  duration_minutes: number;
  price: number;
  max_students: number;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  teacher?: Profile;
  subject?: Subject;
}

export interface Booking {
  id: string;
  lesson_id: string;
  student_id: string;
  teacher_id: string;
  scheduled_at: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  meeting_link?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  lesson?: Lesson;
  student?: Profile;
  teacher?: Profile;
}

export interface Transaction {
  id: string;
  booking_id: string;
  student_id: string;
  teacher_id: string;
  total_amount: number;
  platform_commission: number;
  teacher_amount: number;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method?: string;
  transaction_ref?: string;
  created_at: string;
}

export interface Review {
  id: string;
  booking_id: string;
  student_id: string;
  teacher_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  student?: Profile;
}
