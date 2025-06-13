import { motion } from "framer-motion";
import { fadeIn, slideInFromBottom } from "@/lib/animations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Clock, Laptop, FileText, BookMarked, GraduationCap } from "lucide-react";

export default function Features() {
  const features = [
    {
      icon: <BookOpen className="h-8 w-8 text-primary" />,
      title: "Comprehensive Study Material",
      description: "Access detailed notes for all engineering subjects across different semesters."
    },
    {
      icon: <Clock className="h-8 w-8 text-primary" />,
      title: "Time-Saving",
      description: "Quickly find the information you need without sifting through lengthy textbooks."
    },
    {
      icon: <Laptop className="h-8 w-8 text-primary" />,
      title: "Mobile Friendly",
      description: "Access your study materials anytime, anywhere on any device."
    },
    {
      icon: <FileText className="h-8 w-8 text-primary" />,
      title: "Exam Preparation",
      description: "Special focus on important topics and previous year question papers."
    },
    {
      icon: <BookMarked className="h-8 w-8 text-primary" />,
      title: "Subject Categorization",
      description: "Well-organized content by semester, branch, and subject for easy navigation."
    },
    {
      icon: <GraduationCap className="h-8 w-8 text-primary" />,
      title: "Academic Excellence",
      description: "Curated by top students to help you achieve better grades in your engineering courses."
    }
  ];

  return (
    <motion.div 
      className="py-16 bg-muted"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={fadeIn}
    >
      <div className="container mx-auto px-4">
        <motion.div variants={slideInFromBottom} className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Features</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover all the powerful features that make B-Tech Notes the perfect companion for your engineering studies.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={slideInFromBottom}
              custom={index * 0.1}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full bg-card hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <div className="p-2 rounded-full bg-primary/10">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
} 