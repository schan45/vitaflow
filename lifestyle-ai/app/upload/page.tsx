"use client";

import { useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function Upload() {
  const { userId } = useAuth();
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const saveUploadFlag = (file: File) => {
    const key = userId ? `hasUploadedReport:${userId}` : "hasUploadedReport";
    localStorage.setItem(key, "true");
    setUploadedFileName(file.name);
  };

  const handleFileSelect = (fileList: FileList | null) => {
    const file = fileList?.[0];
    if (!file) return;
    saveUploadFlag(file);
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-6">
        Upload Medical Report
      </h2>

      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          handleFileSelect(event.dataTransfer.files);
        }}
        className={`border-2 border-dashed p-8 rounded-2xl text-center cursor-pointer transition ${
          isDragging
            ? "border-blue-500 bg-blue-500/10"
            : "border-slate-600"
        }`}
      >
        <p className="text-slate-200 mb-2">
          Drag & Drop File Here
        </p>
        <p className="text-sm text-slate-400">
          or click to select
        </p>

        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
          className="hidden"
          onChange={(event) => handleFileSelect(event.target.files)}
        />
      </div>

      {uploadedFileName && (
        <p className="mt-4 text-sm text-green-400">
          Report uploaded: {uploadedFileName}
        </p>
      )}
    </div>
  );
}
