/**
 * Production Monitoring and Error Tracking
 * Provides monitoring capabilities with optional Sentry integration
 */

interface ErrorContext {
  userId?: string;
  userRole?: string;
  url?: string;
  userAgent?: string;
  timestamp?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  tags?: Record<string, string>;
}

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  tags?: Record<string, string>;
  timestamp?: number;
}

class MonitoringService {
  private static instance: MonitoringService;
  private isProduction: boolean;
  private sentryDsn: string | null;

  private constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN || null;
    
    this.initializeSentry();
  }

  static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  private initializeSentry() {
    // Skip Sentry initialization for now - will be added when Sentry is installed
    console.log('Monitoring service initialized (Sentry integration available when installed)');
  }

  // Sentry integration methods (to be implemented when Sentry is installed)
  private async initializeBrowserSentry() {
    console.log('Browser Sentry initialization (install @sentry/nextjs to enable)');
  }

  private async initializeServerSentry() {
    console.log('Server Sentry initialization (install @sentry/nextjs to enable)');
  }

  // Error tracking
  captureError(error: Error, context?: ErrorContext) {
    const errorContext = {
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : 'server',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
      ...context,
    };

    // Log to console in development
    if (!this.isProduction) {
      console.error('Error captured:', error, errorContext);
      return;
    }

    // Send to Sentry in production
    this.sendToSentry(error, errorContext);
  }

  // Performance tracking
  captureMetric(metric: PerformanceMetric) {
    const metricData = {
      timestamp: Date.now(),
      ...metric,
    };

    // Log to console in development
    if (!this.isProduction) {
      console.log('Performance metric:', metricData);
      return;
    }

    // Send to monitoring service in production
    this.sendMetric(metricData);
  }

  // User action tracking
  captureUserAction(action: string, context?: Record<string, any>) {
    const actionData = {
      action,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : 'server',
      ...context,
    };

    // Log to console in development
    if (!this.isProduction) {
      console.log('User action:', actionData);
      return;
    }

    // Send to analytics service in production
    this.sendUserAction(actionData);
  }

  // API performance tracking
  captureApiCall(endpoint: string, method: string, duration: number, status: number) {
    this.captureMetric({
      name: 'api_call_duration',
      value: duration,
      unit: 'milliseconds',
      tags: {
        endpoint,
        method,
        status: status.toString(),
      },
    });

    // Track API errors
    if (status >= 400) {
      this.captureError(new Error(`API Error: ${method} ${endpoint} returned ${status}`), {
        severity: status >= 500 ? 'high' : 'medium',
        tags: {
          endpoint,
          method,
          status: status.toString(),
        },
      });
    }
  }

  private async sendToSentry(error: Error, context: ErrorContext) {
    // Fallback: log to console with structured data
    // When Sentry is installed, this will be replaced with actual Sentry integration
    console.error('Error captured by monitoring service:', {
      error: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString()
    });
  }

  private sendMetric(metric: PerformanceMetric) {
    // In production, send to your metrics service (DataDog, New Relic, etc.)
    // For now, we'll log to console
    console.log('Metric:', metric);
  }

  private sendUserAction(action: any) {
    // In production, send to your analytics service (Google Analytics, Mixpanel, etc.)
    // For now, we'll log to console
    console.log('User action:', action);
  }

  // Health check endpoint data
  getHealthData() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };
  }
}

// Export singleton instance
export const monitoring = MonitoringService.getInstance();

// Helper functions for easy usage
export const captureError = (error: Error, context?: ErrorContext) => {
  monitoring.captureError(error, context);
};

export const captureMetric = (metric: PerformanceMetric) => {
  monitoring.captureMetric(metric);
};

export const captureUserAction = (action: string, context?: Record<string, any>) => {
  monitoring.captureUserAction(action, context);
};

export const captureApiCall = (endpoint: string, method: string, duration: number, status: number) => {
  monitoring.captureApiCall(endpoint, method, duration, status);
};

export const getHealthData = () => {
  return monitoring.getHealthData();
};

// Performance monitoring hook for React components
export const usePerformanceMonitoring = (componentName: string) => {
  const startTime = Date.now();

  const trackRender = () => {
    const renderTime = Date.now() - startTime;
    captureMetric({
      name: 'component_render_time',
      value: renderTime,
      unit: 'milliseconds',
      tags: {
        component: componentName,
      },
    });
  };

  const trackError = (error: Error) => {
    captureError(error, {
      severity: 'medium',
      tags: {
        component: componentName,
        type: 'react_error',
      },
    });
  };

  return { trackRender, trackError };
};
