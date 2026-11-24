import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";

// Entry text (verbatim, no trailing newline).
const ENTRY_TEXT = `404`;

// Expected output size in UTF-8 bytes.
const EXPECTED_BYTES = 3;

const OUTPUT_DIR = "/output";
const OUTPUT_PATH = join(OUTPUT_DIR, "entry.txt");

function buildEntry(): string {
  return ENTRY_TEXT;
}

function writeEntry(text: string): void {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  writeFileSync(OUTPUT_PATH, text, "utf8");
}

function verifyEntry(expected: string): void {
  const actual = readFileSync(OUTPUT_PATH, "utf8");
  if (actual !== expected) {
    throw new Error("read-back mismatch: output does not match entry text");
  }
  const bytes = Buffer.byteLength(actual, "utf8");
  if (bytes !== EXPECTED_BYTES) {
    throw new Error(`byte length mismatch: got ${bytes}, expected ${EXPECTED_BYTES}`);
  }
}

// Second, independent verification pass: re-read the file from disk,
// recompute its sha256 from the bytes on disk, and re-check byte length.
function verifyOutputOnDisk(expected: string): void {
  const onDisk = readFileSync(OUTPUT_PATH, "utf8");
  if (onDisk !== expected) {
    throw new Error("second read-back mismatch: file on disk differs from entry text");
  }
  const bytes = Buffer.byteLength(onDisk, "utf8");
  if (bytes !== EXPECTED_BYTES) {
    throw new Error(`second byte length mismatch: got ${bytes}, expected ${EXPECTED_BYTES}`);
  }
  const digest = createHash("sha256").update(onDisk, "utf8").digest("hex");
  console.log(`verified on disk: ${bytes} bytes, sha256 ${digest}`);
}

function main(): void {
  const entry = buildEntry();
  writeEntry(entry);
  verifyEntry(entry);
  verifyOutputOnDisk(entry);
  const digest = createHash("sha256").update(entry, "utf8").digest("hex");
  console.log(`wrote ${OUTPUT_PATH} (${EXPECTED_BYTES} bytes, sha256 ${digest})`);
}

main();
