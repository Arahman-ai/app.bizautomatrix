import Link from "next/link";

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Payment Successful!
        </h1>
        <p className="text-gray-600 mb-8">
          Welcome to BizAutomatrix. Your account has been upgraded and is ready to use.
        </p>
        <Link
          href="/dashboard"
          className="inline-block bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
        >
          Go to Dashboard →
        </Link>
      </div>
    </div>
  );
}
