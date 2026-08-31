import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import JSZip from 'jszip';
import { BlockData, DashboardSummary } from '../types';

/**
 * Formats a block name safely for filenames.
 */
export function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9_-]/g, '_');
}

/**
 * Creates a jsPDF document for a single Block.
 */
export function createBlockPdfDoc(
  block: BlockData,
  headers: string[],
  districtName: string = 'Banka',
  stateName: string = 'Bihar',
  metaDateStr: string = '31-08-2026'
): jsPDF {
  // Use landscape if more than 5 columns, else portrait
  const isLandscape = headers.length > 5;
  const doc = new jsPDF({
    orientation: isLandscape ? 'landscape' : 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 14;

  // Header Banner
  doc.setFillColor(30, 58, 138); // Deep Navy (#1e3a8a)
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Accent gold line
  doc.setFillColor(217, 119, 6); // Amber (#d97706)
  doc.rect(0, 27.5, pageWidth, 1.5, 'F');

  // Title in Header
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('INSPIRE AWARD — BLOCKWISE PENDING SCHOOL COUNT', marginX, 12);

  // Subtitle in Header
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(226, 232, 240);
  doc.text(`District: ${districtName} | State: ${stateName} | Status As On: ${metaDateStr}`, marginX, 19);
  doc.text('Education Department / Bihar Shiksha Pariyojna', marginX, 24);

  // Info Box / Meta Summary on page
  const infoBoxY = 34;
  doc.setDrawColor(203, 213, 225); // Slate 300
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.roundedRect(marginX, infoBoxY, pageWidth - marginX * 2, 18, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.text(`Block: ${block.name}`, marginX + 6, infoBoxY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105); // Slate 600
  doc.text(`Total Pending Schools: `, marginX + 6, infoBoxY + 13.5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(185, 28, 28); // Dark Red (#b91c1c)
  doc.text(`${block.count} Schools`, marginX + 46, infoBoxY + 13.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  const genTime = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  doc.text(`Generated on: ${genTime}`, pageWidth - marginX - 45, infoBoxY + 10.5);

  // Prepare table data
  const tableHeaders = headers;
  const tableData = block.records.map(rec => {
    return headers.map(h => {
      const val = rec[h];
      return val !== undefined && val !== null ? String(val) : '';
    });
  });

  // Calculate column widths dynamically based on header and orientation
  const autoTableConfig: any = {
    head: [tableHeaders],
    body: tableData,
    startY: infoBoxY + 22,
    margin: { left: marginX, right: marginX, bottom: 18 },
    theme: 'grid',
    showHead: 'everyPage',
    tableWidth: 'auto',
    styles: {
      font: 'helvetica',
      fontSize: 8,
      cellPadding: 2.2,
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
      textColor: [30, 41, 59],
      overflow: 'linebreak',
      valign: 'middle',
    },
    headStyles: {
      fillColor: [30, 58, 138], // Navy
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'left',
      lineWidth: 0.2,
      lineColor: [30, 58, 138],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // Slate 50
    },
    didDrawPage: (data: any) => {
      // Footer with Page Number
      const pageCount = (doc.internal as any).getNumberOfPages();
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Block: ${block.name} — Pending Schools Report | INSPIRE Award Nomination Status`,
        marginX,
        pageHeight - 8
      );
      doc.text(
        `Page ${data.pageNumber} of ${pageCount}`,
        pageWidth - marginX - 18,
        pageHeight - 8
      );

      // Top running small banner on subsequent pages
      if (data.pageNumber > 1) {
        doc.setFillColor(30, 58, 138);
        doc.rect(0, 0, pageWidth, 8, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(255, 255, 255);
        doc.text(
          `INSPIRE AWARD — Block: ${block.name} (Total Pending: ${block.count})`,
          marginX,
          5.5
        );
      }
    },
  };

  autoTable(doc, autoTableConfig);

  return doc;
}

/**
 * Triggers a direct browser download for a single Block PDF.
 */
export function downloadBlockPdf(
  block: BlockData,
  headers: string[],
  districtName?: string,
  stateName?: string,
  metaDateStr?: string
): void {
  const doc = createBlockPdfDoc(block, headers, districtName, stateName, metaDateStr);
  const cleanName = sanitizeFileName(block.name);
  doc.save(`Block_${cleanName}.pdf`);
}

/**
 * Creates a comprehensive District Summary PDF report.
 */
export function downloadDistrictSummaryPdf(
  summary: DashboardSummary,
  blocks: BlockData[],
  headers: string[],
  districtName: string = 'Banka',
  stateName: string = 'Bihar'
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 14;

  // Header Banner
  doc.setFillColor(30, 58, 138);
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setFillColor(217, 119, 6);
  doc.rect(0, 27.5, pageWidth, 1.5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('INSPIRE AWARD — DISTRICT PENDING REPORT SUMMARY', marginX, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(226, 232, 240);
  doc.text(`District: ${districtName} | State: ${stateName} | Blockwise Compilation`, marginX, 19);
  doc.text('Education Department / Bihar Shiksha Pariyojna', marginX, 24);

  // Statistics Summary Cards
  const statsY = 34;
  const colWidth = (pageWidth - marginX * 2 - 9) / 4;

  const stats = [
    { label: 'Total Blocks', val: String(summary.totalBlocks), color: [30, 58, 138] },
    { label: 'Total Pending Schools', val: String(summary.totalPendingSchools), color: [185, 28, 28] },
    { label: 'Highest Pending Block', val: `${summary.highestBlock.name} (${summary.highestBlock.count})`, color: [194, 65, 12] },
    { label: 'Lowest Pending Block', val: `${summary.lowestBlock.name} (${summary.lowestBlock.count})`, color: [21, 128, 61] },
  ];

  stats.forEach((st, idx) => {
    const x = marginX + idx * (colWidth + 3);
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(x, statsY, colWidth, 22, 2, 2, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(st.label, x + 3, statsY + 6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(st.color[0], st.color[1], st.color[2]);
    doc.text(st.val, x + 3, statsY + 15, { maxWidth: colWidth - 6 });
  });

  // Table of Blockwise Distribution
  const tableData = blocks.map((b, idx) => [
    idx + 1,
    b.name,
    b.count,
    `${b.percentageOfTotal}%`,
    b.count >= 50 ? 'Critical Attention' : b.count >= 30 ? 'High' : 'Moderate',
  ]);

  autoTable(doc, {
    head: [['S.No', 'Block Name', 'Pending Schools', 'Share (%)', 'Priority Status']],
    body: tableData,
    startY: statsY + 28,
    margin: { left: marginX, right: marginX, bottom: 18 },
    theme: 'grid',
    headStyles: {
      fillColor: [30, 58, 138],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    styles: {
      fontSize: 8.5,
      cellPadding: 3,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    didDrawPage: (data: any) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `District: ${districtName} — Consolidated INSPIRE Award Pending Report`,
        marginX,
        pageHeight - 8
      );
      doc.text(
        `Page ${data.pageNumber} of ${(doc.internal as any).getNumberOfPages()}`,
        pageWidth - marginX - 18,
        pageHeight - 8
      );
    },
  });

  doc.save(`${districtName}_District_INSPIRE_Pending_Summary.pdf`);
}

/**
 * Downloads all individual 11 block PDFs sequentially with progress callback.
 */
export async function downloadAllBlockPdfsSequentially(
  blocks: BlockData[],
  headers: string[],
  onProgress?: (current: number, total: number, currentBlockName: string) => void
): Promise<void> {
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    if (onProgress) {
      onProgress(i + 1, blocks.length, block.name);
    }
    
    // Generate and trigger download
    downloadBlockPdf(block, headers);

    // Short polite timeout between downloads so the browser doesn't block or drop downloads
    if (i < blocks.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 400));
    }
  }
}

/**
 * Generates all 11 individual Block PDFs and bundles them into a clean ZIP file for instant 1-click download.
 */
export async function downloadAllBlockPdfsAsZip(
  blocks: BlockData[],
  headers: string[],
  onProgress?: (current: number, total: number, currentBlockName: string) => void
): Promise<void> {
  const zip = new JSZip();
  const folder = zip.folder('INSPIRE_Award_Blockwise_Pending_School_PDFs');

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    if (onProgress) {
      onProgress(i + 1, blocks.length, block.name);
    }

    const doc = createBlockPdfDoc(block, headers);
    const pdfBlob = doc.output('blob');
    const cleanName = sanitizeFileName(block.name);
    folder?.file(`Block_${cleanName}.pdf`, pdfBlob);

    // Yield control for smooth UI rendering
    await new Promise(resolve => setTimeout(resolve, 30));
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `INSPIRE_Award_All_11_Blocks_Pending_Schools_PDFs.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
