// components/ImageUploader.tsx
'use client';

import { useState } from 'react';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { uploadImageToFirebase } from '@/lib/firebase/config';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  onImageUploaded: (imageData: { url: string; path: string }) => void;
  productSlug: string;
  color?: string;
  className?: string;
  maxImages?: number;
  currentImagesCount?: number;
}

export function ImageUploader({ 
  onImageUploaded, 
  productSlug,
  color,
  className,
  maxImages = 10,
  currentImagesCount = 0
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  const canUpload = currentImagesCount < maxImages;

  const handleFile = async (file: File) => {
    if (!file || !canUpload) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

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
      
      const imageData = await uploadImageToFirebase(file, productSlug, color);
      
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
      alert('Failed to upload image. Please try again.');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFile(file);
    }
    // Clear the input value to allow uploading the same file again
    e.target.value = '';
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      await handleFile(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  return (
    <div 
      className={cn(
        "relative border-2 border-dashed rounded-lg p-6 transition-all",
        dragActive ? "border-primary bg-primary/5" : "border-gray-300",
        !canUpload && "opacity-50 cursor-not-allowed",
        className
      )}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        type="file"
        id={`image-upload-${color || 'main'}`}
        accept="image/*"
        onChange={handleFileChange}
        disabled={isUploading || !canUpload}
        className="sr-only"
      />
      
      <label
        htmlFor={`image-upload-${color || 'main'}`}
        className={cn(
          "flex flex-col items-center justify-center cursor-pointer",
          (isUploading || !canUpload) && "cursor-not-allowed"
        )}
      >
        {isUploading ? (
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin mx-auto mb-2 text-primary" />
            <p className="text-sm font-medium">Uploading... {uploadProgress.toFixed(0)}%</p>
            <div className="w-40 h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <>
            <ImagePlus className="h-10 w-10 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 font-medium">
              {dragActive ? "Drop image here" : "Click or drag to upload"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {color ? `Images for ${color} variant` : "Main product images"}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {currentImagesCount}/{maxImages} images uploaded
            </p>
          </>
        )}
      </label>

      {!canUpload && !isUploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
          <p className="text-sm font-medium text-gray-600">
            Maximum {maxImages} images reached
          </p>
        </div>
      )}
    </div>
  );
}

interface ImagePreviewProps {
  imageUrl: string;
  imagePath?: string;
  onRemove: () => void;
  index?: number;
}

export function ImagePreview({ imageUrl, onRemove, index = 0 }: ImagePreviewProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="relative group">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-md">
          <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
        </div>
      )}
      <img
        src={imageUrl}
        alt={`Product preview ${index + 1}`}
        className="h-24 w-24 object-cover rounded-md shadow-sm group-hover:shadow-md transition-shadow"
        onLoad={() => setIsLoading(false)}
      />
      {index === 0 && (
        <span className="absolute top-1 left-1 bg-primary text-white text-xs px-1.5 py-0.5 rounded">
          Main
        </span>
      )}
      <button
        type="button"
        onClick={onRemove}
        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
      >
        <X size={14} />
      </button>
    </div>
  );
}

// Enhanced variant image uploader with better UI
interface VariantImageUploaderProps {
  variantColor: string;
  images: { url: string; path: string }[];
  onImagesChange: (images: { url: string; path: string }[]) => void;
  productSlug: string;
  maxImages?: number;
}

export function VariantImageUploader({
  variantColor,
  images,
  onImagesChange,
  productSlug,
  maxImages = 5
}: VariantImageUploaderProps) {
  const handleImageUploaded = (imageData: { url: string; path: string }) => {
    onImagesChange([...images, imageData]);
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
        <div 
          className="w-4 h-4 rounded-full border-2 border-gray-300"
          style={{ backgroundColor: variantColor.toLowerCase() }}
        />
        {variantColor} Variant Images
      </h4>
      
      <div className="space-y-3">
        {images.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {images.map((image, index) => (
              <ImagePreview
                key={`${variantColor}-${index}-${image.url}`}
                imageUrl={image.url}
                imagePath={image.path}
                onRemove={() => handleRemoveImage(index)}
                index={index}
              />
            ))}
          </div>
        )}
        
        <ImageUploader
          onImageUploaded={handleImageUploaded}
          productSlug={productSlug}
          color={variantColor}
          maxImages={maxImages}
          currentImagesCount={images.length}
          className="h-32"
        />
      </div>
    </div>
  );
}