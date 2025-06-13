
export interface Subject {
  code: string;
  name: string;
  description: string;
  credits: number;
  type: 'core' | 'elective' | 'lab';
}

export interface Semester {
  number: number;
  subjects: Subject[];
}

export interface AcademicYear {
  year: number;
  semesters: Semester[];
}

export interface Branch {
  code: string;
  name: string;
  fullName: string;
  years: AcademicYear[];
}

export const branches: Branch[] = [
  {
    code: "CSE",
    name: "Computer Science",
    fullName: "Computer Science & Engineering",
    years: [
      {
        year: 1,
        semesters: [
          {
            number: 1,
            subjects: [
              { code: "M1", name: "Matrices and Calculus", description: "Mathematics - I", credits: 4, type: "core" },
              { code: "CHEM", name: "Engineering Chemistry", description: "Basic Chemistry Concepts", credits: 4, type: "core" },
              { code: "PPS", name: "Programming for Problem Solving", description: "C Programming", credits: 3, type: "core" },
              { code: "BEE", name: "Basic Electrical Engineering", description: "Electrical Fundamentals", credits: 3, type: "core" },
              { code: "CAEG", name: "Computer Aided Engineering Graphics", description: "Engineering Drawing", credits: 2, type: "core" },
              { code: "ECSE", name: "Elements of Computer Science", description: "CS Fundamentals", credits: 2, type: "core" }
            ]
          },
          {
            number: 2,
            subjects: [
              { code: "M2", name: "Differential Equations", description: "Mathematics - II", credits: 4, type: "core" },
              { code: "PHYS", name: "Engineering Physics", description: "Physics Fundamentals", credits: 4, type: "core" },
              { code: "DS", name: "Data Structures", description: "Data Structures in C", credits: 3, type: "core" },
              { code: "BME", name: "Basic Mechanical Engineering", description: "Mechanical Fundamentals", credits: 3, type: "core" },
              { code: "EVS", name: "Environmental Science", description: "Environmental Studies", credits: 2, type: "core" }
            ]
          }
        ]
      },
      {
        year: 2,
        semesters: [
          {
            number: 3,
            subjects: [
              { code: "M3", name: "Linear Algebra", description: "Mathematics - III", credits: 4, type: "core" },
              { code: "OOPS", name: "Object Oriented Programming", description: "Java/C++ Programming", credits: 4, type: "core" },
              { code: "DBMS", name: "Database Management Systems", description: "Database Concepts", credits: 3, type: "core" },
              { code: "COA", name: "Computer Organization", description: "Computer Architecture", credits: 3, type: "core" },
              { code: "DSA", name: "Data Structures & Algorithms", description: "Advanced DS & Algorithms", credits: 3, type: "core" }
            ]
          },
          {
            number: 4,
            subjects: [
              { code: "M4", name: "Probability & Statistics", description: "Mathematics - IV", credits: 4, type: "core" },
              { code: "OS", name: "Operating Systems", description: "OS Concepts", credits: 4, type: "core" },
              { code: "CN", name: "Computer Networks", description: "Network Fundamentals", credits: 3, type: "core" },
              { code: "SE", name: "Software Engineering", description: "Software Development", credits: 3, type: "core" },
              { code: "TOC", name: "Theory of Computation", description: "Formal Languages", credits: 3, type: "core" }
            ]
          }
        ]
      },
      {
        year: 3,
        semesters: [
          {
            number: 5,
            subjects: [
              { code: "AI", name: "Artificial Intelligence", description: "AI Fundamentals", credits: 4, type: "core" },
              { code: "ML", name: "Machine Learning", description: "ML Algorithms", credits: 4, type: "core" },
              { code: "WEB", name: "Web Technologies", description: "Full Stack Development", credits: 3, type: "core" },
              { code: "CYBER", name: "Cyber Security", description: "Information Security", credits: 3, type: "core" },
              { code: "ELEC1", name: "Professional Elective - I", description: "Choose from available options", credits: 3, type: "elective" }
            ]
          },
          {
            number: 6,
            subjects: [
              { code: "DL", name: "Deep Learning", description: "Neural Networks", credits: 4, type: "core" },
              { code: "CLOUD", name: "Cloud Computing", description: "Cloud Technologies", credits: 4, type: "core" },
              { code: "MOBILE", name: "Mobile App Development", description: "Android/iOS Development", credits: 3, type: "core" },
              { code: "BLOCKCHAIN", name: "Blockchain Technology", description: "Distributed Systems", credits: 3, type: "core" },
              { code: "ELEC2", name: "Professional Elective - II", description: "Choose from available options", credits: 3, type: "elective" }
            ]
          }
        ]
      },
      {
        year: 4,
        semesters: [
          {
            number: 7,
            subjects: [
              { code: "PROJ1", name: "Major Project - I", description: "Capstone Project Part 1", credits: 6, type: "core" },
              { code: "INTERN", name: "Industrial Training", description: "6-month Internship", credits: 4, type: "core" },
              { code: "ELEC3", name: "Professional Elective - III", description: "Advanced Elective", credits: 3, type: "elective" },
              { code: "SEMINAR", name: "Technical Seminar", description: "Research Presentation", credits: 2, type: "core" }
            ]
          },
          {
            number: 8,
            subjects: [
              { code: "PROJ2", name: "Major Project - II", description: "Capstone Project Part 2", credits: 8, type: "core" },
              { code: "ETHICS", name: "Professional Ethics", description: "Engineering Ethics", credits: 2, type: "core" },
              { code: "ELEC4", name: "Professional Elective - IV", description: "Advanced Elective", credits: 3, type: "elective" },
              { code: "VIVA", name: "Comprehensive Viva", description: "Final Assessment", credits: 2, type: "core" }
            ]
          }
        ]
      }
    ]
  },
  {
    code: "ECE",
    name: "Electronics",
    fullName: "Electronics & Communication Engineering",
    years: [
      {
        year: 1,
        semesters: [
          {
            number: 1,
            subjects: [
              { code: "M1", name: "Matrices and Calculus", description: "Mathematics - I", credits: 4, type: "core" },
              { code: "CHEM", name: "Engineering Chemistry", description: "Basic Chemistry", credits: 4, type: "core" },
              { code: "PPS", name: "Programming for Problem Solving", description: "C Programming", credits: 3, type: "core" },
              { code: "BEE", name: "Basic Electrical Engineering", description: "Electrical Fundamentals", credits: 3, type: "core" },
              { code: "CAEG", name: "Engineering Graphics", description: "Technical Drawing", credits: 2, type: "core" }
            ]
          },
          {
            number: 2,
            subjects: [
              { code: "M2", name: "Differential Equations", description: "Mathematics - II", credits: 4, type: "core" },
              { code: "PHYS", name: "Engineering Physics", description: "Physics Fundamentals", credits: 4, type: "core" },
              { code: "BME", name: "Basic Mechanical Engineering", description: "Mechanical Fundamentals", credits: 3, type: "core" },
              { code: "ELEC", name: "Basic Electronics", description: "Electronics Fundamentals", credits: 3, type: "core" }
            ]
          }
        ]
      }
      // ... more years would follow similar pattern
    ]
  },
  {
    code: "EEE",
    name: "Electrical",
    fullName: "Electrical & Electronics Engineering",
    years: [
      // Similar structure for EEE
      {
        year: 1,
        semesters: [
          {
            number: 1,
            subjects: [
              { code: "M1", name: "Matrices and Calculus", description: "Mathematics - I", credits: 4, type: "core" },
              { code: "CHEM", name: "Engineering Chemistry", description: "Basic Chemistry", credits: 4, type: "core" },
              { code: "PPS", name: "Programming for Problem Solving", description: "C Programming", credits: 3, type: "core" },
              { code: "BEE", name: "Basic Electrical Engineering", description: "Electrical Fundamentals", credits: 3, type: "core" }
            ]
          }
        ]
      }
    ]
  },
  {
    code: "MECH",
    name: "Mechanical",
    fullName: "Mechanical Engineering",
    years: [
      {
        year: 1,
        semesters: [
          {
            number: 1,
            subjects: [
              { code: "M1", name: "Matrices and Calculus", description: "Mathematics - I", credits: 4, type: "core" },
              { code: "CHEM", name: "Engineering Chemistry", description: "Basic Chemistry", credits: 4, type: "core" },
              { code: "PPS", name: "Programming for Problem Solving", description: "C Programming", credits: 3, type: "core" },
              { code: "BME", name: "Basic Mechanical Engineering", description: "Mechanical Fundamentals", credits: 3, type: "core" }
            ]
          }
        ]
      }
    ]
  },
  {
    code: "CIVIL",
    name: "Civil",
    fullName: "Civil Engineering",
    years: [
      {
        year: 1,
        semesters: [
          {
            number: 1,
            subjects: [
              { code: "M1", name: "Matrices and Calculus", description: "Mathematics - I", credits: 4, type: "core" },
              { code: "CHEM", name: "Engineering Chemistry", description: "Basic Chemistry", credits: 4, type: "core" },
              { code: "PPS", name: "Programming for Problem Solving", description: "C Programming", credits: 3, type: "core" },
              { code: "BCE", name: "Basic Civil Engineering", description: "Civil Engineering Fundamentals", credits: 3, type: "core" }
            ]
          }
        ]
      }
    ]
  }
];

export const getAllYears = () => [1, 2, 3, 4];
export const getAllSemesters = () => [1, 2];
export const getBranchByCode = (code: string) => branches.find(branch => branch.code === code);
