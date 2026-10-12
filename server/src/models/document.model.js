import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Document title is required"],
      trim: true,
      minlength: [1, "Document title cannot be empty"],
      maxlength: [200, "Document title cannot exceed 200 characters"],
    },

    originalName: {
      type: String,
      required: [true, "Original filename is required"],
      trim: true,
      maxlength: [255, "Original filename cannot exceed 255 characters"],
    },

    mimeType: {
      type: String,
      required: [true, "MIME type is required"],
      enum: {
        values: ["application/pdf"],
        message: "Only PDF documents are supported",
      },
    },

    size: {
      type: Number,
      required: [true, "File size is required"],
      min: [1, "File size must be greater than zero"],
      max: [20 * 1024 * 1024, "PDF cannot exceed 20 MB"],
      validate: {
        validator: Number.isSafeInteger,
        message: "File size must be a valid integer in bytes",
      },
    },

    status: {
      type: String,
      enum: ["uploaded", "processing", "ready", "failed"],
      default: "uploaded",
      required: true,
    },

    storagePath: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: null,
    },

    uploadedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },

    pageCount: {
      type: Number,
      min: 0,
      default: null,
    },

    extractedAt: {
      type: Date,
      default: null,
    },

    processingError: {
      type: String,
      maxlength: 500,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Useful for listing recently uploaded documents by processing status.
documentSchema.index({ status: 1, createdAt: -1 });

// Avoid OverwriteModelError during development reloads.
const Document =
  mongoose.models.Document || mongoose.model("Document", documentSchema);

export default Document;
