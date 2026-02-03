'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Music2, Check, X, Loader2 } from 'lucide-react';

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

export default function SetupUsernamePage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check username availability with debounce
  useEffect(() => {
    if (!username || !USERNAME_REGEX.test(username)) {
      setIsAvailable(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsChecking(true);
      try {
        const response = await fetch(
          `/api/username/check?username=${encodeURIComponent(username)}`
        );
        const data = await response.json();
        setIsAvailable(data.available);
      } catch {
        setIsAvailable(null);
      } finally {
        setIsChecking(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!USERNAME_REGEX.test(username)) {
      setError('Username must be 3-20 characters, alphanumeric and underscores only');
      return;
    }

    if (!isAvailable) {
      setError('This username is not available');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to set username');
      }

      // Refresh to get new session with username
      router.push('/');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValidFormat = USERNAME_REGEX.test(username);

  return (
    <div className="min-h-screen bg-[#0f1117] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 mb-4">
            <Music2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to Mixolidio</h1>
          <p className="text-gray-400">Choose a username to get started</p>
        </div>

        {/* Form card */}
        <div className="bg-[#1a1d24] rounded-2xl p-8 shadow-xl border border-gray-800">
          <form onSubmit={handleSubmit}>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Username
            </label>

            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                placeholder="your_username"
                className="w-full bg-[#0f1117] border border-gray-700 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors pr-10"
                autoFocus
                disabled={isSubmitting}
              />

              {/* Status indicator */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {isChecking && (
                  <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                )}
                {!isChecking && isValidFormat && isAvailable === true && (
                  <Check className="w-5 h-5 text-green-500" />
                )}
                {!isChecking && isValidFormat && isAvailable === false && (
                  <X className="w-5 h-5 text-red-500" />
                )}
              </div>
            </div>

            {/* Validation hints */}
            <div className="mt-2 text-sm">
              {username && !isValidFormat && (
                <p className="text-amber-500">
                  3-20 characters, letters, numbers, and underscores only
                </p>
              )}
              {isValidFormat && isAvailable === false && (
                <p className="text-red-500">This username is already taken</p>
              )}
              {isValidFormat && isAvailable === true && (
                <p className="text-green-500">Username is available!</p>
              )}
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!isValidFormat || !isAvailable || isSubmitting}
              className="w-full mt-6 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Setting up...
                </>
              ) : (
                'Continue'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
