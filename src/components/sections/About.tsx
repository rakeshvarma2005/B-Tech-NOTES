import { motion } from "framer-motion";
import { fadeIn, slideInFromBottom, slideInFromLeft, slideInFromRight } from "@/lib/animations";

export default function About() {
  return (
    <motion.div 
      className="py-16 bg-muted/50"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={fadeIn}
    >
      <div className="container mx-auto px-4">
        <motion.div variants={slideInFromBottom} className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">About Us</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Learn more about our mission and the team behind B-Tech Notes.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div variants={slideInFromLeft}>
            <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
            <p className="text-muted-foreground mb-4">
              At B-Tech Notes, our mission is to make quality engineering education accessible to all students. 
              We believe that every student deserves access to well-organized, comprehensive study materials 
              that can help them excel in their academic journey.
            </p>
            <p className="text-muted-foreground mb-4">
              We strive to create a platform where engineering students can easily find and use study materials 
              that are tailored to their curriculum, saving them time and helping them achieve better results.
            </p>
            <p className="text-muted-foreground">
              Our goal is to build a community of learners who can benefit from shared knowledge and resources, 
              making the engineering education experience more collaborative and effective.
            </p>
          </motion.div>
          
          <motion.div variants={slideInFromRight} className="bg-card rounded-lg p-8 shadow-lg">
            <h3 className="text-2xl font-bold mb-4">Our Story</h3>
            <p className="text-muted-foreground mb-4">
              B-Tech Notes was founded by a group of engineering graduates who experienced firsthand the challenges 
              of finding organized and relevant study materials during their college years.
            </p>
            <p className="text-muted-foreground mb-4">
              What started as a small collection of notes shared among friends has grown into a comprehensive 
              platform serving thousands of engineering students across various institutions.
            </p>
            <p className="text-muted-foreground">
              Today, we continue to expand our collection of study materials and improve our platform based on 
              feedback from our growing community of users, always keeping our focus on helping students succeed.
            </p>
          </motion.div>
        </div>
        
        <motion.div 
          variants={slideInFromBottom} 
          className="mt-16 text-center"
        >
          <h3 className="text-2xl font-bold mb-4">Core Values</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-8">
            {[
              { title: "Accessibility", description: "Making quality education available to all" },
              { title: "Quality", description: "Providing accurate and comprehensive materials" },
              { title: "Innovation", description: "Continuously improving our platform and content" },
              { title: "Community", description: "Fostering collaboration among students" }
            ].map((value, index) => (
              <motion.div 
                key={index}
                variants={slideInFromBottom}
                custom={index * 0.1}
                transition={{ delay: index * 0.1 }}
                className="bg-card p-6 rounded-lg shadow"
              >
                <h4 className="text-lg font-bold mb-2">{value.title}</h4>
                <p className="text-muted-foreground">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
} 