export default function Loading() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full border-4 border-indigo-600 border-t-transparent w-12 h-12"></div>
        <p className="mt-4 text-slate-600 animate-pulse">Loading Pokemon data...</p>
      </div>
    </div>
  );
}
