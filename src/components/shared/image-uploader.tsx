// components/ImageUploader.tsx
'use client';

import { useState } from 'react';
import { Loader2, Upload, X } from 'lucide-react';
import { uploadImageToFirebase } from '@/lib/firebase/config';

interface ImageUploaderProps {
  onImageUploaded: (imageData: { url: string; path: string }) => void;
  className?: string;
}

export function ImageUploader({ onImageUploaded, className }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      
      // Set up a tracking interval for a smoother progress animation
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const increment = Math.random() * 10;
          const newProgress = Math.min(prev + increment, 95);
          return newProgress;
        });
      }, 300);
      
      const imageData = await uploadImageToFirebase(file);
      
      // Clear the interval and set to 100% when complete
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Notify parent component
      onImageUploaded(imageData);
      
      // Reset state after a delay to show the 100% completion
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
      
    } catch (error) {
      console.error('Upload failed:', error);
      setIsUploading(false);
      setUploadProgress(0);
    }
    
    // Clear the input value to allow uploading the same file again
    e.target.value = '';
  };

  return (
    <div className={`flex items-center ${className}`}>
      <input
        type="file"
        id="image-upload"
        accept="image/*"
        onChange={handleFileChange}
        disabled={isUploading}
        className="sr-only" // Hide the actual input
      />
      <label
        htmlFor="image-upload"
        className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 ${
          isUploading ? 'opacity-70 cursor-not-allowed' : ''
        }`}
      >
        {isUploading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Uploading... {uploadProgress.toFixed(0)}%</span>
          </>
        ) : (
          <>
            <Upload className="h-4 w-4" />
            <span>Upload Image</span>
          </>
        )}
      </label>
    </div>
  );
}

interface ImagePreviewProps {
  imageUrl: string;
  imagePath?: string;
  onRemove: () => void;
}

export function ImagePreview({ imageUrl, onRemove }: ImagePreviewProps) {
  return (
    <div className="relative group">
      <img
        src={imageUrl}
        alt="Product preview"
        className="h-20 w-20 object-cover rounded-md"
      />
      <button
        type="button"
        onClick={onRemove}
        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
}