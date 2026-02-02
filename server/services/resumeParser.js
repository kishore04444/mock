/**
 * Extract text from PDF or DOCX buffer
 */
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

/**
 * @param {Buffer} buffer
 * @param {string} mimetype - 'application/pdf' or DOCX mime
 * @returns {Promise<string>} extracted text
 */
export async function extractTextFromResume(buffer, mimetype) {
  if (mimetype === 'application/pdf') {
    const data = await pdfParse(buffer);
    return data.text;
  }
  if (
    mimetype ===
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }
  throw new Error('Unsupported file type. Use PDF or DOCX.');
}
