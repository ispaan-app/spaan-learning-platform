import { redirect } from 'next/navigation'

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // This layout ensures the redirect works properly
  return <>{children}</>
}


















