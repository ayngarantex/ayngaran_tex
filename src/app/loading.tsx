export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-6 p-4">
      {/* Outer spinning ring matching brand colors */}
      <div className="relative flex items-center justify-center">
        <div className="h-20 w-20 animate-spin rounded-full border-4 border-slate-200 border-t-red-600 border-r-slate-900"></div>
        {/* Inner pulsing Ganesha/Ayngaran core dot */}
        <div className="absolute h-6 w-6 animate-pulse rounded-full bg-amber-500"></div>
      </div>
      
      {/* Loading message */}
      <div className="text-center">
        <h2 className="text-lg font-black text-slate-900 tracking-wide">
          Ayngaran Tex
        </h2>
        <p className="text-xs text-slate-500 font-semibold tracking-widest uppercase mt-1">
          Premium Weaving & Fabrics
        </p>
        <p className="text-xs text-slate-400 font-medium mt-3 animate-pulse">
          Loading catalog...
        </p>
      </div>
    </div>
  );
}
