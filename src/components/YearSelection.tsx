import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";
import { curriculum } from "@/data/curriculum";

interface YearSelectionProps {
  onYearSelect: (yearId: string) => void;
}

const YearSelection = ({ onYearSelect }: YearSelectionProps) => {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <GraduationCap className="h-12 w-12 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">BTech Notes</h1>
          </div>
          <h2 className="text-2xl font-semibold text-primary mb-2">Select Year</h2>
          <p className="text-muted-foreground">Choose your academic year to access study materials</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {curriculum.map((year) => (
            <Card key={year.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-8 text-center">
                <Button
                  onClick={() => onYearSelect(year.id)}
                  className="w-full h-16 text-xl font-semibold"
                  variant="outline"
                >
                  {year.name}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recently Opened PDFs Section */}
        <div className="mt-16 text-center space-y-4">
          <div className="bg-primary/10 p-6 rounded-lg max-w-md mx-auto">
            <h3 className="font-semibold text-primary mb-2">Recently Opened PDFs</h3>
            <div className="space-y-2 text-muted-foreground">
              <p>No recently opened PDFs yet.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YearSelection;
