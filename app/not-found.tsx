import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0f24] text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-5">
        <div className="h-16 w-16 mx-auto rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-3xl font-black font-mono">
          404
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-black text-white">Page Not Found</h2>
          <p className="text-xs text-slate-400">
            The requested page does not exist or has been moved.
          </p>
        </div>
        <Link
          href="/"
          className="inline-block py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs transition-all shadow-lg shadow-indigo-600/30"
        >
          Return to MaheHub Home
        </Link>
      </div>
    </div>
  );
}
