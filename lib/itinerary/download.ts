/** Saves the PDF on the visitor's device (phone, tablet or computer). The file never leaves the browser. */
export function downloadPdf(bytes: Uint8Array, fileName: string): boolean {
  try {
    const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type: "application/pdf" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
    return true;
  } catch {
    return false;
  }
}
