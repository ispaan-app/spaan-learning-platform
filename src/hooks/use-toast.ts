'use client'

import { toast as sonnerToast } from 'sonner'
import { useEffect, useState } from 'react'

export function useToast() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toast = {
    success: (message: string) => {
      if (mounted) {
        sonnerToast.success(message)
      } else {
        console.log('Success:', message)
      }
    },
    error: (message: string) => {
      if (mounted) {
        sonnerToast.error(message)
      } else {
        console.error('Error:', message)
      }
    },
    info: (message: string) => {
      if (mounted) {
        sonnerToast.info(message)
      } else {
        console.log('Info:', message)
      }
    },
    warning: (message: string) => {
      if (mounted) {
        sonnerToast.warning(message)
      } else {
        console.log('Warning:', message)
      }
    }
  }

  return toast
}