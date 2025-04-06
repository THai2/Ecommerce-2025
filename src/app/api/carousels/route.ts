import { connectToDatabase } from '@/lib/db';
import Carousel from '@/models/carousel';
import { NextResponse } from 'next/server';
import { storage } from '@/lib/firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// POST: Tạo carousel
export async function POST(request: Request) {
  try {
    // Nhận dữ liệu từ FormData
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const buttonCaption = formData.get('buttonCaption') as string;
    const url = formData.get('url') as string;
    const isPublished = formData.get('isPublished') === 'true';
    const imageFile = formData.get('image') as File;

    // Validation
    if (!title || !buttonCaption || !url || !imageFile) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Upload hình ảnh lên Firebase Storage
    const fileName = `${Date.now()}-${imageFile.name}`; // Tạo tên file duy nhất
    const storageRef = ref(storage, `carousels/${fileName}`);
    await uploadBytes(storageRef, imageFile);
    const imageUrl = await getDownloadURL(storageRef); // Lấy URL của hình ảnh

    // Kết nối database và lưu carousel
    await connectToDatabase();
    const newCarousel = new Carousel({
      title,
      buttonCaption,
      imageUrl, // Lưu URL từ Firebase
      url,
      isPublished,
    });
    await newCarousel.save();

    return NextResponse.json(newCarousel);
  } catch {
    return NextResponse.json(
      { error: 'Failed to create carousel' },
      { status: 500 }
    );
  }
}

// GET: Lấy danh sách carousel với isPublished: true (giữ nguyên)
export async function GET() {
  try {
    await connectToDatabase();
    const carousels = await Carousel.find({ isPublished: true }).sort({ createdAt: 'desc' });
    return NextResponse.json(JSON.parse(JSON.stringify(carousels)));
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch carousels' },
      { status: 500 }
    );
  }
}