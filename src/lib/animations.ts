// Animation utility functions and constants for consistent animations across the app

export const ANIMATION_DELAYS = {
  immediate: 0,
  fast: 100,
  normal: 200,
  slow: 300,
  slower: 500,
  slowest: 700,
} as const

export const ANIMATION_DURATIONS = {
  fast: 150,
  normal: 200,
  slow: 300,
  slower: 400,
} as const

// Staggered animation delays for lists
export const getStaggeredDelay = (index: number, baseDelay: number = 100) => 
  index * baseDelay

// Page transition animations
export const PAGE_ANIMATIONS = {
  fadeIn: 'animate-in fade-in duration-200',
  slideInFromTop: 'animate-in slide-in-from-top duration-300',
  slideInFromBottom: 'animate-in slide-in-from-bottom duration-300',
  slideInFromLeft: 'animate-in slide-in-from-left duration-300',
  slideInFromRight: 'animate-in slide-in-from-right duration-300',
  zoomIn: 'animate-in zoom-in duration-300',
} as const

// Card animations
export const CARD_ANIMATIONS = {
  hover: 'hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ease-out',
  hoverScale: 'hover:scale-[1.02] transition-transform duration-200 ease-out',
  hoverSlide: 'hover:-translate-x-0.5 transition-transform duration-200 ease-out',
  entrance: 'animate-in slide-in-from-bottom duration-200',
} as const

// Button animations
export const BUTTON_ANIMATIONS = {
  hover: 'hover:shadow-sm hover:-translate-y-0.5 transition-all duration-150 ease-out',
  active: 'active:scale-[0.98] transition-transform duration-100 ease-out',
  loading: 'animate-pulse',
} as const

// Icon animations
export const ICON_ANIMATIONS = {
  hover: 'hover:scale-105 transition-transform duration-200 ease-out',
  spin: 'animate-spin',
  pulse: 'animate-pulse',
  bounce: 'animate-bounce',
} as const

// Text animations
export const TEXT_ANIMATIONS = {
  fadeIn: 'animate-in fade-in duration-200',
  slideIn: 'animate-in slide-in-from-left duration-300',
  typewriter: 'animate-in slide-in-from-right duration-400',
} as const

// List animations
export const LIST_ANIMATIONS = {
  stagger: (index: number) => ({
    className: 'animate-in slide-in-from-bottom duration-200',
    style: { animationDelay: `${getStaggeredDelay(index, 50)}ms` }
  }),
  fadeIn: (index: number) => ({
    className: 'animate-in fade-in duration-200',
    style: { animationDelay: `${getStaggeredDelay(index, 25)}ms` }
  }),
} as const

// Loading animations
export const LOADING_ANIMATIONS = {
  spinner: 'animate-spin',
  pulse: 'animate-pulse',
  bounce: 'animate-bounce',
  ping: 'animate-ping',
} as const

// Status indicator animations
export const STATUS_ANIMATIONS = {
  success: 'animate-in zoom-in duration-500',
  warning: 'animate-in slide-in-from-left duration-300',
  error: 'animate-in shake duration-500',
  info: 'animate-in fade-in duration-300',
} as const

// Chart animations
export const CHART_ANIMATIONS = {
  bar: 'animate-in slide-in-from-bottom duration-700',
  line: 'animate-in slide-in-from-left duration-1000',
  pie: 'animate-in zoom-in duration-800',
} as const

// Modal animations
export const MODAL_ANIMATIONS = {
  backdrop: 'animate-in fade-in duration-300',
  content: 'animate-in zoom-in duration-300',
  slideUp: 'animate-in slide-in-from-bottom duration-300',
} as const

// Navigation animations
export const NAV_ANIMATIONS = {
  item: (index: number) => ({
    className: 'animate-in slide-in-from-left duration-500',
    style: { animationDelay: `${getStaggeredDelay(index, 50)}ms` }
  }),
  active: 'animate-in slide-in-from-right duration-300',
} as const

// Form animations
export const FORM_ANIMATIONS = {
  field: 'animate-in slide-in-from-bottom duration-500',
  error: 'animate-in shake duration-300',
  success: 'animate-in zoom-in duration-300',
} as const

// Utility function to combine animations
export const combineAnimations = (...animations: string[]) => 
  animations.join(' ')

// Utility function to create custom animation delays
export const createAnimationDelay = (delay: number) => ({
  style: { animationDelay: `${delay}ms` }
})

// Utility function for conditional animations
export const conditionalAnimation = (condition: boolean, animation: string) =>
  condition ? animation : ''

// Predefined animation sequences for common UI patterns
export const ANIMATION_SEQUENCES = {
  pageLoad: [
    'animate-in fade-in duration-200',
    'animate-in slide-in-from-top duration-300 delay-100',
    'animate-in slide-in-from-bottom duration-300 delay-200',
  ],
  cardGrid: (index: number) => [
    'animate-in slide-in-from-bottom duration-200',
    createAnimationDelay(getStaggeredDelay(index, 50))
  ],
  listItems: (index: number) => [
    'animate-in slide-in-from-left duration-200',
    createAnimationDelay(getStaggeredDelay(index, 25))
  ],
  dashboard: [
    'animate-in fade-in duration-200',
    'animate-in slide-in-from-left duration-300 delay-100',
    'animate-in slide-in-from-right duration-300 delay-200',
    'animate-in slide-in-from-bottom duration-300 delay-300',
  ],
} as const




