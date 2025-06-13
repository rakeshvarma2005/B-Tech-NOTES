export interface Subject {
  id: string;
  name: string;
  code: string;
  hasLab?: boolean;
  isImportantQuestions?: boolean;
}

export interface Semester {
  id: string;
  name: string;
  subjects: Subject[];
}

export interface Year {
  id: string;
  name: string;
  semesters: Semester[];
}

export const curriculum: Year[] = [
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
          { id: "basic-electrical-engineering", name: "Basic Electrical Engineering", code: "BEE" },
          { id: "computer-aided-engineering-graphics", name: "Computer Aided Engineering Graphics", code: "CAEG" },
          { id: "elements-computer-science", name: "Elements of Computer Science & Engineering", code: "ECSE" },
          { id: "engineering-chemistry-lab", name: "Engineering Chemistry Laboratory", code: "ECL", hasLab: true },
          { id: "programming-problem-solving-lab", name: "Programming for Problem Solving Laboratory", code: "PPSL", hasLab: true },
          { id: "basic-electrical-engineering-lab", name: "Basic Electrical Engineering Laboratory", code: "BEEL", hasLab: true },
        ]
      },
      {
        id: "year-1-sem-2",
        name: "Semester II",
        subjects: [
          { id: "ode-vector-calculus", name: "Ordinary Differential Equations and Vector Calculus", code: "ODEVC" },
          { id: "applied-physics", name: "Applied Physics", code: "AP" },
          { id: "engineering-workshop", name: "Engineering Workshop", code: "EW" },
          { id: "english-skill-enhancement", name: "English for Skill Enhancement", code: "ESE" },
          { id: "electronic-devices-circuits", name: "Electronic Devices and Circuits", code: "EDC" },
          { id: "applied-physics-lab", name: "Applied Physics Laboratory", code: "APL", hasLab: true },
          { id: "python-programming-lab", name: "Python Programming Laboratory", code: "PPL", hasLab: true },
          { id: "english-language-lab", name: "English Language and Communication Skills Laboratory", code: "ELCSL", hasLab: true },
          { id: "it-workshop", name: "IT Workshop", code: "ITW", hasLab: true },
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
          { id: "computer-oriented-statistical-methods", name: "Computer Oriented Statistical Methods", code: "COSM" },
          { id: "computer-organization-architecture", name: "Computer Organization and Architecture", code: "COA" },
          { id: "object-oriented-programming-java", name: "Object Oriented Programming through Java", code: "OOPJ" },
          { id: "data-structures-lab", name: "Data Structures Lab", code: "DSL", hasLab: true },
          { id: "object-oriented-programming-java-lab", name: "Object Oriented Programming through Java Lab", code: "OOPJL", hasLab: true },
        ]
      },
      {
        id: "year-2-sem-2",
        name: "Semester II",
        subjects: [
          { id: "discrete-mathematics", name: "Discrete Mathematics", code: "DM" },
          { id: "business-economics-financial-analysis", name: "Business Economics & Financial Analysis", code: "BEFA" },
          { id: "operating-systems", name: "Operating Systems", code: "OS" },
          { id: "database-management-systems", name: "Database Management Systems", code: "DBMS" },
          { id: "software-engineering", name: "Software Engineering", code: "SE" },
          { id: "operating-systems-lab", name: "Operating Systems Lab", code: "OSL", hasLab: true },
          { id: "database-management-systems-lab", name: "Database Management Systems Lab", code: "DBMSL", hasLab: true },
          { id: "nrd", name: "NRD", code: "NRD" },
        ]
      }
    ]
  },
  {
    id: "year-3",
    name: "III Year",
    semesters: [
      {
        id: "year-3-sem-1",
        name: "Semester I",
        subjects: [
          { id: "design-analysis-algorithms", name: "Design and Analysis of Algorithms", code: "DAA" },
          { id: "computer-networks", name: "Computer Networks", code: "CN" },
          { id: "devops", name: "DevOps", code: "DO" },
          { id: "computer-networks-lab", name: "Computer Networks Lab", code: "CNL", hasLab: true },
          { id: "devops-lab", name: "DevOps Lab", code: "DOL", hasLab: true },
        ]
      },
      {
        id: "year-3-sem-2",
        name: "Semester II",
        subjects: [
          { id: "machine-learning", name: "Machine Learning", code: "ML" },
          { id: "formal-languages-automata-theory", name: "Formal Languages and Automata Theory", code: "FLAT" },
          { id: "artificial-intelligence", name: "Artificial Intelligence", code: "AI" },
          { id: "professional-elective-3", name: "Professional Elective – III", code: "PE" },
          { id: "machine-learning-lab", name: "Machine Learning Lab", code: "MLL", hasLab: true },
        ]
      }
    ]
  },
  {
    id: "year-4",
    name: "IV Year",
    semesters: [
      {
        id: "year-4-sem-1",
        name: "Semester I",
        subjects: [
          { id: "cryptography-network-security", name: "Cryptography and Network Security", code: "CNS" },
          { id: "compiler-design", name: "Compiler Design", code: "CD" },
          { id: "cryptography-network-security-lab", name: "Cryptography and Network Security Lab", code: "CNSL", hasLab: true },
          { id: "compiler-design-lab", name: "Compiler Design Lab", code: "CDL", hasLab: true },
        ]
      },
      {
        id: "year-4-sem-2",
        name: "Semester II",
        subjects: [
          // Add subjects for IV Year, Semester II when available
        ]
      }
    ]
  }
];

export default curriculum; 