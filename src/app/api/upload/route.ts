import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { v4 as uuidv4 } from "uuid";

// Đảm bảo thư mục /uploads tồn tại
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// GET handler for listing all files
export async function GET(request: Request) {
  // Check if this is a request for a specific file
  const { searchParams } = new URL(request.url);
  const fileId = searchParams.get("fileId");

  // Handle listing all files
  if (request.url.includes("/api/upload/list") || !fileId) {
    if (!fs.existsSync(uploadDir)) {
      return NextResponse.json([]);
    }

    const files = fs.readdirSync(uploadDir).map((filename) => {
      const id = filename.split(".")[0]; // Get UUID from filename
      return { id, name: filename };
    });

    return NextResponse.json(files);
  }

  // Handle downloading a specific file
  const files = fs.readdirSync(uploadDir);
  const match = files.find((f) => f.startsWith(fileId));

  if (!match) {
    return new NextResponse("File not found", { status: 404 });
  }

  const filePath = path.join(uploadDir, match);
  const fileBuffer = fs.readFileSync(filePath);

  return new NextResponse(fileBuffer, {
    headers: {
      "Content-Disposition": `attachment; filename="${match}"`,
      "Content-Type": "application/octet-stream",
    },
  });
}

// POST handler for file upload
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const uuid = uuidv4();
    const ext = path.extname(file.name) || ".bin";
    const filename = `${uuid}${ext}`;
    const filePath = path.join(uploadDir, filename);

    // Write file to disk
    await writeFile(filePath, buffer);

    return NextResponse.json(
      {
        success: true,
        fileId: uuid,
        filename: file.name,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

// DELETE handler for file deletion
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const fileId = searchParams.get("fileId");

  if (!fileId) {
    return NextResponse.json({ error: "Missing fileId" }, { status: 400 });
  }

  const files = fs.readdirSync(uploadDir);
  const match = files.find((f) => f.startsWith(fileId));

  if (!match) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  try {
    fs.unlinkSync(path.join(uploadDir, match));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
  }
}
