import { redirect } from 'next/navigation'

export default function LearnerPage() {
  // Redirect to the dashboard page
  redirect('/learner/dashboard')
}
