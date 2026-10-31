import React from "react";
import { Link } from "react-router-dom";
import { Home, ArrowLeft, SearchX } from "lucide-react";
import { motion } from "framer-motion";

const NotFound = () => {
  return (
    <div className="flex min-h-screen items-center justify-center overflow-hidden bg-[var(--color-background)] px-4">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-orange-50 via-white to-transparent" />

      <div className="absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 rounded-full bg-orange-200/30 blur-3xl" />

      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.5,
        }}
        className="relative w-full max-w-lg rounded-3xl border border-gray-200 bg-[var(--color-surface)] p-10 text-center shadow-xl"
      >
        <motion.div
          initial={{
            scale: 0.8,
          }}
          animate={{
            scale: 1,
          }}
          transition={{
            duration: 0.4,
          }}
          className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-orange-100"
        >
          <SearchX size={48} className="text-orange-500" />
        </motion.div>

        <h1 className="text-7xl font-bold text-orange-500">404</h1>

        <h2 className="mt-4 text-2xl font-semibold">Page Not Found</h2>

        <p className="mt-3 text-sm text-[var(--color-text-muted)]">
          The page you are looking for does not exist, has been moved, or is
          temporarily unavailable.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-sm bg-orange-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-600"
          >
            <Home size={16} />
            Back to Dashboard
          </Link>

          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 rounded-sm border border-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            <ArrowLeft size={16} />
            Go Back
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
