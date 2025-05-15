import { initializeApp } from 'firebase/app';
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

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
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Helper function to generate a unique file name
const generateUniqueFileName = (file: File): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = file.name.split('.').pop();
  return `${timestamp}-${randomString}.${extension}`;
};

// Helper function to upload a file to Firebase Storage
export async function uploadImageToFirebase(
  file: File, 
  folder: string = 'products'
): Promise<{ url: string; path: string }> {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }

    const uniqueFileName = generateUniqueFileName(file);
    const filePath = `${folder}/${uniqueFileName}`;
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

// Helper function to delete a file from Firebase Storage
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


export { storage,auth,googleProvider };