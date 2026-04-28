/**
 * Obfuskacja adresu e-mail przed spam-botami.
 * Adres jest składany z części dopiero w runtime – w źródle HTML
 * nigdy nie występuje jako pełny, czysty string.
 */
const PARTS = ["mail", "@", "fpvlab", ".pl"];

export function getEmail(): string {
  return PARTS.join("");
}

export function getMailtoHref(subject?: string): string {
  const base = "mailto:" + getEmail();
  return subject ? `${base}?subject=${encodeURIComponent(subject)}` : base;
}
