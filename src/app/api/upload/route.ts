import fs from "fs";
import path from "path";
import { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";

// Đảm bảo folder /uploads tồn tại
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const taskId = req.query.taskId as string;
  const filePath = path.join(uploadDir, `${taskId}.bin`);

  if (req.method === "HEAD") {
    if (fs.existsSync(filePath)) return res.status(200).end();
    else return res.status(404).end();
  }

  if (req.method === "GET") {
    if (!fs.existsSync(filePath)) return res.status(404).end("Not found");
    res.setHeader("Content-Disposition", `attachment; filename="${taskId}.bin"`);
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    return;
  }

  if (req.method === "DELETE") {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    return res.status(200).end();
  }

  if (req.method === "POST") {
    const form = new formidable.IncomingForm({ uploadDir, keepExtensions: true });

    form.parse(req, (err, fields, files) => {
      if (err) return res.status(500).json({ error: "Upload error" });
      const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;
      if (!uploadedFile) return res.status(400).json({ error: "No file" });

      // Rename file theo taskId
      fs.renameSync(uploadedFile.filepath, filePath);
      return res.status(200).json({ success: true });
    });
  } else {
    res.status(405).end("Method Not Allowed");
  }
}
