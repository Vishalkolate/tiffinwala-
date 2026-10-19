import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-[65vh] items-center justify-center bg-orange-50/40 px-5 py-16 text-center">
      <div>
        <p className="text-7xl font-extrabold text-orange-600">404</p>
        <h1 className="mt-4 text-3xl font-bold text-gray-900">
          Page Not Found
        </h1>
        <p className="mt-3 text-gray-600">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <Link
          to="/"
          className="mt-7 inline-flex items-center gap-2 rounded-xl bg-orange-600 px-6 py-3 font-bold text-white hover:bg-orange-700"
        >
          <ArrowLeft size={18} /> Back to Home
        </Link>
      </div>
    </main>
  );
}