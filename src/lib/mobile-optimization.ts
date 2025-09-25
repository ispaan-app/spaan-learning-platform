import React from 'react'

// Mobile optimization service for touch interactions, responsive design, and mobile-specific features
export class MobileOptimizationService {
  // Touch interaction utilities
  static setupTouchOptimization(element: HTMLElement) {
    // Add touch-friendly classes
    element.classList.add('touch-manipulation')
    
    // Prevent zoom on double tap
    element.addEventListener('touchstart', (e) => {
      if (e.touches.length > 1) {
        e.preventDefault()
      }
    }, { passive: false })

    // Handle touch gestures
    let startX = 0
    let startY = 0
    let startTime = 0

    element.addEventListener('touchstart', (e) => {
      const touch = e.touches[0]
      startX = touch.clientX
      startY = touch.clientY
      startTime = Date.now()
    })

    element.addEventListener('touchend', (e) => {
      const touch = e.changedTouches[0]
      const endX = touch.clientX
      const endY = touch.clientY
      const endTime = Date.now()
      
      const deltaX = endX - startX
      const deltaY = endY - startY
      const deltaTime = endTime - startTime
      
      // Detect swipe gestures
      if (deltaTime < 300) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          if (deltaX > 50) {
            this.handleSwipe('right', element)
          } else if (deltaX < -50) {
            this.handleSwipe('left', element)
          }
        } else {
          if (deltaY > 50) {
            this.handleSwipe('down', element)
          } else if (deltaY < -50) {
            this.handleSwipe('up', element)
          }
        }
      }
    })
  }

  private static handleSwipe(direction: 'up' | 'down' | 'left' | 'right', element: HTMLElement) {
    const event = new CustomEvent('swipe', {
      detail: { direction, element }
    })
    element.dispatchEvent(event)
  }

  // Camera capture optimization for mobile
  static optimizeCameraCapture(video: HTMLVideoElement, constraints: MediaStreamConstraints = {}) {
    const videoConstraints = typeof constraints.video === 'object' && constraints.video !== null 
      ? constraints.video 
      : {}
    
    const mobileConstraints: MediaStreamConstraints = {
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: 'environment', // Use back camera on mobile
        ...videoConstraints
      },
      audio: false
    }

    return navigator.mediaDevices.getUserMedia(mobileConstraints)
  }

  // QR Scanner optimization for mobile
  static setupMobileQRScanner(canvas: HTMLCanvasElement, video: HTMLVideoElement) {
    // Set up mobile-optimized canvas
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Optimize for mobile performance
    canvas.style.width = '100%'
    canvas.style.height = 'auto'
    canvas.style.maxWidth = '400px'
    canvas.style.maxHeight = '400px'

    // Add mobile-specific styling
    canvas.style.borderRadius = '8px'
    canvas.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)'

    return {
      drawFrame: (videoElement: HTMLVideoElement) => {
        if (videoElement.readyState === videoElement.HAVE_ENOUGH_DATA) {
          const aspectRatio = videoElement.videoWidth / videoElement.videoHeight
          const canvasWidth = Math.min(400, window.innerWidth - 32)
          const canvasHeight = canvasWidth / aspectRatio

          canvas.width = canvasWidth
          canvas.height = canvasHeight

          ctx.drawImage(videoElement, 0, 0, canvasWidth, canvasHeight)
        }
      }
    }
  }

  // Responsive breakpoint utilities
  static getBreakpoint(): 'mobile' | 'tablet' | 'desktop' {
    if (typeof window === 'undefined') return 'desktop'

    const width = window.innerWidth
    if (width < 768) return 'mobile'
    if (width < 1024) return 'tablet'
    return 'desktop'
  }

  static isMobile(): boolean {
    return this.getBreakpoint() === 'mobile'
  }

  static isTablet(): boolean {
    return this.getBreakpoint() === 'tablet'
  }

  static isDesktop(): boolean {
    return this.getBreakpoint() === 'desktop'
  }

  // Viewport utilities
  static getViewportHeight(): number {
    if (typeof window === 'undefined') return 0
    return window.innerHeight
  }

  static getViewportWidth(): number {
    if (typeof window === 'undefined') return 0
    return window.innerWidth
  }

  // Safe area utilities for notched devices
  static getSafeAreaInsets() {
    if (typeof window === 'undefined') return { top: 0, right: 0, bottom: 0, left: 0 }

    const computedStyle = getComputedStyle(document.documentElement)
    return {
      top: parseInt(computedStyle.getPropertyValue('--safe-area-inset-top') || '0'),
      right: parseInt(computedStyle.getPropertyValue('--safe-area-inset-right') || '0'),
      bottom: parseInt(computedStyle.getPropertyValue('--safe-area-inset-bottom') || '0'),
      left: parseInt(computedStyle.getPropertyValue('--safe-area-inset-left') || '0')
    }
  }

  // Touch target size optimization
  static ensureTouchTargetSize(element: HTMLElement, minSize: number = 44) {
    const rect = element.getBoundingClientRect()
    const currentSize = Math.min(rect.width, rect.height)
    
    if (currentSize < minSize) {
      const scale = minSize / currentSize
      element.style.transform = `scale(${scale})`
      element.style.transformOrigin = 'center'
    }
  }

  // Mobile-specific form optimizations
  static optimizeFormForMobile(form: HTMLFormElement) {
    // Set appropriate input types for mobile keyboards
    const inputs = form.querySelectorAll('input')
    inputs.forEach(input => {
      switch (input.name) {
        case 'email':
          input.type = 'email'
          input.inputMode = 'email'
          break
        case 'phone':
          input.type = 'tel'
          input.inputMode = 'tel'
          break
        case 'idNumber':
          input.type = 'text'
          input.inputMode = 'numeric'
          input.pattern = '[0-9]{13}'
          break
        case 'postalCode':
          input.type = 'text'
          input.inputMode = 'numeric'
          input.pattern = '[0-9]{4}'
          break
      }
    })

    // Add mobile-specific validation
    form.addEventListener('submit', (e) => {
      this.validateMobileForm(form)
    })
  }

  private static validateMobileForm(form: HTMLFormElement) {
    const inputs = form.querySelectorAll('input[required]')
    let isValid = true

    inputs.forEach(input => {
      const inputElement = input as HTMLInputElement
      if (!inputElement.value.trim()) {
        isValid = false
        this.showMobileValidationError(inputElement, 'This field is required')
      } else {
        this.clearMobileValidationError(inputElement)
      }
    })

    if (!isValid) {
      // Focus first invalid input
      const firstInvalid = form.querySelector('.mobile-validation-error') as HTMLElement
      if (firstInvalid) {
        firstInvalid.focus()
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }

    return isValid
  }

  private static showMobileValidationError(input: HTMLInputElement, message: string) {
    input.classList.add('mobile-validation-error', 'border-red-500')
    
    // Remove existing error message
    const existingError = input.parentElement?.querySelector('.mobile-error-message')
    if (existingError) {
      existingError.remove()
    }

    // Add new error message
    const errorDiv = document.createElement('div')
    errorDiv.className = 'mobile-error-message text-red-500 text-sm mt-1'
    errorDiv.textContent = message
    input.parentElement?.appendChild(errorDiv)
  }

  private static clearMobileValidationError(input: HTMLInputElement) {
    input.classList.remove('mobile-validation-error', 'border-red-500')
    const errorMessage = input.parentElement?.querySelector('.mobile-error-message')
    if (errorMessage) {
      errorMessage.remove()
    }
  }

  // Mobile navigation optimization
  static setupMobileNavigation(navElement: HTMLElement) {
    // Add mobile menu toggle
    const toggleButton = navElement.querySelector('[data-mobile-menu-toggle]') as HTMLButtonElement
    const menu = navElement.querySelector('[data-mobile-menu]') as HTMLElement

    if (toggleButton && menu) {
      toggleButton.addEventListener('click', () => {
        const isOpen = menu.classList.contains('mobile-menu-open')
        
        if (isOpen) {
          this.closeMobileMenu(menu)
        } else {
          this.openMobileMenu(menu)
        }
      })

      // Close menu when clicking outside
      document.addEventListener('click', (e) => {
        if (!navElement.contains(e.target as Node)) {
          this.closeMobileMenu(menu)
        }
      })

      // Close menu on escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.closeMobileMenu(menu)
        }
      })
    }
  }

  private static openMobileMenu(menu: HTMLElement) {
    menu.classList.add('mobile-menu-open')
    menu.setAttribute('aria-expanded', 'true')
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden'
    
    // Focus first menu item
    const firstMenuItem = menu.querySelector('a, button') as HTMLElement
    if (firstMenuItem) {
      firstMenuItem.focus()
    }
  }

  private static closeMobileMenu(menu: HTMLElement) {
    menu.classList.remove('mobile-menu-open')
    menu.setAttribute('aria-expanded', 'false')
    
    // Restore body scroll
    document.body.style.overflow = ''
  }

  // Mobile performance optimization
  static optimizeForMobile() {
    // Reduce animations on mobile
    if (this.isMobile()) {
      document.documentElement.style.setProperty('--animation-duration', '0.2s')
      document.documentElement.style.setProperty('--transition-duration', '0.15s')
    }

    // Optimize images for mobile
    const images = document.querySelectorAll('img')
    images.forEach(img => {
      if (this.isMobile()) {
        img.loading = 'lazy'
        img.decoding = 'async'
      }
    })

    // Add mobile-specific CSS classes
    document.documentElement.classList.add(`breakpoint-${this.getBreakpoint()}`)
    
    // Listen for orientation changes
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        document.documentElement.classList.remove('breakpoint-mobile', 'breakpoint-tablet', 'breakpoint-desktop')
        document.documentElement.classList.add(`breakpoint-${this.getBreakpoint()}`)
      }, 100)
    })
  }

  // Mobile-specific event handlers
  static setupMobileEventHandlers() {
    // Prevent zoom on form inputs
    const inputs = document.querySelectorAll('input, select, textarea')
    inputs.forEach(input => {
      input.addEventListener('focus', () => {
        if (this.isMobile()) {
          // Small delay to prevent zoom
          setTimeout(() => {
            (input as HTMLElement).style.fontSize = '16px'
          }, 100)
        }
      })
    })

    // Handle mobile-specific gestures
    document.addEventListener('touchstart', (e) => {
      // Add touch class for CSS styling
      document.body.classList.add('touch-device')
    }, { once: true })

    // Remove touch class on mouse interaction
    document.addEventListener('mousedown', () => {
      document.body.classList.remove('touch-device')
    }, { once: true })
  }
}

// React hook for mobile optimization
export function useMobileOptimization() {
  const [isMobile, setIsMobile] = React.useState(false)
  const [isTablet, setIsTablet] = React.useState(false)
  const [isDesktop, setIsDesktop] = React.useState(false)

  React.useEffect(() => {
    const updateBreakpoint = () => {
      setIsMobile(MobileOptimizationService.isMobile())
      setIsTablet(MobileOptimizationService.isTablet())
      setIsDesktop(MobileOptimizationService.isDesktop())
    }

    updateBreakpoint()
    window.addEventListener('resize', updateBreakpoint)
    window.addEventListener('orientationchange', updateBreakpoint)

    return () => {
      window.removeEventListener('resize', updateBreakpoint)
      window.removeEventListener('orientationchange', updateBreakpoint)
    }
  }, [])

  return {
    isMobile,
    isTablet,
    isDesktop,
    breakpoint: MobileOptimizationService.getBreakpoint(),
    viewportHeight: MobileOptimizationService.getViewportHeight(),
    viewportWidth: MobileOptimizationService.getViewportWidth(),
    safeAreaInsets: MobileOptimizationService.getSafeAreaInsets()
  }
}

// Mobile-specific CSS utilities
export const mobileCSS = {
  // Touch-friendly button styles
  touchButton: `
    min-height: 44px;
    min-width: 44px;
    padding: 12px 16px;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
  `,
  
  // Mobile form styles
  mobileForm: `
    input, select, textarea {
      font-size: 16px; /* Prevents zoom on iOS */
      padding: 12px;
      border-radius: 8px;
      border: 1px solid #d1d5db;
    }
    
    input:focus, select:focus, textarea:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
  `,
  
  // Mobile navigation styles
  mobileNav: `
    .mobile-menu {
      position: fixed;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100vh;
      background: white;
      transition: left 0.3s ease;
      z-index: 50;
    }
    
    .mobile-menu-open {
      left: 0;
    }
    
    @media (min-width: 768px) {
      .mobile-menu {
        position: static;
        left: auto;
        width: auto;
        height: auto;
        background: transparent;
      }
    }
  `
}

export default MobileOptimizationService
