import path from "node:path";
import { readFile } from "node:fs/promises";

import mongoose from "mongoose";
import Document from "../models/document.model.js";
import DocumentPage from "../models/documentPage.model.js";
import AppError from "../utils/AppError.js";
import { extractPdfPages } from "./pdfExtraction.service.js";

const uploadDirectory = path.resolve(process.cwd(), "uploads");

export async function processDocument(documentId) {
  if (!mongoose.isValidObjectId(documentId)) {
    throw new AppError("Invalid document ID.", 400);
  }

  const document = await Document.findById(documentId);

  if (!document) {
    throw new AppError("Document not found.", 404);
  }

  if (!document.storagePath) {
    throw new AppError("This document has no stored PDF file.", 409);
  }

  // Only allow a generated filename, never a client-supplied path.
  if (path.basename(document.storagePath) !== document.storagePath) {
    throw new AppError("Invalid stored file reference.", 400);
  }

  const filePath = path.resolve(uploadDirectory, document.storagePath);

  if (!filePath.startsWith(`${uploadDirectory}${path.sep}`)) {
    throw new AppError("Invalid stored file reference.", 400);
  }

  await Document.updateOne(
    { _id: document._id },
    {
      $set: {
        status: "processing",
        processingError: null,
      },
    },
  );

  try {
    const buffer = await readFile(filePath);
    const { pageCount, pages } = await extractPdfPages(buffer);

    const operations = pages.map((page) => ({
      updateOne: {
        filter: {
          documentId: document._id,
          pageNumber: page.pageNumber,
        },
        update: {
          $set: { text: page.text },
          $setOnInsert: {
            documentId: document._id,
            pageNumber: page.pageNumber,
          },
        },
        upsert: true,
      },
    }));

    if (operations.length > 0) {
      await DocumentPage.bulkWrite(operations);
    }

    // Remove stale pages if the PDF has changed.
    await DocumentPage.deleteMany({
      documentId: document._id,
      pageNumber: { $gt: pageCount },
    });

    const updatedDocument = await Document.findByIdAndUpdate(
      document._id,
      {
        $set: {
          status: "ready",
          pageCount,
          extractedAt: new Date(),
          processingError: null,
        },
      },
      { new: true, runValidators: true },
    );

    return {
      document: updatedDocument,
      pages: pages.map((page) => ({
        pageNumber: page.pageNumber,
        textPreview: page.text.slice(0, 300),
        characterCount: page.text.length,
      })),
    };
  } catch (error) {
    const safeMessage =
      error.statusCode && error.statusCode < 500
        ? error.message
        : "PDF text extraction failed.";

    await Document.updateOne(
      { _id: document._id },
      {
        $set: {
          status: "failed",
          processingError: safeMessage.slice(0, 500),
        },
      },
    );

    throw error;
  }
}
