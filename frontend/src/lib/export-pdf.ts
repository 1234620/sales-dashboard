/**
 * Client-side PDF export for the active dashboard tab.
 * Uses html2canvas-pro (supports lab/oklch from Tailwind v4) + jsPDF.
 */

export async function exportElementToPdf(
  element: HTMLElement,
  filename: string,
): Promise<void> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas-pro"),
    import("jspdf"),
  ]);

  const canvas = await html2canvas(element, {
    backgroundColor: "#ffffff",
    scale: 2,
    useCORS: true,
    logging: false,
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({
    orientation: canvas.width > canvas.height ? "landscape" : "portrait",
    unit: "px",
    format: [canvas.width, canvas.height],
  });
  pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
  pdf.save(filename);
}

export function pdfFilename(tab: string): string {
  const date = new Date().toISOString().slice(0, 10);
  return `parasnath-${tab}-${date}.pdf`;
}
