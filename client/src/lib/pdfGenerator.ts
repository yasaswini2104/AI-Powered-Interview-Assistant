// client\src\lib\pdfGenerator.ts
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { CandidateReportPDF } from '@/components/CandidateReportPDF';
import { type Candidate } from '@/features/candidatesSlice';

export const generateAndDownloadPdf = async (candidate: Candidate): Promise<void> => {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'absolute';
  iframe.style.left = '-9999px';
  iframe.style.border = 'none';
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentWindow?.document;
  if (!iframeDoc) {
    throw new Error("Could not access iframe document.");
  }

  const pdfContainer = iframeDoc.createElement('div');
  iframeDoc.body.appendChild(pdfContainer);
  const root = ReactDOM.createRoot(pdfContainer);

  try {
    root.render(React.createElement(CandidateReportPDF, { candidate }));
    
    await new Promise(r => setTimeout(r, 500));

    const canvas = await html2canvas(iframeDoc.body, {
      scale: 2,
      useCORS: true,
      width: iframeDoc.body.scrollWidth,
      height: iframeDoc.body.scrollHeight,
    });

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Interview-Report-${candidate.name.replace(/\s/g, '_')}.pdf`);

  } catch (error) {
    console.error("Error during PDF generation:", error);
    throw error; 
  } finally {

    root.unmount();
    document.body.removeChild(iframe);
  }
};

