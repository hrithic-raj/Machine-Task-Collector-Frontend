'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth';
import Button from '../../components/ui/Button';

export default function WaitingForApprovalPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Don't redirect while auth check is in progress
    if (loading) {
      return;
    }
    // If no user (not authenticated), redirect to login
    if (!user) {
      router.push('/login');
    } else if (user.role !== 'intern' || user.isApproved) {
      // If user is not an intern or already approved, redirect to dashboard
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100">
            <svg
              className="h-8 w-8 text-yellow-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Account Pending Approval
        </h1>

        <p className="text-gray-600 mb-6">
          Thank you for registering, <span className="font-semibold">{user.name}</span>!
          Your email has been verified, but your account requires administrator approval before you can access the dashboard.
        </p>

        <p className="text-sm text-gray-500 mb-6">
          You will be notified once your account is approved. This usually takes 1-2 business days.
        </p>

        <div className="border-t pt-6">
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
