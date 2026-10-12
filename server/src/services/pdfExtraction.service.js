import pdfParse from "pdf-parse";

import AppError from "../utils/AppError.js";

export async function extractPdfPages(buffer) {
  const pages = [];

  try {
    const result = await pdfParse(buffer, {
      pagerender: async (pageData) => {
        const content = await pageData.getTextContent();

        const text = content.items
          .map((item) => item.str ?? "")
          .filter(Boolean)
          .join(" ")
          .replace(/\s+/g, " ")
          .trim();

        pages.push({
          pageNumber: pages.length + 1,
          text,
        });

        return text;
      },
    });

    if (!result.numpages || result.numpages < 1) {
      throw new AppError("The PDF contains no pages.", 422);
    }

    // Reject scanned/image-only PDFs for now; OCR comes later.
    const hasExtractableText = pages.some((page) => page.text.length > 0);

    if (!hasExtractableText) {
      throw new AppError(
        "No selectable text was found. This PDF may require OCR.",
        422,
      );
    }

    return {
      pageCount: result.numpages,
      pages,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      "Could not extract text from this PDF. Check that it is a valid, readable PDF.",
      422,
    );
  }
}
