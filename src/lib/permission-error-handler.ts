/**
 * Permission Error Handler
 * Comprehensive error handling for Firebase permission issues
 */

export interface PermissionError {
  code: string;
  message: string;
  collection?: string;
  operation?: string;
  suggestion?: string;
}

export class PermissionErrorHandler {
  private static errorMap: Record<string, PermissionError> = {
    'permission-denied': {
      code: 'permission-denied',
      message: 'Permission denied. You do not have access to this resource.',
      suggestion: 'Check your Firestore security rules and user authentication status.'
    },
    'unauthenticated': {
      code: 'unauthenticated',
      message: 'User is not authenticated.',
      suggestion: 'Please log in to access this resource.'
    },
    'insufficient-permissions': {
      code: 'insufficient-permissions',
      message: 'Insufficient permissions for this operation.',
      suggestion: 'Contact an administrator to grant you the necessary permissions.'
    },
    'resource-not-found': {
      code: 'resource-not-found',
      message: 'The requested resource was not found.',
      suggestion: 'Check if the resource exists and you have access to it.'
    }
  };

  static handleError(error: any, context?: { collection?: string; operation?: string }): PermissionError {
    const errorCode = error?.code || error?.message?.toLowerCase() || 'unknown';
    
    // Check for specific Firebase error patterns
    if (errorCode.includes('permission-denied') || errorCode.includes('permission denied')) {
      return {
        ...this.errorMap['permission-denied'],
        collection: context?.collection,
        operation: context?.operation,
        suggestion: this.getPermissionDeniedSuggestion(context?.collection)
      };
    }
    
    if (errorCode.includes('unauthenticated') || errorCode.includes('not authenticated')) {
      return {
        ...this.errorMap['unauthenticated'],
        collection: context?.collection,
        operation: context?.operation
      };
    }
    
    if (errorCode.includes('insufficient permissions') || errorCode.includes('insufficient-permissions')) {
      return {
        ...this.errorMap['insufficient-permissions'],
        collection: context?.collection,
        operation: context?.operation
      };
    }
    
    if (errorCode.includes('not found') || errorCode.includes('resource-not-found')) {
      return {
        ...this.errorMap['resource-not-found'],
        collection: context?.collection,
        operation: context?.operation
      };
    }
    
    // Default error
    return {
      code: 'unknown',
      message: error?.message || 'An unknown error occurred',
      collection: context?.collection,
      operation: context?.operation,
      suggestion: 'Please try again or contact support if the issue persists.'
    };
  }

  private static getPermissionDeniedSuggestion(collection?: string): string {
    const suggestions: Record<string, string> = {
      'stipendReports': 'Stipend reports may require admin access. Check if you have the correct role.',
      'issueReports': 'Issue reports may require admin access. Check if you have the correct role.',
      'activities': 'Activities may require authentication. Please log in and try again.',
      'documents': 'Document access may be restricted. Check if you own the document or have admin access.',
      'users': 'User data access may be restricted. Check your authentication status.',
      'applications': 'Application access may be restricted. Check if you own the application or have admin access.',
      'placements': 'Placement data may require admin access. Check your role permissions.',
      'programs': 'Program data should be publicly accessible. Check your authentication status.',
      'notifications': 'Notification access may be restricted. Check if you own the notification or have admin access.'
    };
    
    return suggestions[collection || ''] || 'Check your Firestore security rules and user authentication status.';
  }

  static logError(error: PermissionError, additionalContext?: any): void {
    console.error('🚨 Permission Error:', {
      code: error.code,
      message: error.message,
      collection: error.collection,
      operation: error.operation,
      suggestion: error.suggestion,
      context: additionalContext
    });
  }

  static getErrorMessage(error: PermissionError): string {
    let message = error.message;
    
    if (error.collection) {
      message += ` (Collection: ${error.collection})`;
    }
    
    if (error.operation) {
      message += ` (Operation: ${error.operation})`;
    }
    
    return message;
  }

  static getSuggestion(error: PermissionError): string {
    return error.suggestion || 'Please try again or contact support if the issue persists.';
  }

  static isPermissionError(error: any): boolean {
    const errorCode = error?.code || error?.message?.toLowerCase() || '';
    return errorCode.includes('permission') || 
           errorCode.includes('unauthenticated') || 
           errorCode.includes('insufficient');
  }

  static async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: any;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        // Don't retry permission errors
        if (this.isPermissionError(error)) {
          throw error;
        }
        
        if (attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt - 1);
          console.warn(`⚠️  Operation failed (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError;
  }
}

// Helper function for common permission error handling
export function handleFirebaseError(error: any, context?: { collection?: string; operation?: string }) {
  const permissionError = PermissionErrorHandler.handleError(error, context);
  PermissionErrorHandler.logError(permissionError);
  
  return {
    success: false,
    error: PermissionErrorHandler.getErrorMessage(permissionError),
    suggestion: PermissionErrorHandler.getSuggestion(permissionError),
    code: permissionError.code
  };
}

// Helper function for checking if an error is permission-related
export function isPermissionError(error: any): boolean {
  return PermissionErrorHandler.isPermissionError(error);
}
