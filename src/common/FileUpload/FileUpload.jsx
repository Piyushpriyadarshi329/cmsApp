import { useRef, useState } from "react";
import axios from "axios";
import { post } from "../../network";
import ErrorMessage from "../Error/ErrorMessage";

export default function FileUpload({
  label,
  id,
  accept,
  disabled = false,
  onUploadStart,
  onUploadComplete,
  onUploadError,
  className = "",
}) {
  const inputRef = useRef(null);
  const [fileName, setFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError("");
    setUploading(true);
    onUploadStart?.(file);

    try {
      const { data } = await post("/presigned-upload", {
        fileName: file.name,
        contentType: file.type || "application/octet-stream",
      });

      const { uploadUrl, objectKey } = data;

      await axios.put(uploadUrl, file, {
        headers: { "Content-Type": file.type || "application/octet-stream" },
      });

      onUploadComplete?.({ objectKey, file });
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "File upload failed";
      setError(message);
      onUploadError?.(err);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={disabled || uploading}
          onClick={() => inputRef.current?.click()}
          className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {uploading ? "Uploading..." : "Choose file"}
        </button>

        <span className="truncate text-sm text-gray-500">
          {fileName || "No file chosen"}
        </span>

        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={accept}
          disabled={disabled || uploading}
          onChange={handleChange}
          className="hidden"
        />
      </div>

      <ErrorMessage variant="background" message={error} />
    </div>
  );
}
