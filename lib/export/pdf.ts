/**
 * Export content as PDF file
 * Using jsPDF for PDF generation
 */

export async function exportAsPDF(content: string, filename: string) {
  // Dynamically import jsPDF to avoid SSR issues
  const { jsPDF } = await import('jspdf')
  
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  // Set font and styling
  doc.setFont('helvetica')
  doc.setFontSize(12)

  // Page dimensions
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const maxWidth = pageWidth - (margin * 2)
  const lineHeight = 7

  let yPosition = margin

  // Split content by lines and handle markdown formatting
  const lines = content.split('\n')
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    
    // Check if we need a new page
    if (yPosition > pageHeight - margin) {
      doc.addPage()
      yPosition = margin
    }

    // Handle different markdown elements
    if (line.startsWith('# ')) {
      // H1 - Title
      doc.setFontSize(18)
      doc.setFont('helvetica', 'bold')
      const text = line.replace('# ', '')
      const splitText = doc.splitTextToSize(text, maxWidth)
      doc.text(splitText, margin, yPosition)
      yPosition += lineHeight * splitText.length + 5
      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
    } else if (line.startsWith('## ')) {
      // H2 - Section
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      const text = line.replace('## ', '')
      const splitText = doc.splitTextToSize(text, maxWidth)
      doc.text(splitText, margin, yPosition)
      yPosition += lineHeight * splitText.length + 3
      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
    } else if (line.startsWith('### ')) {
      // H3 - Subsection
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      const text = line.replace('### ', '')
      const splitText = doc.splitTextToSize(text, maxWidth)
      doc.text(splitText, margin, yPosition)
      yPosition += lineHeight * splitText.length + 2
      doc.setFont('helvetica', 'normal')
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      // Bullet points
      const text = line.replace(/^[*-] /, '• ')
      const splitText = doc.splitTextToSize(text, maxWidth - 5)
      doc.text(splitText, margin + 5, yPosition)
      yPosition += lineHeight * splitText.length
    } else if (line.trim() === '') {
      // Empty line - add spacing
      yPosition += lineHeight / 2
    } else {
      // Regular paragraph text
      const splitText = doc.splitTextToSize(line, maxWidth)
      doc.text(splitText, margin, yPosition)
      yPosition += lineHeight * splitText.length
    }
  }

  // Save the PDF
  doc.save(`${filename}.pdf`)
}

export function canExportPDF(): boolean {
  // Check if we're in browser environment
  return typeof window !== 'undefined'
}

