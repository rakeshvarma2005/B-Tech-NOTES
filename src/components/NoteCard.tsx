import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface NoteCardProps {
  title: string;
  subtitle?: string;
  color?: "blue" | "purple" | "green" | "amber";
  equations?: string[];
  onClick?: () => void;
  className?: string;
}

export function NoteCard({
  title,
  subtitle = "Complete Notes",
  color = "blue",
  equations = [],
  onClick,
  className
}: NoteCardProps) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    purple: "from-purple-500 to-purple-600",
    green: "from-emerald-500 to-emerald-600",
    amber: "from-amber-500 to-amber-600"
  };
  
  const textColorClasses = {
    blue: "text-blue-100",
    purple: "text-purple-100",
    green: "text-emerald-100",
    amber: "text-amber-100"
  };

  return (
    <Card 
      className={cn(
        "w-full max-w-xs overflow-hidden cursor-pointer hover:shadow-lg transition-shadow",
        className
      )}
      onClick={onClick}
    >
      <div className={`bg-gradient-to-br ${colorClasses[color]} p-4 flex flex-col h-full`}>
        <div className="mb-4">
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <p className={`text-sm ${textColorClasses[color]}`}>{subtitle}</p>
        </div>
        
        <div className="flex-1 flex flex-col gap-2">
          {equations.map((equation, index) => (
            <Button 
              key={index}
              variant="secondary" 
              className="bg-white/20 hover:bg-white/30 text-white border-none"
            >
              {equation}
            </Button>
          ))}
        </div>
      </div>
    </Card>
  );
} 