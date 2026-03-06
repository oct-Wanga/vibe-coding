import Link from "next/link";

export default function NotFound() {
  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold">Projects not found</h2>
      <p className="mt-2 text-sm text-gray-600">The requested project resource does not exist.</p>
      <Link className="mt-4 inline-block text-sm underline" href="/dashboard">
        Go back
      </Link>
    </div>
  );
}
