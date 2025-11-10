import { useState, useEffect } from 'react';
import { getClasses, getUsersByRole } from '../lib/api';

type Class = { id: string; name: string; teacher_id: string; };
type Teacher = { id: string; username: string; };

export const useClasses = () => {
  const [items, setItems] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [filteredItems, setFilteredItems] = useState<Class[]>([]);

  const load = async () => {
    setLoading(true);
    try {
      const classData = await getClasses();
      const teacherData = await getUsersByRole('teacher');
      setItems(classData || []);
      setTeachers(teacherData || []);
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    let filtered = items;
    if (selectedTeacher) {
      filtered = filtered.filter((item) => item.teacher_id === selectedTeacher.id);
    }
    if (searchQuery) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredItems(filtered);
  }, [selectedTeacher, searchQuery, items]);

  return {
    items,
    teachers,
    loading,
    error,
    setError,
    searchQuery,
    setSearchQuery,
    selectedTeacher,
    setSelectedTeacher,
    filteredItems,
    load,
  };
};
