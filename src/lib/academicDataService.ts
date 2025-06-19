import { supabase } from './supabase';

export interface University {
  id: string;
  name: string;
  location: string;
}

export interface Department {
  id: string;
  university_id: string;
  name: string;
  code: string;
}

export interface Course {
  id: string;
  department_id: string;
  name: string;
  code: string;
  year: number;
  semester: number;
}

export const academicDataService = {
  async getUniversities(): Promise<University[]> {
    const { data, error } = await supabase
      .from('universities')
      .select('*')
      .order('name');
      
    if (error) {
      console.error('Error fetching universities:', error);
      throw error;
    }
    
    return data || [];
  },
  
  async getDepartments(universityId?: string): Promise<Department[]> {
    let query = supabase
      .from('departments')
      .select('*')
      .order('name');
      
    if (universityId) {
      query = query.eq('university_id', universityId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching departments:', error);
      throw error;
    }
    
    return data || [];
  },
  
  async getCourses(departmentId?: string, year?: number): Promise<Course[]> {
    let query = supabase
      .from('courses')
      .select('*')
      .order('name');
      
    if (departmentId) {
      query = query.eq('department_id', departmentId);
    }
    
    if (year) {
      query = query.eq('year', year);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
    
    return data || [];
  }
}; 