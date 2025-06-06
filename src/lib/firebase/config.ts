// lib/firebase/config.ts
import { initializeApp } from 'firebase/app';
import { deleteObject, getDownloadURL, getStorage, listAll, ref, uploadBytesResumable } from 'firebase/storage';

// Cấu hình Firebase (thay bằng thông tin của bạn)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);

// Khởi tạo Firebase Storage
const storage = getStorage(app);

// Helper function to generate a unique file name
const generateUniqueFileName = (file: File): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = file.name.split('.').pop();
  return `${timestamp}-${randomString}.${extension}`;
};

// Helper function to sanitize folder names
const sanitizeFolderName = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-') // Replace special characters with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
};

// Upload image with structured folder path
export async function uploadImageToFirebase(
  file: File,
  productSlug: string,
  color?: string,
  folder: string = 'products'
): Promise<{ url: string; path: string }> {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }

    const uniqueFileName = generateUniqueFileName(file);
    const sanitizedSlug = sanitizeFolderName(productSlug);
    
    // Structure: products/product-slug/color/filename or products/product-slug/main/filename
    let filePath: string;
    if (color) {
      const sanitizedColor = sanitizeFolderName(color);
      filePath = `${folder}/${sanitizedSlug}/${sanitizedColor}/${uniqueFileName}`;
    } else {
      filePath = `${folder}/${sanitizedSlug}/main/${uniqueFileName}`;
    }
    
    const storageRef = ref(storage, filePath);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        // Progress tracking (optional)
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log(`Upload progress: ${progress.toFixed(2)}%`);
      },
      (error) => {
        // Handle errors
        reject(error);
      },
      async () => {
        // Upload completed successfully
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve({
          url: downloadURL,
          path: filePath // Store this for easier deletion later
        });
      }
    );
  });
}

// Delete a single image from Firebase Storage
export async function deleteImageFromFirebase(filePath: string): Promise<void> {
  const imageRef = ref(storage, filePath);
  try {
    await deleteObject(imageRef);
    console.log(`Successfully deleted image: ${filePath}`);
  } catch (error) {
    console.error(`Error deleting image: ${filePath}`, error);
    throw error;
  }
}

// Delete all images for a product (including all colors)
export async function deleteProductImagesFromFirebase(productSlug: string, folder: string = 'products'): Promise<void> {
  const sanitizedSlug = sanitizeFolderName(productSlug);
  const productFolderRef = ref(storage, `${folder}/${sanitizedSlug}`);
  
  try {
    // List all items in the product folder
    const result = await listAll(productFolderRef);
    
    // Delete all files in subdirectories
    const deletePromises: Promise<void>[] = [];
    
    // Process each subfolder (main, colors, etc.)
    for (const prefix of result.prefixes) {
      const subResult = await listAll(prefix);
      
      // Delete all files in this subfolder
      for (const item of subResult.items) {
        deletePromises.push(deleteObject(item));
      }
    }
    
    // Wait for all deletions to complete
    await Promise.all(deletePromises);
    console.log(`Successfully deleted all images for product: ${productSlug}`);
  } catch (error) {
    console.error(`Error deleting product images: ${productSlug}`, error);
    throw error;
  }
}

// Delete all images for a specific color variant
export async function deleteVariantImagesFromFirebase(
  productSlug: string,
  color: string,
  folder: string = 'products'
): Promise<void> {
  const sanitizedSlug = sanitizeFolderName(productSlug);
  const sanitizedColor = sanitizeFolderName(color);
  const variantFolderRef = ref(storage, `${folder}/${sanitizedSlug}/${sanitizedColor}`);
  
  try {
    const result = await listAll(variantFolderRef);
    
    // Delete all files in this color folder
    const deletePromises = result.items.map(item => deleteObject(item));
    await Promise.all(deletePromises);
    
    console.log(`Successfully deleted all images for variant: ${productSlug}/${color}`);
  } catch (error) {
    console.error(`Error deleting variant images: ${productSlug}/${color}`, error);
    throw error;
  }
}

export { storage };