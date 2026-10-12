import Document from "../models/document.model.js";
import AppError from "../utils/AppError.js";

const MAX_FILE_SIZE = 20 * 1024 * 1024;

export async function createDocument(data) {
  const { title, originalName, mimeType, size, storagePath } = data ?? {};

  if (
    typeof title !== "string" ||
    !title.trim() ||
    typeof originalName !== "string" ||
    !originalName.trim() ||
    typeof mimeType !== "string" ||
    !Number.isSafeInteger(size) ||
    typeof storagePath !== "string" ||
    !storagePath.trim()
  ) {
    throw new AppError(
      "Valid document title, filename, file size, and storage path are required.",
      400,
    );
  }

  if (mimeType !== "application/pdf") {
    throw new AppError("Only PDF documents are supported.", 400);
  }

  if (size < 1 || size > MAX_FILE_SIZE) {
    throw new AppError("File size must be between 1 byte and 20 MB.", 400);
  }

  const document = await Document.create({
    title: title.trim(),
    originalName: originalName.trim(),
    mimeType,
    size,
    storagePath,
    status: "uploaded",
  });

  return document;
}
