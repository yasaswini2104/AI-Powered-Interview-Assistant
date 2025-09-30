// client\src\lib\pdfGenerator.ts
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { CandidateReportPDF } from '@/components/CandidateReportPDF';
import { type Candidate } from '@/features/candidatesSlice';

export const generateAndDownloadPdf = async (candidate: Candidate): Promise<void> => {
  // 1. Create a hidden iframe. It's a sandboxed environment without external CSS.
  const iframe = document.createElement('iframe');
  iframe.style.position = 'absolute';
  iframe.style.left = '-9999px';
  iframe.style.border = 'none';
  document.body.appendChild(iframe);

  // Get the iframe's document object
  const iframeDoc = iframe.contentWindow?.document;
  if (!iframeDoc) {
    throw new Error("Could not access iframe document.");
  }

  // 2. Create a container inside the iframe for our component.
  const pdfContainer = iframeDoc.createElement('div');
  iframeDoc.body.appendChild(pdfContainer);
  const root = ReactDOM.createRoot(pdfContainer);

  try {
    // 3. Render the component into the iframe.
    root.render(React.createElement(CandidateReportPDF, { candidate }));
    
    // Wait for a moment for the component to render inside the iframe.
    await new Promise(r => setTimeout(r, 500));

    // 4. Capture the content of the iframe's body.
    const canvas = await html2canvas(iframeDoc.body, {
      scale: 2,
      useCORS: true,
      // We must tell html2canvas the dimensions, as iframe body might not have them.
      width: iframeDoc.body.scrollWidth,
      height: iframeDoc.body.scrollHeight,
    });

    // 5. Create and save the PDF.
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Interview-Report-${candidate.name.replace(/\s/g, '_')}.pdf`);

  } catch (error) {
    console.error("Error during PDF generation:", error);
    throw error; // Rethrow to be caught by the calling function
  } finally {
    // 6. Always clean up by removing the iframe from the DOM.
    root.unmount();
    document.body.removeChild(iframe);
  }
};

