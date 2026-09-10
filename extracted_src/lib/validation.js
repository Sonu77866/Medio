export function validatePassword(pw) {
  if (!pw || pw.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(pw)) return "Add an uppercase letter.";
  if (!/[a-z]/.test(pw)) return "Add a lowercase letter.";
  if (!/\d/.test(pw)) return "Add a number.";
  if (!/[^A-Za-z0-9]/.test(pw)) return "Add a special character.";
  return null;
}

export function passwordChecklist(pw) {
  return [
    { ok: (pw || "").length >= 8, label: "8+ characters" },
    { ok: /[A-Z]/.test(pw || ""), label: "Uppercase" },
    { ok: /[a-z]/.test(pw || ""), label: "Lowercase" },
    { ok: /\d/.test(pw || ""), label: "Number" },
    { ok: /[^A-Za-z0-9]/.test(pw || ""), label: "Special character" },
  ];
}
