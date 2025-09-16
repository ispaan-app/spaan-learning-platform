// Example usage for applicant flow (client component only):
//
// 'use client'
// import { useState } from 'react';
// import { SuccessPopup } from './success-popup';
//
// export function ApplicantSuccessPopup({ show, ...props }) {
//   const [isVisible, setIsVisible] = useState(show);
//   return (
//     <SuccessPopup
//       isVisible={isVisible}
//       onClose={() => setIsVisible(false)}
//       {...props}
//     />
//   );
// }
'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Props for SuccessPopup. Note: onClose must only be passed from a client component.
 * Do NOT use this component directly in a server component or pass onClose from server context.
 *
 * If you see a serialization error, wrap this component in a client component and pass onClose from there.
 * See: https://nextjs.org/docs/messages/client-component-serialization
 */
interface SuccessPopupProps {
  isVisible: boolean
  /**
   * onClose must be a client-side handler. Do not pass from server components.
   */
  onClose: () => void
  title: string
  message: string
  redirectTo: string
  userRole?: string
  className?: string
  /**
   * Custom message to show while redirecting (optional)
   */
  redirectMessage?: string
}


export function SuccessPopup({
  isVisible,
  onClose,
  title,
  message,
  redirectTo,
  userRole,
  className,
  redirectMessage,
  /**
   * Optional: delay in ms before auto-redirect (default: 1200ms)
   */
  redirectDelay = 1200,
  /**
   * Optional: label for the stay button
   */
  stayLabel = 'Stay Here',
  /**
   * Optional: label for the go/redirect button
   */
  goLabel = 'Go Now',
}: SuccessPopupProps & {
  redirectDelay?: number
  stayLabel?: string
  goLabel?: string
}): JSX.Element | null {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [progress, setProgress] = useState(0);
  const popupRef = useState<HTMLDivElement | null>(null)[0];
  // Focus trap: store last focused element
  const [lastActive, setLastActive] = useState<HTMLElement | null>(null);

  // Focus management: focus popup on open
  useEffect(() => {
    if (isVisible) {
      setLastActive(document.activeElement as HTMLElement);
      setTimeout(() => {
        popupRef?.focus();
      }, 0);
    } else if (lastActive) {
      lastActive.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible]);

  // Escape key closes popup
  useEffect(() => {
    if (!isVisible) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isVisible, onClose]);

  // Auto-redirect with progress bar (only once per popup open)
  useEffect(() => {
    if (!isVisible) {
      setIsRedirecting(false);
      setProgress(0);
      return;
    }
    if (isRedirecting) return;
    setProgress(0);
    let didRedirect = false;
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const percent = Math.min(100, (elapsed / redirectDelay) * 100);
      setProgress(percent);
      if (percent >= 100 && !didRedirect) {
        clearInterval(interval);
        setIsRedirecting(true);
        didRedirect = true;
        window.location.href = redirectTo;
      }
    }, 30);
    return () => clearInterval(interval);
  }, [isVisible, isRedirecting, redirectTo, redirectDelay]);

  if (!isVisible) return null;

  const getRoleDisplayName = (role?: string) => {
    switch (role) {
      case 'super-admin':
        return 'Super Administrator';
      case 'admin':
        return 'Administrator';
      case 'learner':
        return 'Learner';
      case 'applicant':
        return 'Applicant';
      default:
        return 'User';
    }
  };

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'super-admin':
        return 'text-coral';
      case 'admin':
        return 'text-blue-600';
      case 'learner':
        return 'text-green-600';
      case 'applicant':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="success-popup-title"
      aria-describedby="success-popup-message"
      tabIndex={-1}
      onClick={e => {
        // Click outside closes
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={popupRef as any}
        className={cn(
          "relative w-full max-w-md mx-4 transform transition-all duration-300 focus:outline-none",
          isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0",
          className
        )}
        tabIndex={0}
        aria-label="Success Dialog"
      >
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-coral p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-lg">
              <CheckCircle className="h-8 w-8 text-coral" />
            </div>
            <h2 id="success-popup-title" className="text-2xl font-bold text-white mb-2">{title}</h2>
            <p id="success-popup-message" className="text-white/90">{message}</p>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                <Loader2 className="h-4 w-4 animate-spin text-coral" />
                <span>{redirectMessage || 'Redirecting to your dashboard...'}</span>
              </div>

              <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                <ArrowRight className="h-3 w-3" />
                <span>You will be taken to your personalized dashboard</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-coral h-2 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${progress}%` }}
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  role="progressbar"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                aria-label={stayLabel}
              >
                {stayLabel}
              </button>
              <button
                onClick={() => {
                  setIsRedirecting(true);
                  window.location.href = redirectTo;
                }}
                disabled={isRedirecting}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-coral rounded-lg hover:bg-coral/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                aria-label={goLabel}
              >
                {isRedirecting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Redirecting...</span>
                  </>
                ) : (
                  <>
                    <span>{goLabel}</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



