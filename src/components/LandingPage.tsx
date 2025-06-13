import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, BookOpen, Users, Star, ChevronDown } from "lucide-react";

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage = ({ onGetStarted }: LandingPageProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="animate-fade-in">
          <div className="inline-block mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto animate-scale-in">
              <GraduationCap className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-6xl font-bold text-white mb-6">
            <span className="text-purple-400">B-TECH NOTES</span> Smart Study!
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">
            The smart way to organize, share, and collaborate on your academic journey. 
            Join the future of student collaboration.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={onGetStarted}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg rounded-full transition-all duration-300 hover:scale-105"
            >
              Get Started
            </Button>
            <Button 
              variant="outline" 
              className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white px-8 py-3 text-lg rounded-full transition-all duration-300"
            >
              Learn More
            </Button>
          </div>
        </div>
        
        {/* Mockup Card */}
        <div className="mt-16 flex justify-center animate-slide-in-right">
          <Card className="bg-gray-800/50 border-purple-500/30 backdrop-blur-sm max-w-md transform rotate-3 hover:rotate-0 transition-transform duration-500">
            <CardHeader className="text-center">
              <CardTitle className="text-purple-400 text-2xl">B-TECH NOTES</CardTitle>
              <CardDescription className="text-gray-300">Share Your Knowledge</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button className="bg-purple-600 hover:bg-purple-700 w-full">
                Click to Get Started
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 animate-bounce">
          <ChevronDown className="h-8 w-8 text-purple-400 mx-auto" />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-white text-center mb-12">Why Choose B-TECH NOTES?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-gray-800/50 border-purple-500/30 backdrop-blur-sm hover:scale-105 transition-all duration-300">
            <CardHeader className="text-center">
              <BookOpen className="h-12 w-12 text-purple-400 mx-auto mb-4" />
              <CardTitle className="text-white">Comprehensive Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-center">Access complete study materials for all subjects, organized by year and semester.</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800/50 border-purple-500/30 backdrop-blur-sm hover:scale-105 transition-all duration-300">
            <CardHeader className="text-center">
              <Users className="h-12 w-12 text-purple-400 mx-auto mb-4" />
              <CardTitle className="text-white">Community Driven</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-center">Share and collaborate with peers. Rate and review materials to help others.</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800/50 border-purple-500/30 backdrop-blur-sm hover:scale-105 transition-all duration-300">
            <CardHeader className="text-center">
              <Star className="h-12 w-12 text-purple-400 mx-auto mb-4" />
              <CardTitle className="text-white">Smart Organization</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-center">Find notes easily with our intelligent search and categorization system.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-gray-800/30 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-white text-center mb-4">How B-TECH NOTES Works</h2>
          <p className="text-gray-300 text-center mb-16 max-w-2xl mx-auto">
            Getting started is easy. Follow these simple steps to access and contribute to our knowledge base.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Sign Up for Free</h3>
              <p className="text-gray-300">Create your account with your email or social media credentials.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Browse or Search Notes</h3>
              <p className="text-gray-300">Find notes by semester, branch, subject, or using the search feature.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Download or Read Online</h3>
              <p className="text-gray-300">Access notes directly in your browser or download for offline use.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-xl font-bold">
                4
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Rate and Review</h3>
              <p className="text-gray-300">Help other students by rating and reviewing the materials you use.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
