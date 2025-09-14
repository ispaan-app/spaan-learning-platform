import { redirect } from 'next/navigation'

export default function SuperAdminPage() {
  // Redirect to dashboard
  redirect('/super-admin/dashboard')
}