import React from 'react';
import { notFound } from 'next/navigation';

interface ApplicantDetailPageProps {
  params: { id: string }
}

// TODO: Replace with real data fetching logic
async function getApplicantById(id: string) {
  // Simulate fetch; replace with actual DB/API call
  return null;
}

export default async function ApplicantDetailPage({ params }: ApplicantDetailPageProps) {
  const { id } = params;
  const applicant = await getApplicantById(id);

  if (!applicant) {
    notFound();
  }

  return (
    <main className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">Applicant Details</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-700">Applicant ID: <span className="font-mono">{id}</span></p>
        {/* Add more applicant details here */}
      </div>
    </main>
  );
}
