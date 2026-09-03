/**
 * Transforms raw PDF engine exceptions into polite, clear, and actionable user feedback.
 */
export function formatPdfErrorMessage(err: any): string {
  if (!err) return 'An unexpected error occurred while processing the document.';

  const msg = (err.message || String(err)).toLowerCase();
  const name = err.name || '';

  // 1. Password-protected or encrypted PDF
  if (
    name === 'PasswordException' ||
    msg.includes('password') ||
    msg.includes('encrypted') ||
    msg.includes('bad decrypt') ||
    msg.includes('needpassword')
  ) {
    return 'This PDF is password-protected or encrypted. Please unlock it first using the "Unlock PDF" tool.';
  }

  // 2. Corrupted or invalid structure
  if (
    name === 'InvalidPDFException' ||
    name === 'FormatError' ||
    msg.includes('invalid pdf') ||
    msg.includes('format') ||
    msg.includes('corrupt') ||
    msg.includes('missing endobj') ||
    msg.includes('trailer not found')
  ) {
    return 'The uploaded file appears to be corrupted or lacks a standard PDF structure. Try repairing it with the "Repair PDF" tool.';
  }

  // 3. Worker / sandbox / network / fake worker errors
  if (
    msg.includes('fake worker') ||
    msg.includes('worker') ||
    msg.includes('setting up fake worker failed') ||
    msg.includes('cross-origin') ||
    msg.includes('network')
  ) {
    return 'The PDF engine experienced a temporary browser sandbox or worker loading issue. Please try re-selecting the file or refresh the page.';
  }

  // 4. Memory / Canvas dimensions
  if (
    msg.includes('out of memory') ||
    msg.includes('allocation failed') ||
    msg.includes('canvas') ||
    msg.includes('context')
  ) {
    return 'The PDF contains exceptionally large high-resolution pages that exceed browser memory limits. Try splitting the PDF into smaller page ranges or compressing it first.';
  }

  // 5. Unsupported file type uploaded
  if (msg.includes('unsupported') || msg.includes('file format') || msg.includes('magic bytes')) {
    return 'The selected file format is not supported for this utility. Please ensure you upload a valid PDF document.';
  }

  // Return cleaned message or fallback
  const cleaned = (err.message || String(err)).replace(/^Error:\s*/i, '').trim();
  return cleaned.length > 0 ? cleaned : 'An unexpected error occurred while executing the PDF engine.';
}
