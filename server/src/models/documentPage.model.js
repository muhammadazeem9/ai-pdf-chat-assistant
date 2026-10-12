import mongoose from "mongoose";

const documentPageSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
      index: true,
    },

    pageNumber: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isSafeInteger,
        message: "Page number must be an integer",
      },
    },

    text: {
      type: String,
      required: true,
      maxlength: 2_000_000,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// One record per page for each document.
documentPageSchema.index({ documentId: 1, pageNumber: 1 }, { unique: true });

const DocumentPage =
  mongoose.models.DocumentPage ||
  mongoose.model("DocumentPage", documentPageSchema);

export default DocumentPage;
