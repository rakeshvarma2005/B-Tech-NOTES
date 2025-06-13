
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Upload, BookOpen, FileText, Award, Clock, GraduationCap, Users } from "lucide-react";
import { branches, getBranchByCode } from "@/data/academicData";

interface UserProfile {
  uid?: string;
  fullName?: string;
  email?: string;
  branch?: string;
  photoURL?: string;
}

interface DashboardProps {
  userProfile: UserProfile;
  onSubjectSelect: (subject: string) => void;
}

const Dashboard = ({ userProfile, onSubjectSelect }: DashboardProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("My Subjects");
  const [selectedBranch, setSelectedBranch] = useState(userProfile?.branch || "CSE");
  const [selectedYear, setSelectedYear] = useState(1);
  const [selectedSemester, setSelectedSemester] = useState(1);

  // Get subjects based on selected branch, year, and semester
  const currentBranch = getBranchByCode(selectedBranch);
  const currentYear = currentBranch?.years.find(y => y.year === selectedYear);
  const currentSemester = currentYear?.semesters.find(s => s.number === selectedSemester);
  const subjects = currentSemester?.subjects || [];

  const filteredSubjects = subjects.filter(subject =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    { label: "Uploads", value: "12", icon: Upload, color: "text-cyan-400" },
    { label: "Views", value: "248", icon: BookOpen, color: "text-orange-400" },
    { label: "Downloads", value: "89", icon: FileText, color: "text-green-400" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-cyan-900 to-orange-900">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-slide-up">
          <div className="flex items-center justify-between mb-6">
            <div className="glass-effect p-6 rounded-2xl">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-orange-400 bg-clip-text text-transparent mb-2">
                Welcome, {userProfile?.fullName} 🎓
              </h1>
              <p className="text-cyan-300">
                Explore notes for {currentBranch?.fullName} - Year {selectedYear}, Semester {selectedSemester}
              </p>
            </div>
            <Button className="bg-gradient-button text-white hover:scale-105 transition-all duration-300 animate-float">
              <Upload className="h-4 w-4 mr-2" />
              Upload Notes
            </Button>
          </div>
        </div>

        {/* Branch, Year, Semester Selection */}
        <div className="mb-8 animate-bounce-in">
          <Card className="glass-effect border-cyan-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-cyan-400" />
                Academic Selection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-cyan-300 text-sm font-medium mb-2 block">Branch</label>
                  <div className="grid grid-cols-2 gap-2">
                    {branches.map((branch) => (
                      <Button
                        key={branch.code}
                        variant={selectedBranch === branch.code ? "default" : "outline"}
                        onClick={() => setSelectedBranch(branch.code)}
                        className={`${
                          selectedBranch === branch.code 
                            ? "bg-gradient-button text-white" 
                            : "border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20"
                        } hover:scale-105 transition-all duration-300`}
                      >
                        {branch.code}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-cyan-300 text-sm font-medium mb-2 block">Year</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[1, 2, 3, 4].map((year) => (
                      <Button
                        key={year}
                        variant={selectedYear === year ? "default" : "outline"}
                        onClick={() => setSelectedYear(year)}
                        className={`${
                          selectedYear === year 
                            ? "bg-gradient-button text-white" 
                            : "border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20"
                        } hover:scale-105 transition-all duration-300`}
                      >
                        Year {year}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-cyan-300 text-sm font-medium mb-2 block">Semester</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[1, 2].map((semester) => (
                      <Button
                        key={semester}
                        variant={selectedSemester === semester ? "default" : "outline"}
                        onClick={() => setSelectedSemester(semester)}
                        className={`${
                          selectedSemester === semester 
                            ? "bg-gradient-button text-white" 
                            : "border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20"
                        } hover:scale-105 transition-all duration-300`}
                      >
                        Sem {semester}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <div className="mb-8 animate-slide-up">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400 h-4 w-4" />
            <Input
              placeholder="Search subjects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-muted/20 border-cyan-500/30 text-white placeholder-cyan-300/50 focus:border-orange-400"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {stats.map((stat, index) => (
            <Card key={stat.label} className="glass-effect border-cyan-500/30 hover-lift animate-bounce-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <CardContent className="p-6 text-center">
                <stat.icon className={`h-8 w-8 ${stat.color} mx-auto mb-3 animate-glow`} />
                <div className="text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-cyan-300">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-muted/20 rounded-xl p-1 w-fit backdrop-blur-sm">
            {["My Subjects", "Recent", "Popular"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                  activeTab === tab
                    ? "bg-gradient-button text-white"
                    : "text-cyan-300 hover:text-white hover:bg-cyan-500/20"
                }`}
              >
                {tab === "My Subjects" && <BookOpen className="h-4 w-4 mr-2 inline" />}
                {tab === "Recent" && <Clock className="h-4 w-4 mr-2 inline" />}
                {tab === "Popular" && <Users className="h-4 w-4 mr-2 inline" />}
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Subjects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredSubjects.map((subject, index) => (
            <Card 
              key={subject.code}
              className="glass-effect border-cyan-500/30 hover:border-orange-500/50 transition-all duration-500 cursor-pointer group hover-lift animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => onSubjectSelect(subject.name)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-white text-lg group-hover:text-cyan-400 transition-colors mb-2">
                      {subject.name}
                    </CardTitle>
                    <div className="flex items-center flex-wrap gap-2 mb-3">
                      <span className="bg-gradient-button px-3 py-1 rounded-full text-xs text-white font-medium">
                        {subject.code}
                      </span>
                      <span className="text-cyan-300 text-xs">
                        • {subject.credits} Credits
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        subject.type === 'core' ? 'bg-green-500/20 text-green-300' :
                        subject.type === 'elective' ? 'bg-blue-500/20 text-blue-300' :
                        'bg-purple-500/20 text-purple-300'
                      }`}>
                        {subject.type.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
                <CardDescription className="text-cyan-300/80 mb-4">
                  {subject.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full border-cyan-500/30 text-cyan-300 hover:bg-gradient-button hover:border-transparent hover:text-white transition-all duration-300 hover:scale-105"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  View Notes
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Achievements Section */}
        <div className="animate-slide-up">
          <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
            <Award className="h-6 w-6 text-orange-400" />
            ACHIEVEMENTS
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "First Upload", icon: "🎯", unlocked: true },
              { name: "Study Streak", icon: "🔥", unlocked: false },
              { name: "Top Contributor", icon: "⭐", unlocked: false },
              { name: "Knowledge Sharer", icon: "🤝", unlocked: true }
            ].map((achievement, index) => (
              <Card key={achievement.name} className={`glass-effect border-cyan-500/30 hover-lift animate-bounce-in ${achievement.unlocked ? 'opacity-100' : 'opacity-50'}`} style={{ animationDelay: `${index * 0.1}s` }}>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl mb-2 animate-float">{achievement.icon}</div>
                  <div className="text-sm text-cyan-300 font-medium">{achievement.name}</div>
                  {achievement.unlocked && <div className="text-xs text-green-400 mt-1">Unlocked</div>}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
