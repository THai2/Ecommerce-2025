import { connectToDatabase } from '@/lib/db';
import Product from '@/models/product';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectToDatabase();
    const categories = await Product.find({ isPublished: true }).distinct('category');
    return NextResponse.json(categories);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}