"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold">Something went wrong</h2>
      <p className="mt-2 text-sm text-gray-600">{error.message}</p>
      <button className="mt-4 rounded bg-black px-3 py-2 text-sm text-white" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
