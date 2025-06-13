import { useNavigate } from "react-router-dom";
import { MultiStepUploadForm } from "@/components/MultiStepUploadForm";

export default function UploadNotes() {
  const navigate = useNavigate();
  
  const handleClose = () => {
    navigate("/dashboard");
  };
  
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <MultiStepUploadForm onClose={handleClose} />
    </div>
  );
} 