"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { UploadIcon, Trash2Icon, FileIcon, DownloadIcon } from "lucide-react";

interface FileInfo {
  id: string;
  name: string;
}

const WorkspaceIdPage = () => {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [selectedFileName, setSelectedFileName] = useState("");

  // Load files on mount
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/upload");

        if (!res.ok) {
          throw new Error("Failed to fetch files");
        }

        const data = await res.json();

        // Check the structure of the response and handle it accordingly
        if (Array.isArray(data)) {
          setFiles(data);
        } else if (data.files && Array.isArray(data.files)) {
          setFiles(data.files);
        } else {
          console.error("Unexpected API response format:", data);
          setFiles([]);
        }
      } catch (error) {
        console.error("Error fetching files:", error);
        toast.error("Failed to load files");
        setFiles([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFiles();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileRef.current?.files?.[0]) return;

    try {
      const formData = new FormData();
      formData.append("file", fileRef.current.files[0]);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Uploaded successfully");
        setFiles((prev) => [...prev, { id: data.fileId, name: data.filename }]);
        setSelectedFileName("");
      } else {
        toast.error(`Upload failed: ${data.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Upload failed");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/upload?fileId=${id}`, { method: "DELETE" });

      if (res.ok) {
        setFiles((prev) => prev.filter((f) => f.id !== id));
        toast.success("File deleted successfully");
      } else {
        const data = await res.json();
        toast.error(`Delete failed: ${data.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error("Delete failed");
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Workspace Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <form onSubmit={handleUpload} className="space-y-2">
                <label
                  htmlFor="file-upload"
                  className="block border border-dashed border-gray-400 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-100 transition">
                  <span className="text-sm text-gray-700">{selectedFileName ? selectedFileName : "Click or drag a file here"}</span>
                  <input
                    id="file-upload"
                    type="file"
                    ref={fileRef}
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setSelectedFileName(e.target.files[0].name);
                      } else {
                        setSelectedFileName("");
                      }
                    }}
                  />
                </label>

                <Button type="submit" className="w-full" disabled={!selectedFileName}>
                  <UploadIcon className="w-4 h-4 mr-2" />
                  Click to Upload
                </Button>
              </form>

              {isLoading ? (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">Loading...</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {files.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No files uploaded yet.</p>
                  ) : (
                    files.map((file) => (
                      <div key={file.id} className="flex items-center justify-between border p-2 rounded">
                        <div className="flex items-center gap-2">
                          <FileIcon className="w-4 h-4" />
                          <span className="text-sm">{file.name}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              window.open(`/api/upload?fileId=${file.id}`, "_blank");
                            }}>
                            <DownloadIcon className="w-4 h-4" />
                          </Button>
                          <Button variant="destructive" size="icon" onClick={() => handleDelete(file.id)}>
                            <Trash2Icon className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceIdPage;
