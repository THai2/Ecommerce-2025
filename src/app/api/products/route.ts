import { connectToDatabase } from '@/lib/db';
import Product, { IProduct } from '@/models/product'; // Cập nhật import
import { NextResponse } from 'next/server';

// GET products cho card (hàm cũ)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tag = searchParams.get('tag');
    const limit = parseInt(searchParams.get('limit') || '4');

    if (!tag) {
      return NextResponse.json(
        { error: 'Tag is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const products = await Product.find(
      { tags: { $in: [tag] }, isPublished: true },
      {
        name: 1,
        href: { $concat: ['/product/', '$slug'] },
        image: { $arrayElemAt: ['$images', 0] },
      }
    )
      .sort({ createdAt: 'desc' })
      .limit(limit);

    return NextResponse.json(JSON.parse(JSON.stringify(products)));
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// GET products by tag (hàm mới)
export async function POST(request: Request) {
  try {
    const { tag, limit = 10 } = await request.json();

    if (!tag) {
      return NextResponse.json(
        { error: 'Tag is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const products = await Product.find({
      tags: { $in: [tag] },
      isPublished: true,
    })
      .sort({ createdAt: 'desc' })
      .limit(limit);

    return NextResponse.json(JSON.parse(JSON.stringify(products)) as IProduct[]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch products by tag' },
      { status: 500 }
    );
  }
}