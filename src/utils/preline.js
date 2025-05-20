// Import Preline
import 'preline/dist/preline.js';

// Initialize Preline
const initPreline = () => {
  if (typeof window !== 'undefined') {
    // Check if HSStaticMethods is available
    if (window.HSStaticMethods) {
      window.HSStaticMethods.autoInit();
    }
  }
};

// Re-initialize Preline on component mount
const reinitPreline = () => {
  if (typeof window !== 'undefined') {
    // Check if HSStaticMethods is available
    if (window.HSStaticMethods) {
      window.HSStaticMethods.autoInit();
    }
  }
};

export { initPreline, reinitPreline };
