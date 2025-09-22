import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
// import '@/lib/polyfills' // Temporarily disabled for build
import { AuthProvider } from '@/contexts/AuthContext'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { AppErrorBoundary } from '@/components/AppErrorBoundary'
import { ConnectionStatus } from '@/components/ui/connection-status'
import { Toaster } from '@/components/ui/toaster'
import { ThemeProvider } from '@/components/theme-provider'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  fallback: ['system-ui', 'arial']
})

export const metadata: Metadata = {
  title: 'iSpaan',
  description: 'A comprehensive monitoring platform with AI-powered features for students, applicants, and administrators.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-16x16.svg', type: 'image/svg+xml', sizes: '16x16' },
    ],
    apple: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.svg',
  },
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon-16x16.svg" type="image/svg+xml" sizes="16x16" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Suppress Grammarly extension attributes
              if (typeof window !== 'undefined') {
                const observer = new MutationObserver((mutations) => {
                  mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes') {
                      const target = mutation.target;
                      if (target.nodeType === Node.ELEMENT_NODE) {
                        const element = target;
                        if (element.hasAttribute('data-new-gr-c-s-check-loaded') || 
                            element.hasAttribute('data-gr-ext-installed')) {
                          element.removeAttribute('data-new-gr-c-s-check-loaded');
                          element.removeAttribute('data-gr-ext-installed');
                        }
                      }
                    }
                  });
                });
                observer.observe(document.body, { attributes: true, subtree: true });
              }
            `,
          }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider>
          <AppErrorBoundary>
            <ErrorBoundary>
              <AuthProvider>
                <ConnectionStatus />
                {children}
                <Toaster />
              </AuthProvider>
            </ErrorBoundary>
          </AppErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  )
}
