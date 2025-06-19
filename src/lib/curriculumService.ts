import { supabase } from './supabase';

export interface CurriculumItem {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  order_index: number;
  parent_id?: string;
  type: 'module' | 'topic' | 'subtopic';
}

export const curriculumService = {
  async getCurriculumForCourse(courseId: string): Promise<CurriculumItem[]> {
    const { data, error } = await supabase
      .from('curriculum_items')
      .select('*')
      .eq('course_id', courseId)
      .order('order_index');
      
    if (error) {
      console.error('Error fetching curriculum:', error);
      throw error;
    }
    
    return data || [];
  },
  
  async getModules(courseId: string): Promise<CurriculumItem[]> {
    const { data, error } = await supabase
      .from('curriculum_items')
      .select('*')
      .eq('course_id', courseId)
      .eq('type', 'module')
      .order('order_index');
      
    if (error) {
      console.error('Error fetching modules:', error);
      throw error;
    }
    
    return data || [];
  },
  
  async getTopicsForModule(moduleId: string): Promise<CurriculumItem[]> {
    const { data, error } = await supabase
      .from('curriculum_items')
      .select('*')
      .eq('parent_id', moduleId)
      .eq('type', 'topic')
      .order('order_index');
      
    if (error) {
      console.error('Error fetching topics:', error);
      throw error;
    }
    
    return data || [];
  },
  
  async getSubtopicsForTopic(topicId: string): Promise<CurriculumItem[]> {
    const { data, error } = await supabase
      .from('curriculum_items')
      .select('*')
      .eq('parent_id', topicId)
      .eq('type', 'subtopic')
      .order('order_index');
      
    if (error) {
      console.error('Error fetching subtopics:', error);
      throw error;
    }
    
    return data || [];
  }
}; 