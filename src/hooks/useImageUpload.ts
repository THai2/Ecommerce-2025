import { useState } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase/config';

interface UploadImageOptions {
  maxSizeMB?: number;
  allowedTypes?: string[];
  folder?: string;
}

interface UploadImageResult {
  url: string | null;
  error: string | null;
  progress: number;
}

export default function useImageUpload() {
  const [uploadResult, setUploadResult] = useState<UploadImageResult>({
    url: null,
    error: null,
    progress: 0
  });

  const validateImage = (file: File, options: UploadImageOptions): string | null => {
    const { maxSizeMB = 2, allowedTypes = ['image/jpeg', 'image/png', 'image/webp'] } = options;
    
    if (!file) {
      return 'No file selected';
    }
    
    if (!allowedTypes.includes(file.type)) {
      return `File type not supported. Allowed types: ${allowedTypes.join(', ')}`;
    }
    
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      return `File size exceeds ${maxSizeMB}MB limit`;
    }
    
    return null;
  };

  const uploadImage = async (file: File, options: UploadImageOptions = {}): Promise<string> => {
    const { folder = 'carousels' } = options;
    
    // Validate image
    const validationError = validateImage(file, options);
    if (validationError) {
      setUploadResult({
        url: null,
        error: validationError,
        progress: 0
      });
      throw new Error(validationError);
    }

    // Create a unique file name
    const timestamp = new Date().getTime();
    const fileName = `${file.name.split('.')[0]}_${timestamp}`;
    const fileExtension = file.name.split('.').pop();
    const fullPath = `${folder}/${fileName}.${fileExtension}`;
    
    // Create storage reference
    const storageRef = ref(storage, fullPath);
    
    // Upload file
    const uploadTask = uploadBytesResumable(storageRef, file);
    
    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          setUploadResult(prev => ({ ...prev, progress }));
        },
        (error) => {
          setUploadResult({
            url: null,
            error: error.message,
            progress: 0
          });
          reject(error.message);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setUploadResult({
            url: downloadURL,
            error: null,
            progress: 100
          });
          resolve(downloadURL);
        }
      );
    });
  };

  return {
    uploadImage,
    uploadResult,
    validateImage
  };
}