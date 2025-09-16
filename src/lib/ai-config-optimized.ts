/**
 * Optimized AI Configuration
 * Centralized AI settings with performance and cost optimizations
 */

export const aiConfig = {
  // Model configurations for different use cases
  models: {
    // Fast, cost-effective model for simple tasks
    fast: {
      name: 'gemini-1.5-flash',
      maxTokens: 2048,
      temperature: 0.3,
      topP: 0.8,
      topK: 20,
    },
    
    // Balanced model for general tasks
    balanced: {
      name: 'gemini-1.5-flash',
      maxTokens: 4096,
      temperature: 0.7,
      topP: 0.9,
      topK: 40,
    },
    
    // High-quality model for complex tasks
    quality: {
      name: 'gemini-1.5-pro',
      maxTokens: 8192,
      temperature: 0.8,
      topP: 0.95,
      topK: 50,
    },
  },
  
  // Feature-specific configurations
  features: {
    chat: {
      model: 'fast',
      maxTokens: 1024,
      temperature: 0.7,
      timeout: 10000, // 10 seconds
    },
    
    documentAnalysis: {
      model: 'balanced',
      maxTokens: 2048,
      temperature: 0.5,
      timeout: 30000, // 30 seconds
    },
    
    imageGeneration: {
      model: 'quality',
      maxTokens: 512,
      temperature: 0.8,
      timeout: 60000, // 60 seconds
    },
    
    placementMatching: {
      model: 'balanced',
      maxTokens: 1024,
      temperature: 0.6,
      timeout: 15000, // 15 seconds
    },
  },
  
  // Rate limiting and cost control
  limits: {
    requestsPerMinute: 60,
    requestsPerHour: 1000,
    maxConcurrentRequests: 10,
    dailyTokenLimit: 100000,
    monthlyCostLimit: 100, // USD
  },
  
  // Caching configuration
  cache: {
    enabled: true,
    ttl: 3600, // 1 hour
    maxSize: 1000, // 1000 entries
    strategy: 'lru', // Least Recently Used
  },
  
  // Error handling and retries
  retry: {
    maxAttempts: 3,
    baseDelay: 1000, // 1 second
    maxDelay: 10000, // 10 seconds
    backoffMultiplier: 2,
  },
  
  // Content filtering and safety
  safety: {
    enabled: true,
    toxicityThreshold: 0.7,
    safetyThreshold: 0.8,
    contentFiltering: true,
    profanityFilter: true,
  },
  
  // Performance monitoring
  monitoring: {
    enabled: true,
    logLevel: 'info',
    trackLatency: true,
    trackTokens: true,
    trackCosts: true,
  },
  
  // Development settings
  development: {
    mockResponses: process.env.MOCK_AI_RESPONSES === 'true',
    debugMode: process.env.AI_DEBUG_MODE === 'true',
    verboseLogging: process.env.NODE_ENV === 'development',
  },
} as const;

export type AIConfig = typeof aiConfig;

// Helper function to get model config for a specific feature
export function getModelConfig(feature: keyof typeof aiConfig.features) {
  const featureConfig = aiConfig.features[feature];
  const modelName = featureConfig.model as keyof typeof aiConfig.models;
  return {
    ...aiConfig.models[modelName],
    ...featureConfig,
  };
}

// Helper function to check if feature is enabled
export function isFeatureEnabled(feature: string): boolean {
  return process.env[`ENABLE_AI_${feature.toUpperCase()}`] === 'true';
}

// Helper function to get optimized settings for production
export function getProductionConfig() {
  return {
    ...aiConfig,
    limits: {
      ...aiConfig.limits,
      requestsPerMinute: 30, // More conservative in production
      maxConcurrentRequests: 5,
    },
    development: {
      ...aiConfig.development,
      mockResponses: false,
      debugMode: false,
      verboseLogging: false,
    },
  };
}



