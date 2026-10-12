import { Router } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import {
  createDocumentController,
  extractDocumentTextController,
} from "../controllers/document.controller.js";
import upload from "../middleware/upload.middleware.js";

const router = Router();

router.use((req, res, next) => {
  if (process.env.NODE_ENV === "production") {
    return next(new AppError("Not found", 404));
  }

  next();
});

// Temporary Lesson 4 metadata-only test endpoint
router.post(
  "/documents",
  asyncHandler(async (req, res) => {
    throw new AppError(
      "Metadata-only creation is disabled. Use the PDF upload endpoint.",
      410,
    );
  }),
);

// Lesson 5: real PDF upload
router.post(
  "/documents/upload",
  upload.single("file"),
  asyncHandler(createDocumentController),
);

router.post(
  "/documents/:id/extract-text",
  asyncHandler(extractDocumentTextController),
);
export default router;
