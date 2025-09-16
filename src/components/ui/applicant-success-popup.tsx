// 'use client'
import { useState } from 'react';
import { SuccessPopup } from './success-popup';

interface ApplicantSuccessPopupProps {
  show: boolean;
  title: string;
  message: string;
  redirectTo: string;
  userRole?: string;
  className?: string;
}

export function ApplicantSuccessPopup({ show, title, message, redirectTo, userRole, className }: ApplicantSuccessPopupProps) {
  const [isVisible, setIsVisible] = useState(show);
  return (
    <SuccessPopup
      isVisible={isVisible}
      onClose={() => setIsVisible(false)}
      title={title}
      message={message}
      redirectTo={redirectTo}
      userRole={userRole}
      className={className}
    />
  );
}
