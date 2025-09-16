export default function LoadingApplicantDetail() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-coral"></div>
      <span className="ml-4 text-coral text-lg font-semibold">Loading applicant details...</span>
    </div>
  );
}
