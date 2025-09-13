import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../convex/_generated/dataModel";

// TODO: Replace with your preferred crypto library
// Example: crypto-js, tweetnacl, or Web Crypto API
import CryptoJS from "crypto-js";

export function SecureFiles() {
  const [view, setView] = useState<"list" | "upload" | "decrypt">("list");
  const [selectedFile, setSelectedFile] = useState<any>(null);

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex gap-4 border-b pb-4">
        <button
          onClick={() => setView("list")}
          className={`px-4 py-2 rounded font-medium transition-colors ${
            view === "list"
              ? "bg-blue-100 text-blue-700"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          My Documents
        </button>
        <button
          onClick={() => setView("upload")}
          className={`px-4 py-2 rounded font-medium transition-colors ${
            view === "upload"
              ? "bg-blue-100 text-blue-700"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Upload Document
        </button>
      </div>

      {/* Views */}
      {view === "list" && (
        <FilesList
          onDecrypt={(file) => {
            setSelectedFile(file);
            setView("decrypt");
          }}
        />
      )}
      {view === "upload" && <UploadForm onSuccess={() => setView("list")} />}
      {view === "decrypt" && selectedFile && (
        <DecryptView
          file={selectedFile}
          onBack={() => setView("list")}
        />
      )}
    </div>
  );
}

function UploadForm({ onSuccess }: { onSuccess: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [passphrase, setPassphrase] = useState("");
  const [uploading, setUploading] = useState(false);

  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const saveFile = useMutation(api.files.saveFile);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !passphrase) {
      toast.error("Please select a file and enter a passphrase");
      return;
    }

    setUploading(true);
    try {
      // Read file as ArrayBuffer
      const fileBuffer = await file.arrayBuffer();
      const fileBytes = new Uint8Array(fileBuffer);

      // TODO: Client-side encryption - replace with your preferred crypto library
      // Convert file bytes to base64 for crypto-js
      const fileBase64 = btoa(String.fromCharCode(...fileBytes));
      const encrypted = CryptoJS.AES.encrypt(fileBase64, passphrase).toString();
      
      // Convert encrypted string back to blob
      const encryptedBlob = new Blob([encrypted], { type: "application/octet-stream" });

      // Step 1: Get upload URL
      const uploadUrl = await generateUploadUrl();

      // Step 2: Upload encrypted file
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": encryptedBlob.type },
        body: encryptedBlob,
      });

      if (!result.ok) {
        throw new Error("Upload failed");
      }

      const { storageId } = await result.json();

      // Step 3: Save metadata
      await saveFile({
        storageId,
        filename: file.name,
        size: file.size,
        mimeType: file.type,
      });

      toast.success("Document encrypted and uploaded successfully!");
      setFile(null);
      setPassphrase("");
      onSuccess();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6">Upload Secure Document</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Legal Document
          </label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Encryption Passphrase
          </label>
          <input
            type="password"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            placeholder="Enter a strong passphrase"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            This passphrase will be needed to decrypt your document. Keep it secure and confidential!
          </p>
        </div>
        <button
          type="submit"
          disabled={uploading || !file || !passphrase}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? "Encrypting & Uploading..." : "Upload Secure Document"}
        </button>
      </form>
    </div>
  );
}

function FilesList({ onDecrypt }: { onDecrypt: (file: any) => void }) {
  const files = useQuery(api.files.myFiles) || [];

  if (files.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No documents uploaded yet.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">My Legal Documents</h2>
      <div className="space-y-3">
        {files.map((file) => (
          <div
            key={file._id}
            className="flex items-center justify-between p-4 bg-white rounded-lg border hover:shadow-md transition-shadow"
          >
            <div>
              <h3 className="font-medium text-gray-900">{file.filename}</h3>
              <p className="text-sm text-gray-500">
                {(file.size / 1024).toFixed(1)} KB • {new Date(file._creationTime).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={() => onDecrypt(file)}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              Decrypt & Download
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function DecryptView({ file, onBack }: { file: any; onBack: () => void }) {
  const [passphrase, setPassphrase] = useState("");
  const [decrypting, setDecrypting] = useState(false);

  const fileUrl = useQuery(api.files.getFileUrl, { storageId: file.storageId });

  const handleDecrypt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passphrase || !fileUrl) {
      toast.error("Please enter the passphrase");
      return;
    }

    setDecrypting(true);
    try {
      // Download encrypted file
      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error("Failed to download file");
      }

      const encryptedText = await response.text();

      // TODO: Client-side decryption - replace with your preferred crypto library
      try {
        const decryptedBase64 = CryptoJS.AES.decrypt(encryptedText, passphrase).toString(CryptoJS.enc.Utf8);
        
        if (!decryptedBase64) {
          throw new Error("Invalid passphrase");
        }

        // Convert base64 back to bytes
        const decryptedBytes = Uint8Array.from(atob(decryptedBase64), c => c.charCodeAt(0));
        
        // Create blob and download
        const decryptedBlob = new Blob([decryptedBytes], { type: file.mimeType });
        const downloadUrl = URL.createObjectURL(decryptedBlob);
        
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = file.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(downloadUrl);

        toast.success("Document decrypted and downloaded!");
      } catch (decryptError) {
        toast.error("Failed to decrypt document. Check your passphrase.");
      }
    } catch (error) {
      console.error("Decrypt error:", error);
      toast.error("Failed to download or decrypt document");
    } finally {
      setDecrypting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <button
        onClick={onBack}
        className="mb-4 text-blue-600 hover:text-blue-800 flex items-center gap-2"
      >
        ← Back to Documents
      </button>
      
      <h2 className="text-2xl font-bold mb-6">Decrypt & Download</h2>
      
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="font-medium text-gray-900">{file.filename}</h3>
        <p className="text-sm text-gray-500">
          {(file.size / 1024).toFixed(1)} KB • {file.mimeType}
        </p>
      </div>

      <form onSubmit={handleDecrypt} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter Passphrase
          </label>
          <input
            type="password"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            placeholder="Enter the passphrase used to encrypt this document"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <button
          type="submit"
          disabled={decrypting || !passphrase}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {decrypting ? "Decrypting..." : "Decrypt & Download"}
        </button>
      </form>
    </div>
  );
}
