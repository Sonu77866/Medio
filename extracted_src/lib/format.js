export function fmtDateTime(d) {
  try {
    return new Date(d).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return d;
  }
}
