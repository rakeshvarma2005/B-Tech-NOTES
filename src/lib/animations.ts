import { Variants } from "framer-motion";

// Animation variants for Framer Motion
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.5 }
  }
};

export const slideInFromLeft: Variants = {
  hidden: { x: -100, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { 
      type: "spring", 
      stiffness: 100, 
      damping: 15 
    }
  }
};

export const slideInFromRight: Variants = {
  hidden: { x: 100, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { 
      type: "spring", 
      stiffness: 100, 
      damping: 15 
    }
  }
};

export const slideInFromTop: Variants = {
  hidden: { y: -100, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { 
      type: "spring", 
      stiffness: 100, 
      damping: 15 
    }
  }
};

export const slideInFromBottom: Variants = {
  hidden: { y: 100, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { 
      type: "spring", 
      stiffness: 100, 
      damping: 15 
    }
  }
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const popUp: Variants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: { 
      type: "spring", 
      stiffness: 300, 
      damping: 15 
    }
  }
};

export const buttonHover = {
  scale: 1.05,
  transition: { duration: 0.2 }
};

export const buttonTap = {
  scale: 0.95,
  transition: { duration: 0.1 }
};

// New animations
export const floatAnimation = {
  y: [0, -15, 0],
  transition: {
    duration: 3,
    repeat: Infinity,
    repeatType: "loop" as const,
    ease: "easeInOut"
  }
};

export const pulseAnimation = {
  scale: [1, 1.05, 1],
  transition: {
    duration: 2,
    repeat: Infinity,
    repeatType: "loop" as const
  }
};

export const rotateAnimation = {
  rotate: [0, 5, 0, -5, 0],
  transition: {
    duration: 5,
    repeat: Infinity,
    repeatType: "loop" as const,
    ease: "easeInOut"
  }
};

export const shimmer: Variants = {
  hidden: {
    backgroundPosition: "0% 0%",
  },
  visible: {
    backgroundPosition: "100% 0%",
    transition: {
      repeat: Infinity,
      duration: 1.5,
      ease: "linear"
    }
  }
};

export const revealFromLeft: Variants = {
  hidden: {
    clipPath: "inset(0 100% 0 0)",
    opacity: 0,
  },
  visible: {
    clipPath: "inset(0 0% 0 0)",
    opacity: 1,
    transition: {
      duration: 1,
      ease: "easeOut",
    }
  }
};

export const staggeredFadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    }
  }
};

export const staggeredChildren: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5
    }
  }
}; 