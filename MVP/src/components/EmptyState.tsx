"use client";

interface EmptyStateProps {
  type: "no-streamers" | "no-live";
}

export function EmptyState({ type }: EmptyStateProps) {
  if (type === "no-streamers") {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-600">
        <p className="font-medium">Aucun streamer dans la liste</p>
        <p className="mt-2 text-sm">
          Recherche un streamer ci-dessus pour l&apos;ajouter à ta watchlist.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-slate-600">
      <p className="font-medium">Aucun streamer en direct</p>
      <p className="mt-2 text-sm">
        Aucun de tes streamers suivis n&apos;est actuellement en live.
      </p>
    </div>
  );
}
