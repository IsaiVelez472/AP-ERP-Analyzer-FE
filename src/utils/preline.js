// Copyright 2025 Anti-Patrones
// This work is licensed under a Creative Commons Attribution-ShareAlike 4.0 International License.
// http://creativecommons.org/licenses/by-sa/4.0/
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
