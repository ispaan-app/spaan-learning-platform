'use client'

import dynamic from 'next/dynamic'
import { Toaster as Sonner } from 'sonner'

type ToasterProps = React.ComponentProps<typeof Sonner>

const ToasterComponent = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-white group-[.toaster]:text-slate-950 group-[.toaster]:border-slate-200 group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-slate-500',
          actionButton:
            'group-[.toast]:bg-slate-900 group-[.toast]:text-slate-50',
          cancelButton:
            'group-[.toast]:bg-slate-100 group-[.toast]:text-slate-500',
        },
      }}
      {...props}
    />
  )
}

// Dynamic import to prevent SSR issues
const Toaster = dynamic(() => Promise.resolve(ToasterComponent), {
  ssr: false,
  loading: () => null,
})

export { Toaster }


