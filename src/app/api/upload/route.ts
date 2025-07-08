import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { v4 as uuidv4 } from "uuid";

// Đảm bảo thư mục /uploads tồn tại
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  try {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log(`Created upload directory at ${uploadDir}`);
  } catch (error) {
    console.error(`Failed to create upload directory: ${error}`);
  }
}

// Debug function to check if directory exists and is readable
function checkDirectory() {
  try {
    const exists = fs.existsSync(uploadDir);
    console.log(`Upload directory exists: ${exists}`);

    if (exists) {
      const stats = fs.statSync(uploadDir);
      console.log(`Is directory: ${stats.isDirectory()}`);
      console.log(`Directory permissions: ${stats.mode}`);

      try {
        const files = fs.readdirSync(uploadDir);
        console.log(`Files in directory: ${files.length}`);
        console.log(files);
      } catch (error) {
        console.error(`Cannot read directory contents: ${error}`);
      }
    }
    return exists;
  } catch (error) {
    console.error(`Error checking directory: ${error}`);
    return false;
  }
}

// GET handler for listing all files
export async function GET(request: Request) {
  // Check if this is a request for a specific file
  const { searchParams } = new URL(request.url);
  const fileId = searchParams.get("fileId");

  // Log the request info for debugging
  console.log(`GET request received: ${request.url}`);
  console.log(`FileId param: ${fileId}`);

  // Handle listing all files
  if (request.url.includes("/api/upload/list") || !fileId) {
    console.log("Handling list files request");

    // Check directory status
    const dirExists = checkDirectory();

    if (!dirExists) {
      console.log("Upload directory doesn't exist or isn't accessible");
      return NextResponse.json({ files: [], error: "Upload directory unavailable" });
    }

    try {
      const files = fs.readdirSync(uploadDir);
      console.log(`Found ${files.length} files in directory`);

      const fileList = files.map((filename) => {
        const id = filename.split(".")[0]; // Get UUID from filename
        return { id, name: filename };
      });

      return NextResponse.json({ files: fileList });
    } catch (error) {
      console.error(`Error listing files: ${error}`);
      return NextResponse.json({ files: [], error: "Failed to read files" }, { status: 500 });
    }
  }

  // Handle downloading a specific file
  console.log(`Handling file download request for ID: ${fileId}`);

  try {
    const files = fs.readdirSync(uploadDir);
    console.log(`Found ${files.length} files in directory when searching for ${fileId}`);

    const match = files.find((f) => f.startsWith(fileId));
    console.log(`Matching file: ${match || "none"}`);

    if (!match) {
      console.log(`File with ID ${fileId} not found`);
      return new NextResponse("File not found", { status: 404 });
    }

    const filePath = path.join(uploadDir, match);
    console.log(`Reading file from: ${filePath}`);

    const fileBuffer = fs.readFileSync(filePath);
    console.log(`File size: ${fileBuffer.length} bytes`);

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Disposition": `attachment; filename="${encodeURIComponent(match)}"`,
        "Content-Type": "application/octet-stream",
        "Content-Length": fileBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error(`Error processing file download: ${error}`);
    return NextResponse.json({ error: "Failed to process file" }, { status: 500 });
  }
}

// POST handler for file upload
export async function POST(request: Request) {
  console.log("Handling file upload request");

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      console.log("No file provided in the request");
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    console.log(`Received file: ${file.name}, size: ${file.size} bytes`);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const uuid = uuidv4();
    const ext = path.extname(file.name) || ".bin";
    const filename = `${uuid}${ext}`;
    const filePath = path.join(uploadDir, filename);

    console.log(`Saving file to: ${filePath}`);

    // Write file to disk
    await writeFile(filePath, buffer);
    console.log("File written successfully");

    // Verify the file was saved
    const fileExists = fs.existsSync(filePath);
    console.log(`File exists after write: ${fileExists}`);

    if (!fileExists) {
      return NextResponse.json({ error: "File could not be saved" }, { status: 500 });
    }

    return NextResponse.json(
      {
        success: true,
        fileId: uuid,
        filename: file.name,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(`Error uploading file: ${error}`);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

// DELETE handler for file deletion
export async function DELETE(request: Request) {
  console.log("Handling file deletion request");

  const { searchParams } = new URL(request.url);
  const fileId = searchParams.get("fileId");
  console.log(`File ID to delete: ${fileId}`);

  if (!fileId) {
    console.log("No fileId provided");
    return NextResponse.json({ error: "Missing fileId" }, { status: 400 });
  }

  try {
    const files = fs.readdirSync(uploadDir);
    console.log(`Found ${files.length} files in directory`);

    const match = files.find((f) => f.startsWith(fileId));
    console.log(`Matching file to delete: ${match || "none"}`);

    if (!match) {
      console.log(`File with ID ${fileId} not found for deletion`);
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const filePath = path.join(uploadDir, match);
    console.log(`Deleting file at: ${filePath}`);

    fs.unlinkSync(filePath);
    console.log("File deleted successfully");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error deleting file: ${error}`);
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
  }
}
