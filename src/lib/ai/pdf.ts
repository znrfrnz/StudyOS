import pdfParse from "pdf-parse";

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(buffer);
    const text = data.text?.trim() || "";

    if (!text) {
      throw new Error("No text found in PDF. It may be scanned or image-based.");
    }

    return text;
  } catch (error) {
    if (error instanceof Error && error.message.includes("No text found")) {
      throw error;
    }
    // Re-throw with the actual error so it shows in server logs
    if (error instanceof Error) {
      throw new Error(`PDF extraction failed: ${error.message}`);
    }
    throw new Error("Failed to extract text from PDF.");
  }
}
