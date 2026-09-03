export function stripTags(html: string | null | undefined): string {
  if (!html) return "";
  return String(html)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?row>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\{\{[^}]+\}\}/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function substitutePlaceholders(
  desc: string | null | undefined,
  vars: Record<string, unknown> | null | undefined,
): string {
  if (!desc) return "";
  let text = desc;
  for (const [key, value] of Object.entries(vars || {})) {
    if (key.startsWith("{")) continue;
    const numeric = typeof value === "number" ? value : Number(value);
    const pretty =
      typeof value === "number"
        ? Number.isInteger(value)
          ? String(value)
          : String(Math.round(value * 1000) / 1000)
        : String(value);
    text = text.replaceAll(`@${key}@`, pretty);
    if (!Number.isNaN(numeric)) {
      text = text.replaceAll(`@${key}*100@`, String(Math.round(numeric * 100)));
    }
  }
  return stripTags(text.replace(/@[^@]+@/g, "?"));
}

export function matchesQuery(query: string, ...fields: Array<string | number | undefined>): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return fields.some((field) => String(field ?? "").toLowerCase().includes(needle));
}

export function formatRole(role: string): string {
  if (!role) return "";
  return role.replace(/([a-z])([A-Z])/g, "$1 $2");
}
