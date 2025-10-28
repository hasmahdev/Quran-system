import { getSupabase } from './supabaseClient';

// User Functions
export const getUsersByRole = async (role: string) => {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('users').select('*').eq('role', role);
  if (error) throw error;
  return data;
};

export const createUser = async (userData: any) => {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('users').insert([userData]).select();
  if (error) throw error;
  return data;
};

export const updateUser = async (userId: string, updates: any) => {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('users').update(updates).eq('id', userId).select();
  if (error) throw error;
  return data;
};

export const deleteUser = async (userId: string) => {
  const supabase = getSupabase();
  const { error } = await supabase.from('users').delete().eq('id', userId);
  if (error) throw error;
  return true;
};

// Progress Functions
export const getProgressForClass = async (classId: string) => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('progress')
    .select('*, student:users(full_name)')
    .eq('class_member_class_id', classId);
  if (error) throw error;
  return data;
};

export const updateStudentProgress = async (progressId: string, updates: any) => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('progress')
    .update(updates)
    .eq('id', progressId)
    .select();
  if (error) throw error;
  return data;
};

// Class Member Functions
export const getStudentsInClass = async (classId: string) => {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('class_members').select('student:users(*)').eq('class_id', classId);
  if (error) throw error;
  return data.map(item => item.student);
};

export const addStudentToClass = async (classId: string, studentId: string) => {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('class_members').insert([{ class_id: classId, student_id: studentId }]);
  if (error) throw error;
  return data;
};

export const removeStudentFromClass = async (classId: string, studentId: string) => {
  const supabase = getSupabase();
  const { error } = await supabase.from('class_members').delete().eq('class_id', classId).eq('student_id', studentId);
  if (error) throw error;
  return true;
};

// Class Functions
export const getClasses = async () => {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('classes').select('*, teacher:users(full_name)');
  if (error) throw error;
  return data;
};

export const getClassesByTeacher = async (teacherId: string) => {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('classes').select('*').eq('teacher_id', teacherId);
  if (error) throw error;
  return data;
};

export const createClass = async (classData: any) => {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('classes').insert([classData]).select();
  if (error) throw error;
  return data;
};

export const updateClass = async (classId: string, updates: any) => {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('classes').update(updates).eq('id', classId).select();
  if (error) throw error;
  return data;
};

export const deleteClass = async (classId: string) => {
  const supabase = getSupabase();
  const { error } = await supabase.from('classes').delete().eq('id', classId);
  if (error) throw error;
  return true;
};
