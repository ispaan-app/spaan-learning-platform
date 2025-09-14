'use client'

import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

interface StepperProps {
  currentStep: number
  totalSteps: number
  steps: {
    title: string
    description: string
  }[]
  className?: string
}

export function Stepper({ currentStep, totalSteps, steps, className }: StepperProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1
          const isCompleted = stepNumber < currentStep
          const isCurrent = stepNumber === currentStep
          const isUpcoming = stepNumber > currentStep

          return (
            <div key={stepNumber} className="flex flex-col items-center flex-1">
              {/* Step Circle */}
              <div className={cn(
                "flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 transition-all duration-200",
                isCompleted && "bg-green-500 border-green-500 text-white",
                isCurrent && "bg-blue-500 border-blue-500 text-white",
                isUpcoming && "bg-gray-100 border-gray-300 text-gray-400"
              )}>
                {isCompleted ? (
                  <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <span className="text-xs sm:text-sm font-semibold">{stepNumber}</span>
                )}
              </div>

              {/* Step Title */}
              <div className="mt-1 sm:mt-2 text-center">
                <p className={cn(
                  "text-xs sm:text-sm font-medium",
                  isCompleted && "text-green-600",
                  isCurrent && "text-blue-600",
                  isUpcoming && "text-gray-400"
                )}>
                  {step.title}
                </p>
                <p className={cn(
                  "text-xs mt-1 hidden sm:block",
                  isCompleted && "text-green-500",
                  isCurrent && "text-blue-500",
                  isUpcoming && "text-gray-400"
                )}>
                  {step.description}
                </p>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className={cn(
                  "absolute top-5 left-1/2 w-full h-0.5 -z-10",
                  isCompleted ? "bg-green-500" : "bg-gray-200"
                )} style={{ width: 'calc(100% - 2.5rem)', left: 'calc(50% + 1.25rem)' }} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
