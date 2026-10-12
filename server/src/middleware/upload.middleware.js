import multer from "multer";
import path from "node:path";
import { mkdir } from "node:fs/promises";
import { randomUUID } from "node:crypto";

import AppError from "../utils/AppError.js";

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const uploadDirectory = path.resolve(process.cwd(), "uploads");

const storage = multer.diskStorage({
  destination(req, file, callback) {
    mkdir(uploadDirectory, { recursive: true })
      .then(() => callback(null, uploadDirectory))
      .catch(callback);
  },

  filename(req, file, callback) {
    // Never use the user's filename as the disk filename.
    callback(null, `${randomUUID()}.pdf`);
  },
});

function fileFilter(req, file, callback) {
  // This is an initial filter, not proof that the file is a valid PDF.
  if (file.mimetype !== "application/pdf") {
    return callback(new AppError("Only PDF files are accepted.", 400));
  }

  callback(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
    fields: 5,
    parts: 6,
    fieldNameSize: 100,
    fieldSize: 1024,
  },
});

export default upload;
