// src/components/LoadingStates.js
import React from 'react';
import { motion } from 'framer-motion';
import { 
  MagnifyingGlassIcon, 
  CogIcon, 
  ChartBarIcon, 
  CheckIcon 
} from '@heroicons/react/24/outline';

const STAGES = [
  {
    id: 'initializing',
    name: 'Initializing search',
    icon: CogIcon,
    description: 'Setting up AI agents and processing your filters'
  },
  {
    id: 'analyzing',
    name: 'Analyzing search parameters',
    icon: ChartBarIcon,
    description: 'Understanding your requirements and optimizing search strategy'
  },
  {
    id: 'searching',
    name: 'Searching and analyzing products',
    icon: MagnifyingGlassIcon,
    description: 'Scraping multiple retailers and gathering product data'
  },
  {
    id: 'processing',
    name: 'Processing results',
    icon: ChartBarIcon,
    description: 'Comparing products and calculating match scores'
  },
  {
    id: 'finalizing',
    name: 'Finalizing results',
    icon: CheckIcon,
    description: 'Preparing recommendations and sorting by relevance'
  },
  {
    id: 'completed',
    name: 'Search completed',
    icon: CheckIcon,
    description: 'Ready to show your personalized results'
  }
];

export function LoadingStates({ currentStage = 'initializing' }) {
  const currentStageIndex = STAGES.findIndex(stage => 
    currentStage.toLowerCase().includes(stage.id.toLowerCase()) ||
    stage.name.toLowerCase().includes(currentStage.toLowerCase())
  );
  
  const activeIndex = currentStageIndex >= 0 ? currentStageIndex : 0;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Main Loading Animation */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 mb-6"
      >
        {/* Current Stage Indicator */}
        <div className="text-center mb-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary-500 to-purple-600 rounded-full mb-4"
          >
            <MagnifyingGlassIcon className="w-8 h-8 text-white" />
          </motion.div>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {STAGES[activeIndex]?.name || currentStage}
          </h3>
          
          <p className="text-gray-600">
            {STAGES[activeIndex]?.description || 'Processing your request...'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Progress</span>
            <span className="text-sm font-medium text-primary-600">
              {Math.round(((activeIndex + 1) / STAGES.length) * 100)}%
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-primary-500 to-purple-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ 
                width: `${((activeIndex + 1) / STAGES.length) * 100}%` 
              }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>
      </motion.div>

      {/* Stage Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
      >
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Search Process</h4>
        
        <div className="space-y-4">
          {STAGES.map((stage, index) => {
            const isActive = index === activeIndex;
            const isCompleted = index < activeIndex;
            const IconComponent = stage.icon;
            
            return (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center space-x-4 p-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-primary-50 border border-primary-200' 
                    : isCompleted 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-gray-50 border border-gray-100'
                }`}
              >
                {/* Stage Icon */}
                <div className={`p-2 rounded-full ${
                  isActive 
                    ? 'bg-primary-100' 
                    : isCompleted 
                    ? 'bg-green-100' 
                    : 'bg-gray-100'
                }`}>
                  {isCompleted ? (
                    <CheckIcon className="w-5 h-5 text-green-600" />
                  ) : (
                    <IconComponent className={`w-5 h-5 ${
                      isActive ? 'text-primary-600' : 'text-gray-400'
                    }`} />
                  )}
                </div>

                {/* Stage Info */}
                <div className="flex-1">
                  <h5 className={`font-medium ${
                    isActive 
                      ? 'text-primary-900' 
                      : isCompleted 
                      ? 'text-green-900' 
                      : 'text-gray-500'
                  }`}>
                    {stage.name}
                  </h5>
                  <p className={`text-sm ${
                    isActive 
                      ? 'text-primary-700' 
                      : isCompleted 
                      ? 'text-green-700' 
                      : 'text-gray-400'
                  }`}>
                    {stage.description}
                  </p>
                </div>

                {/* Status Indicator */}
                {isActive && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-3 h-3 bg-primary-500 rounded-full"
                  />
                )}
                
                {isCompleted && (
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Fun Facts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mt-6"
      >
        <h4 className="text-lg font-semibold text-gray-900 mb-3">
          💡 Did you know?
        </h4>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div className="flex items-start space-x-2">
            <span className="text-blue-500">🔍</span>
            <span>Our AI searches across multiple retailers simultaneously to find the best deals</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-purple-500">🧠</span>
            <span>Machine learning algorithms rank products based on your specific preferences</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-green-500">⚡</span>
            <span>Real-time price comparison ensures you get the most up-to-date information</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-orange-500">🎯</span>
            <span>Smart categorization helps find products that exactly match your use case</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}