'use client';

import { useState, useRef } from 'react';
import { UPLOAD_LIMITS } from '../../lib/constants';
import Button from '../ui/Button';

const FileUploader = ({ files, setFiles, existingFiles = [], onRemoveFile }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    setError('');

    if (files.length + selectedFiles.length > UPLOAD_LIMITS.maxFiles) {
      setError(`Maximum ${UPLOAD_LIMITS.maxFiles} files allowed`);
      return;
    }

    for (const file of selectedFiles) {
      // Validate file type
      if (!UPLOAD_LIMITS.allowedTypes.includes(file.type)) {
        setError(`File type not allowed: ${file.name}. Only images and PDFs are supported.`);
        return;
      }

      // Validate file size (5MB)
      if (file.size > UPLOAD_LIMITS.maxFileSize) {
        setError(`File too large: ${file.name}. Maximum size is 5MB.`);
        return;
      }
    }

    setUploading(true);

    // Process files
    const newFiles = selectedFiles.map((file) => ({
      file,
      preview: file.type.startsWith('image/')
        ? URL.createObjectURL(file)
        : null,
      name: file.name,
      size: file.size,
    }));

    setFiles((prev) => [...prev, ...newFiles]);
    setUploading(false);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const removeExistingFile = (fileId) => {
    // Call parent handler to remove this file
    if (onRemoveFile) {
      onRemoveFile(fileId);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Upload Files (Images & PDFs)
      </label>

      {/* Existing files */}
      {existingFiles && existingFiles.length > 0 && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Current files:</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {existingFiles.map((file, idx) => {
              // Get file URL: Cloudinary url or local path
              const fileUrl = file.url || (file.path ? `/${file.path}` : null);
              const isImage = file.mimetype?.startsWith('image/');
              const isPdf = file.mimetype === 'application/pdf';

              return (
                <div
                  key={file._id || idx}
                  className="border rounded-lg p-3 relative group"
                >
                  {isImage && fileUrl ? (
                    <img
                      src={fileUrl}
                      alt={file.originalName}
                      className="w-full h-32 object-cover rounded mb-2"
                    />
                  ) : (
                    <div className="w-full h-32 bg-gray-100 flex items-center justify-center rounded mb-2">
                      <span className="text-4xl">{isPdf ? '📄' : '📎'}</span>
                    </div>
                  )}
                  <p className="text-xs text-gray-600 truncate">{file.originalName}</p>
                  <button
                    type="button"
                    onClick={() => removeExistingFile(file._id)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove file"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* New files to upload */}
      {files.length > 0 && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Files to upload:</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {files.map((fileObj, index) => (
              <div
                key={index}
                className="border rounded-lg p-3 relative group"
              >
                {fileObj.preview ? (
                  <img
                    src={fileObj.preview}
                    alt={fileObj.name}
                    className="w-full h-32 object-cover rounded mb-2"
                  />
                ) : (
                  <div className="w-full h-32 bg-gray-100 flex items-center justify-center rounded mb-2">
                    <span className="text-4xl">📄</span>
                  </div>
                )}
                <p className="text-xs text-gray-600 truncate">{fileObj.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(fileObj.size)}</p>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove file"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded mb-3 text-sm">
          {error}
        </div>
      )}

      {/* Upload button */}
      <div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".jpg,.jpeg,.png,.gif,.pdf"
          multiple
          className="hidden"
          id="file-upload"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || files.length >= UPLOAD_LIMITS.maxFiles}
          className="w-full"
        >
          {uploading ? 'Processing...' : 'Choose Files'}
        </Button>
        <p className="text-xs text-gray-500 mt-2">
          Maximum {UPLOAD_LIMITS.maxFiles} files. Each file max 5MB. Formats: JPG, PNG, GIF, PDF
        </p>
      </div>
    </div>
  );
};

export default FileUploader;
