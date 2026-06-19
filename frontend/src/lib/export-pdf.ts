/**
 * Client-side PDF export for the active dashboard tab.
 * Uses html2canvas + jsPDF with a white background for readable output on dark theme.
 */

export async function exportElementToPdf(
  element: HTMLElement,
  filename: string,
): Promise<void> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);

  const canvas = await html2canvas(element, {
    backgroundColor: "#ffffff",
    scale: 2,
    useCORS: true,
    logging: false,
    onclone: (_doc, clonedEl) => {
      clonedEl.style.backgroundColor = "#ffffff";
      clonedEl.style.color = "#111827";
      clonedEl.querySelectorAll<HTMLElement>("[class*='bg-slate'], [class*='text-slate']").forEach(
        (node) => {
          if (node.className.includes("bg-slate")) {
            node.style.backgroundColor = "#f8fafc";
          }
          if (node.className.includes("text-white") || node.className.includes("text-slate")) {
            node.style.color = "#1e293b";
          }
        },
      );
    },
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
