export function formatViewers(count: number): string {
  if (count >= 1_000_000) {
    const millions = count / 1_000_000;
    return millions >= 10
      ? `${Math.floor(millions)}M`
      : millions >= 1
        ? `${millions.toFixed(1)}M`
        : `${(count / 1_000).toFixed(1)}K`;
  }
  if (count >= 1_000) {
    return count.toLocaleString("fr-FR");
  }
  return count.toString();
}

export function formatStartedAt(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / 3_600_000);

  if (diffHours < 1) return "depuis 1h";
  return `depuis ${diffHours}h`;
}

export function formatTimeAgo(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffHours / 24);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffHours < 24) return `depuis ${diffHours}h`;
  if (diffYears > 0) return `depuis ${diffYears} ${diffYears === 1 ? "an" : "ans"}`;
  if (diffMonths > 0) return `depuis ${diffMonths} mois`;
  return `depuis ${diffDays} ${diffDays === 1 ? "jour" : "jours"}`;
}
