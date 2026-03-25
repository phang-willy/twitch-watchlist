function Skeleton() {
  return (
    <article className="grid grid-cols-12 items-center gap-2 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-600 dark:bg-slate-700 w-full h-32">
      <div className="col-span-2 flex items-center justify-center">
        <div className="h-12 w-12 animate-pulse rounded-full bg-slate-200 dark:bg-slate-600" />
      </div>

      <div className="col-span-8 min-w-0 space-y-2">
        <div className="h-4 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-600" />
        <div className="h-3 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-600" />
        <div className="h-3 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-600" />
        <div className="h-3 w-28 animate-pulse rounded bg-slate-200 dark:bg-slate-600" />
      </div>

      <div className="col-span-2 grid grid-cols-1 gap-2">
        <div className="h-7 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-600" />
        <div className="h-7 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-600" />
      </div>
    </article>
  );
}

export default Skeleton;