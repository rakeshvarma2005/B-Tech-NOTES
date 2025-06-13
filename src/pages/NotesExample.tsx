import { NoteCard } from "@/components/NoteCard";
import { useNavigate } from "react-router-dom";

export default function NotesExample() {
  const navigate = useNavigate();
  
  const handleCardClick = () => {
    // Navigate to a detail page or open a PDF viewer
    console.log("Card clicked");
  };
  
  return (
    <div className="min-h-screen bg-black p-8">
      <h1 className="text-3xl font-bold text-white mb-8">Notes Examples</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Engineering Mathematics Card */}
        <NoteCard 
          title="Engineering Mathematics"
          subtitle="Complete Notes"
          color="blue"
          equations={[
            "∫ f(x) dx",
            "∑i=1n i²",
            "limx→∞ f(x)",
            "eix + 1 = 0",
            "y = ax² + bx + c"
          ]}
          onClick={handleCardClick}
        />
        
        {/* Additional example cards */}
        <NoteCard 
          title="Data Structures"
          subtitle="Algorithms & Examples"
          color="purple"
          equations={[
            "O(n log n)",
            "Binary Search",
            "Linked Lists"
          ]}
          onClick={handleCardClick}
        />
        
        <NoteCard 
          title="Computer Networks"
          subtitle="Protocols & Architecture"
          color="green"
          equations={[
            "TCP/IP",
            "OSI Model",
            "HTTP/HTTPS"
          ]}
          onClick={handleCardClick}
        />
        
        <NoteCard 
          title="Digital Electronics"
          subtitle="Logic & Design"
          color="amber"
          equations={[
            "A + B = B + A",
            "A · (B + C) = A·B + A·C",
            "¬(A + B) = ¬A · ¬B"
          ]}
          onClick={handleCardClick}
        />
      </div>
      
      <div className="mt-8">
        <button 
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
          onClick={() => navigate('/upload-notes')}
        >
          Upload Your Own Notes
        </button>
      </div>
    </div>
  );
} 