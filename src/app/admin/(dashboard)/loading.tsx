export default function Loading() {
  return (
    <div className="flex h-[70vh] w-full flex-col items-center justify-center gap-6 rounded-2xl bg-white/40 backdrop-blur-md border border-slate-100/50 shadow-xs">
      {/* Outer spinning ring with gradient-like colors */}
      <div className="relative flex items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-slate-100 border-t-red-600 border-r-amber-500"></div>
        {/* Inner pulsing core dot */}
        <div className="absolute h-4 w-4 animate-pulse rounded-full bg-slate-900"></div>
      </div>

      {/* Loading message */}
      <div className="text-center">
        <h3 className="text-base font-extrabold text-slate-800 tracking-wider animate-pulse">
          Loading Content
        </h3>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Fetching latest workspace records...
        </p>
      </div>
    </div>
  );
}
