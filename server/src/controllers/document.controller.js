import path from "node:path";

import AppError from "../utils/AppError.js";
import { createDocument } from "../services/document.service.js";
import {
  hasPdfSignature,
  removeStoredFile,
} from "../services/fileStorage.service.js";
import { processDocument } from "../services/documentProcessing.service.js";

export async function createDocumentController(req, res) {
  if (!req.file) {
    throw new AppError("Please attach a PDF file.", 400);
  }

  const uploadedFile = req.file;

  try {
    const isPdf = await hasPdfSignature(uploadedFile.path);

    if (!isPdf) {
      throw new AppError(
        "The uploaded file does not have a valid PDF signature.",
        400,
      );
    }

    // Handle Windows-style and POSIX-style paths from client filenames.
    const originalName = path.basename(
      path.win32.basename(uploadedFile.originalname),
    );

    const document = await createDocument({
      title: req.body.title,
      originalName,
      mimeType: "application/pdf",
      size: uploadedFile.size,
      storagePath: uploadedFile.filename,
    });

    res.status(201).json({
      status: "success",
      message: "PDF uploaded and document record saved",
      data: {
        document,
      },
    });
  } catch (error) {
    try {
      await removeStoredFile(uploadedFile.filename);
    } catch (cleanupError) {
      console.error("Failed to clean up uploaded file:", cleanupError.message);
    }

    throw error;
  }
}

export async function extractDocumentTextController(req, res) {
  const result = await processDocument(req.params.id);

  res.status(200).json({
    status: "success",
    message: "PDF text extracted successfully",
    data: {
      document: {
        id: result.document._id,
        title: result.document.title,
        status: result.document.status,
        pageCount: result.document.pageCount,
        extractedAt: result.document.extractedAt,
      },
      pages: result.pages,
    },
  });
}
