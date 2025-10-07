// src/components/EnhancedLoadingStates.js
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MagnifyingGlassIcon, 
  CpuChipIcon, 
  SparklesIcon,
  ShoppingBagIcon,
  ChartBarIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';

// Function to get stage-specific descriptions
const getStageDescription = (stage) => {
  const descriptions = {
    'Analyzing search parameters': 'AI Parser is understanding your requirements and optimizing search strategy',
    'Initializing AI agents': 'Setting up specialized AI agents: Parser, Scraper, Comparator, and Formatter',
    'Searching and analyzing products': 'Web Scraper is collecting product data from multiple sources and analyzing them',
    'Processing results': 'Comparator Agent is ranking products and Formatter is preparing final results',
    'Finalizing results': 'Finalizing your personalized product recommendations',
    'Search completed': 'All done! Your personalized product recommendations are ready'
  };
  return descriptions[stage] || 'Real-time updates from our AI agent crew working on your search';
};

const loadingMessages = [
  "Analyzing search parameters...",
  "Initializing AI agents...",
  "Searching and analyzing products...", 
  "Processing results...",
  "Finalizing results...",
  "AI Parser analyzing your requirements...",
  "Web Scraper collecting product data...",
  "Comparator Agent ranking products...",
  "Formatter preparing final results...",
  "Comparing prices across platforms...",
  "Evaluating customer reviews...",
  "AI is analyzing your needs..."
];

const agentSteps = [
  { icon: CpuChipIcon, text: "Analyzing Parameters", color: "from-blue-500 to-purple-600", stage: "Analyzing search parameters" },
  { icon: SparklesIcon, text: "Initializing AI Agents", color: "from-purple-500 to-pink-500", stage: "Initializing AI agents" },
  { icon: MagnifyingGlassIcon, text: "Searching Products", color: "from-green-500 to-blue-500", stage: "Searching and analyzing products" },
  { icon: ChartBarIcon, text: "Processing Results", color: "from-yellow-500 to-red-500", stage: "Processing results" }
];

export function EnhancedLoadingStates({ currentStage, progress = 0 }) {
  const [currentMessage, setCurrentMessage] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [dots, setDots] = useState('');

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setCurrentMessage(prev => (prev + 1) % loadingMessages.length);
    }, 2000);

    const dotsInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    return () => {
      clearInterval(messageInterval);
      clearInterval(dotsInterval);
    };
  }, []);

  useEffect(() => {
    // Update current step based on backend stage
    if (currentStage) {
      const stageIndex = agentSteps.findIndex(step => 
        currentStage.toLowerCase().includes(step.stage.toLowerCase())
      );
      if (stageIndex !== -1) {
        setCurrentStep(stageIndex);
      }
    } else {
      // Fallback to progress-based steps
      if (progress < 25) setCurrentStep(0);
      else if (progress < 50) setCurrentStep(1);
      else if (progress < 75) setCurrentStep(2);
      else setCurrentStep(3);
    }
  }, [progress, currentStage]);

  return (
    <div className="min-h-[600px] flex items-center justify-center">
      <div className="max-w-2xl mx-auto text-center p-8">
        {/* Main Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="relative mb-8"
        >
          {/* Outer rotating ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="w-32 h-32 mx-auto border-4 border-transparent border-t-primary-500 border-r-purple-500 rounded-full"
          />
          
          {/* Inner pulsing circle */}
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 w-24 h-24 mx-auto my-auto bg-gradient-to-r from-primary-500 to-purple-600 rounded-full flex items-center justify-center"
          >
            <SparklesIcon className="w-12 h-12 text-white" />
          </motion.div>

          {/* Floating particles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [-20, -40, -20],
                x: [0, Math.sin(i) * 20, 0],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "easeInOut"
              }}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full"
              style={{
                top: `${20 + i * 10}%`,
                left: `${20 + i * 10}%`
              }}
            />
          ))}
        </motion.div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-primary-500 to-purple-600 rounded-full relative"
            >
              <motion.div
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-white/30 w-1/3 skew-x-12"
              />
            </motion.div>
          </div>
        </div>

        {/* Agent Steps */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {agentSteps.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = index <= currentStep;
            const isCompleted = index < currentStep;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className={`p-4 rounded-xl border-2 transition-all duration-500 ${
                  isActive 
                    ? 'border-primary-300 bg-gradient-to-br from-primary-50 to-purple-50' 
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <motion.div
                  animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                  className={`w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center ${
                    isCompleted ? 'bg-green-500' : isActive ? `bg-gradient-to-r ${step.color}` : 'bg-gray-300'
                  }`}
                >
                  <StepIcon className="w-4 h-4 text-white" />
                </motion.div>
                <p className={`text-xs font-medium ${isActive ? 'text-primary-700' : 'text-gray-500'}`}>
                  {step.text}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Dynamic Messages */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStage || currentMessage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              {currentStage ? `${currentStage}${dots}` : `${loadingMessages[currentMessage]}${dots}`}
            </h3>
            <p className="text-gray-600">
              {currentStage ? 
                getStageDescription(currentStage) :
                "Our AI agents are working hard to find the perfect products for you"
              }
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Information Panel */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100"
        >
          <LightBulbIcon className="w-6 h-6 text-blue-500 mx-auto mb-2" />
          <h4 className="font-semibold text-gray-800 mb-2">Processing Information</h4>
          <p className="text-sm text-gray-600">
            Our AI analyzes thousands of products across multiple platforms, 
            comparing prices, reviews, and specifications to find the best matches for your needs.
          </p>
        </motion.div>

        {/* Estimated Time */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-6 text-sm text-gray-500"
        >
          Estimated completion: {progress > 50 ? '30-60 seconds' : '1-2 minutes'}
        </motion.div>
      </div>
    </div>
  );
}