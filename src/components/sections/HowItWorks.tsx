import { motion } from "framer-motion";
import { fadeIn, slideInFromBottom } from "@/lib/animations";
import { Card, CardContent } from "@/components/ui/card";
import { UserPlus, Search, FileText, Download } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function HowItWorks() {
  const regulations = [
    {
      id: "r22",
      name: "R22",
      steps: [
        {
          icon: <UserPlus className="h-10 w-10 text-primary" />,
          title: "R22 - Create an Account",
          description: "Sign up with your email or Google account to access all R22 regulation materials."
        },
        {
          icon: <Search className="h-10 w-10 text-primary" />,
          title: "Find R22 Subjects",
          description: "Browse through our organized R22 collection by semester and subject."
        },
        {
          icon: <FileText className="h-10 w-10 text-primary" />,
          title: "Study R22 Materials Online",
          description: "Read R22 notes directly on the platform with our interactive viewer."
        },
        {
          icon: <Download className="h-10 w-10 text-primary" />,
          title: "Download R22 Materials",
          description: "Save R22 materials to your device for studying without internet."
        }
      ]
    },
    {
      id: "r23",
      name: "R23",
      steps: [
        {
          icon: <UserPlus className="h-10 w-10 text-primary" />,
          title: "R23 - Create an Account",
          description: "Sign up with your email or Google account to access all R23 regulation materials."
        },
        {
          icon: <Search className="h-10 w-10 text-primary" />,
          title: "Find R23 Subjects",
          description: "Browse through our organized R23 collection by semester and subject."
        },
        {
          icon: <FileText className="h-10 w-10 text-primary" />,
          title: "Study R23 Materials Online",
          description: "Read R23 notes directly on the platform with our interactive viewer."
        },
        {
          icon: <Download className="h-10 w-10 text-primary" />,
          title: "Download R23 Materials",
          description: "Save R23 materials to your device for studying without internet."
        }
      ]
    },
    {
      id: "r24",
      name: "R24",
      steps: [
        {
          icon: <UserPlus className="h-10 w-10 text-primary" />,
          title: "R24 - Create an Account",
          description: "Sign up with your email or Google account to access all R24 regulation materials."
        },
        {
          icon: <Search className="h-10 w-10 text-primary" />,
          title: "Find R24 Subjects",
          description: "Browse through our organized R24 collection by semester and subject."
        },
        {
          icon: <FileText className="h-10 w-10 text-primary" />,
          title: "Study R24 Materials Online",
          description: "Read R24 notes directly on the platform with our interactive viewer."
        },
        {
          icon: <Download className="h-10 w-10 text-primary" />,
          title: "Download R24 Materials",
          description: "Save R24 materials to your device for studying without internet."
        }
      ]
    },
    {
      id: "r25",
      name: "R25",
      steps: [
        {
          icon: <UserPlus className="h-10 w-10 text-primary" />,
          title: "R25 - Create an Account",
          description: "Sign up with your email or Google account to access all R25 regulation materials."
        },
        {
          icon: <Search className="h-10 w-10 text-primary" />,
          title: "Find R25 Subjects",
          description: "Browse through our organized R25 collection by semester and subject."
        },
        {
          icon: <FileText className="h-10 w-10 text-primary" />,
          title: "Study R25 Materials Online",
          description: "Read R25 notes directly on the platform with our interactive viewer."
        },
        {
          icon: <Download className="h-10 w-10 text-primary" />,
          title: "Download R25 Materials",
          description: "Save R25 materials to your device for studying without internet."
        }
      ]
    }
  ];

  const renderSteps = (steps) => (
    <div className="relative">
      {/* Connection line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-primary/20 hidden md:block" />
      
      <div className="space-y-12 relative">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            variants={slideInFromBottom}
            custom={index * 0.1}
            transition={{ delay: index * 0.1 }}
            className="flex flex-col md:flex-row items-center"
          >
            <Card className={`w-full md:w-5/12 ${index % 2 === 0 ? 'md:mr-auto' : 'md:ml-auto md:order-1'}`}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-2 rounded-full bg-primary/10 flex items-center justify-center">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-bold">{step.title}</h3>
                </div>
                <p className="text-muted-foreground">{step.description}</p>
              </CardContent>
            </Card>
            
            {/* Circle marker on timeline */}
            <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full bg-primary items-center justify-center text-white font-bold">
              {index + 1}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  return (
    <motion.div 
      className="py-16 bg-background"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={fadeIn}
    >
      <div className="container mx-auto px-4">
        <motion.div variants={slideInFromBottom} className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Getting started with B-Tech Notes is easy. Follow these simple steps to access all your study materials.
          </p>
        </motion.div>

        <Tabs defaultValue="r22" className="w-full">
          <TabsList className="flex justify-center mb-8 w-full max-w-md mx-auto">
            {regulations.map((reg) => (
              <TabsTrigger key={reg.id} value={reg.id} className="flex-1">
                {reg.name}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {regulations.map((reg) => (
            <TabsContent key={reg.id} value={reg.id}>
              {renderSteps(reg.steps)}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </motion.div>
  );
} 