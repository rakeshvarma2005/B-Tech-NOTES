// Repair notes script - run with: node repair-notes.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Define curriculum structure from curriculum.ts
const curriculum = [
  {
    id: "year-1",
    name: "I Year",
    semesters: [
      {
        id: "year-1-sem-1",
        name: "Semester I",
        subjects: [
          { id: "matrices-calculus", name: "Matrices and Calculus", code: "MC" },
          { id: "engineering-chemistry", name: "Engineering Chemistry", code: "EC" },
          { id: "programming-problem-solving", name: "Programming for Problem Solving", code: "PPS" },
        ]
      },
      {
        id: "year-1-sem-2",
        name: "Semester II",
        subjects: [
          { id: "ode-vector-calculus", name: "Ordinary Differential Equations and Vector Calculus", code: "ODEVC" },
          { id: "applied-physics", name: "Applied Physics", code: "AP" },
        ]
      }
    ]
  },
  {
    id: "year-2",
    name: "II Year",
    semesters: [
      {
        id: "year-2-sem-1",
        name: "Semester I",
        subjects: [
          { id: "digital-electronics", name: "Digital Electronics", code: "DE" },
          { id: "data-structures", name: "Data Structures", code: "DS" },
        ]
      },
      {
        id: "year-2-sem-2",
        name: "Semester II",
        subjects: [
          { id: "discrete-mathematics", name: "Discrete Mathematics", code: "DM" },
          { id: "business-economics-financial-analysis", name: "Business Economics & Financial Analysis", code: "BEFA" },
        ]
      }
    ]
  }
];

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Make sure .env file exists with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Main repair function
async function repairNotes() {
  try {
    console.log('Starting note repair process...');
    
    // 1. Get all notes
    const { data: notes, error } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      throw new Error(`Error fetching notes: ${error.message}`);
    }
    
    console.log(`Found ${notes.length} notes to check`);
    
    const repairPromises = notes.map(async (note) => {
      const needsRepair = !note.year_id || !note.semester_id || !note.subject_id;
      
      if (needsRepair) {
        console.log(`Repairing note: ${note.id} - ${note.title}`);
        
        // Try to extract year, semester and subject from title
        let matchedYear = null;
        let matchedSemester = null;
        let matchedSubject = null;
        
        // Special case for Discrete Mathematics
        if (note.title && (note.title.includes('Discrete Mathematics') || note.title.includes('DM'))) {
          matchedYear = curriculum.find(y => y.id === 'year-2');
          matchedSemester = matchedYear?.semesters.find(s => s.id === 'year-2-sem-2');
          matchedSubject = matchedSemester?.subjects.find(s => s.id === 'discrete-mathematics');
          
          if (matchedYear && matchedSemester && matchedSubject) {
            console.log(`Matched Discrete Mathematics: year_id=${matchedYear.id}, semester_id=${matchedSemester.id}, subject_id=${matchedSubject.id}`);
            
            const { error: updateError } = await supabase
              .from('notes')
              .update({
                year_id: matchedYear.id,
                semester_id: matchedSemester.id,
                subject_id: matchedSubject.id
              })
              .eq('id', note.id);
            
            if (updateError) {
              console.error(`Error updating note ${note.id}:`, updateError);
              return false;
            }
            
            console.log(`Successfully repaired note ${note.id}`);
            return true;
          }
        }
        
        // General matching logic for other notes
        for (const year of curriculum) {
          if (note.title && note.title.includes(year.name)) {
            matchedYear = year;
            
            for (const semester of year.semesters) {
              if (note.title && note.title.includes(semester.name)) {
                matchedSemester = semester;
                
                for (const subject of semester.subjects) {
                  if (note.title && (note.title.includes(subject.name) || note.title.includes(subject.code))) {
                    matchedSubject = subject;
                    break;
                  }
                }
                
                break;
              }
            }
            
            break;
          }
        }
        
        if (matchedYear || matchedSemester || matchedSubject) {
          const updates = {
            ...(matchedYear && { year_id: matchedYear.id }),
            ...(matchedSemester && { semester_id: matchedSemester.id }),
            ...(matchedSubject && { subject_id: matchedSubject.id })
          };
          
          console.log(`Updating note ${note.id} with:`, updates);
          
          const { error: updateError } = await supabase
            .from('notes')
            .update(updates)
            .eq('id', note.id);
          
          if (updateError) {
            console.error(`Error updating note ${note.id}:`, updateError);
            return false;
          }
          
          console.log(`Successfully repaired note ${note.id}`);
          return true;
        }
        
        console.log(`Could not find matches for note ${note.id} - ${note.title}`);
        return false;
      }
      
      return null; // Note doesn't need repair
    });
    
    const results = await Promise.all(repairPromises);
    const repairedCount = results.filter(r => r === true).length;
    const failedCount = results.filter(r => r === false).length;
    const skippedCount = results.filter(r => r === null).length;
    
    console.log(`Repair completed!`);
    console.log(`- Repaired: ${repairedCount}`);
    console.log(`- Failed: ${failedCount}`);
    console.log(`- Skipped (no repair needed): ${skippedCount}`);
    
  } catch (error) {
    console.error('Error during repair:', error);
  }
}

// Run the repair function
repairNotes()
  .then(() => console.log('Done!'))
  .catch(err => console.error(err)); 