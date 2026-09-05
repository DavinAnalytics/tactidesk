export type UpdateStatus =
  | { state: "available"; version: string }
  | { state: "downloading"; version?: string; percent: number }
  | { state: "ready"; version: string }
  | { state: "needsToken" }
  | { state: "error"; message: string };

export function updateBannerText(status: UpdateStatus): string {
  switch (status.state) {
    case "available":
      return `Update ${status.version} found — downloading…`;
    case "downloading": {
      const percent = Math.max(0, Math.min(100, Math.round(status.percent)));
      return status.version
        ? `Downloading ${status.version}… ${percent}%`
        : `Downloading update… ${percent}%`;
    }
    case "ready":
      return `Update ${status.version} is ready`;
    case "needsToken":
      return "Private repo — paste a GitHub token once to enable updates";
    case "error":
      return status.message;
  }
}

export function previewStatusFromQuery(search: string): UpdateStatus | null {
  const query = search.startsWith("?") ? search.slice(1) : search;
  const value = new URLSearchParams(query).get("update");
  if (value === "ready") return { state: "ready", version: "9.9.9" };
  if (value === "downloading") return { state: "downloading", version: "9.9.9", percent: 42 };
  if (value === "token") return { state: "needsToken" };
  return null;
}

export function isUpdaterAuthError(error: unknown): boolean {
  const text = error instanceof Error ? error.message : String(error ?? "");
  const status =
    error && typeof error === "object" && "statusCode" in error
      ? String((error as { statusCode?: unknown }).statusCode)
      : "";
  return /401|403|404|bad credentials|not found|cannot find channel|unauthorized/i.test(
    `${status} ${text}`,
  );
}
