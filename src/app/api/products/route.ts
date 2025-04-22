import { connectToDatabase } from '@/lib/db';
import Product, { IProduct } from '@/models/product'; // Cập nhật import
import { NextResponse } from 'next/server';

// GET: Lấy products cho card 
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tag = searchParams.get('tag');
    const limit = parseInt(searchParams.get('limit') || '4');
    const slug = searchParams.get('slug'); // Thêm slug để lấy 1 product
    const category = searchParams.get('category'); // Thêm category để lấy related products
    const productId = searchParams.get('productId'); // Thêm productId để lấy related products
    const page = parseInt(searchParams.get('page') || '1'); // Thêm page cho related products

    await connectToDatabase();

    // Lấy một product theo slug
    if (slug) {
      const product = await Product.findOne({ slug, isPublished: true });
      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }
      return NextResponse.json(JSON.parse(JSON.stringify(product)) as IProduct);
    }

    // Lấy related products theo category
    if (category && productId) {
      const limit = parseInt(searchParams.get('limit') || '10'); // Mặc định limit = 10
      const skipAmount = (page - 1) * limit;
      const conditions = {
        isPublished: true,
        category,
        _id: { $ne: productId },
      };
      const products = await Product.find(conditions)
        .sort({ numSales: 'desc' })
        .skip(skipAmount)
        .limit(limit);
      const productsCount = await Product.countDocuments(conditions);
      return NextResponse.json({
        data: JSON.parse(JSON.stringify(products)) as IProduct[],
        totalPages: Math.ceil(productsCount / limit),
      });
    }

    // Lấy products cho card 
    if (tag) {
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
    }

    return NextResponse.json({ error: 'Tag or slug is required' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

// GET products by tag 
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


