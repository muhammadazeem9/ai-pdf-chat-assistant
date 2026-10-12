import { open, unlink } from "node:fs/promises";
import path from "node:path";

const uploadDirectory = path.resolve(process.cwd(), "uploads");

export async function hasPdfSignature(filePath) {
  const handle = await open(filePath, "r");

  try {
    const header = Buffer.alloc(5);
    const { bytesRead } = await handle.read(header, 0, header.length, 0);

    return bytesRead === 5 && header.toString("ascii") === "%PDF-";
  } finally {
    await handle.close();
  }
}

export async function removeStoredFile(filename) {
  // Only accept a generated basename, never an arbitrary path.
  if (typeof filename !== "string" || path.basename(filename) !== filename) {
    throw new Error("Invalid stored filename");
  }

  await unlink(path.join(uploadDirectory, filename));
}
