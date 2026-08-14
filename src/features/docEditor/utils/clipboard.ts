export async function copyToClipboard(
  text: string,
): Promise<void> {
  if (!navigator?.clipboard?.writeText) {
    throw new Error("Clipboard API is not available");
  }

  await navigator.clipboard.writeText(text);
}