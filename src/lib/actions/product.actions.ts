/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import { connectToDatabase } from '@/lib/db'
import { formatError } from '../utils'
import { getSetting } from './setting.actions'
import Product, { IProduct } from '@/models/product'
import ProductVariant from '@/models/product-variant'
import { deleteProductImagesFromFirebase } from '../firebase/config'
import { IProductInput } from '@/types'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { ProductInputSchema, ProductUpdateSchema } from '../validator'
import Category from '@/models/category'

// CREATE
export async function createProduct(data: IProductInput) {
  try {
    const product = ProductInputSchema.parse(data)
    await connectToDatabase()
    await Product.create(product)
    revalidatePath('/admin/products')
    return {
      success: true,
      message: 'Product created successfully',
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// UPDATE
export async function updateProduct(data: z.infer<typeof ProductUpdateSchema>) {
  try {
    const product = ProductUpdateSchema.parse(data)
    await connectToDatabase()
    await Product.findByIdAndUpdate(product._id, product)
    revalidatePath('/admin/products')
    return {
      success: true,
      message: 'Product updated successfully',
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}


// DELETE
export async function deleteProduct(id: string) {
  try {
    await connectToDatabase()
    const res = await Product.findByIdAndDelete(id)
    if (!res) throw new Error('Product not found')
    revalidatePath('/admin/products')
    return {
      success: true,
      message: 'Product deleted successfully',
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}
// GET ONE PRODUCT BY ID
export async function getProductById(productId: string) {
  await connectToDatabase()
  const product = await Product.findById(productId)
  return JSON.parse(JSON.stringify(product)) as IProduct
}

// GET ALL PRODUCTS FOR ADMIN
export async function getAllProductsForAdmin({
  query,
  page = 1,
  sort = 'latest',
  limit,
}: {
  query: string
  page?: number
  sort?: string
  limit?: number
}) {
  await connectToDatabase()

  const {
    common: { pageSize },
  } = await getSetting()
  limit = limit || pageSize
  const queryFilter =
    query && query !== 'all'
      ? {
          name: {
            $regex: query,
            $options: 'i',
          },
        }
      : {}

  const order: Record<string, 1 | -1> =
    sort === 'best-selling'
      ? { numSales: -1 }
      : sort === 'price-low-to-high'
        ? { price: 1 }
        : sort === 'price-high-to-low'
          ? { price: -1 }
          : sort === 'avg-customer-review'
            ? { avgRating: -1 }
            : { _id: -1 }
  const products = await Product.find({
    ...queryFilter,
  })
    .sort(order)
    .skip(limit * (Number(page) - 1))
    .limit(limit)
    .lean()

  const countProducts = await Product.countDocuments({
    ...queryFilter,
  })
  return {
    products: JSON.parse(JSON.stringify(products)) as IProduct[],
    totalPages: Math.ceil(countProducts / pageSize),
    totalProducts: countProducts,
    from: pageSize * (Number(page) - 1) + 1,
    to: pageSize * (Number(page) - 1) + products.length,
  }
}

export async function getAllCategories() {
  await connectToDatabase()
  const categories = await Product.find({ isPublished: true }).distinct(
    'category'
  )
  return categories
}
export async function getProductsForCard({
  tag,
  limit = 4,
}: {
  tag: string
  limit?: number
}) {
  await connectToDatabase()
  const products = await Product.find(
    { tags: { $in: [tag] }, isPublished: true },
    {
      name: 1,
      href: { $concat: ['/product/', '$slug'] },
      image: { $arrayElemAt: ['$images', 0] },
    }
  )
    .sort({ createdAt: 'desc' })
    .limit(limit)
  return JSON.parse(JSON.stringify(products)) as {
    name: string
    href: string
    image: string
  }[]
}
// GET PRODUCTS BY TAG
export async function getProductsByTag({
  tag,
  limit = 10,
}: {
  tag: string
  limit?: number
}) {
  await connectToDatabase()
  const products = await Product.find({
    tags: { $in: [tag] },
    isPublished: true,
  })
    .sort({ createdAt: 'desc' })
    .limit(limit)
  return JSON.parse(JSON.stringify(products)) as IProduct[]
}

// GET ONE PRODUCT BY SLUG
export async function getProductBySlug(slug: string) {
  await connectToDatabase()
  const product = await Product.findOne({ slug, isPublished: true })
  if (!product) throw new Error('Product not found')
  return JSON.parse(JSON.stringify(product)) as IProduct
}
// GET RELATED PRODUCTS: PRODUCTS WITH SAME CATEGORY
export async function getRelatedProductsByCategory({
  category,
  productId,
  limit = 4,
  page = 1,
}: {
  category: string
  productId: string
  limit?: number
  page: number
}) {
  const {
    common: { pageSize },
  } = await getSetting()
  limit = limit || pageSize
  await connectToDatabase()
  const skipAmount = (Number(page) - 1) * limit
  const conditions = {
    isPublished: true,
    category,
    _id: { $ne: productId },
  }
  const products = await Product.find(conditions)
    .sort({ numSales: 'desc' })
    .skip(skipAmount)
    .limit(limit)
  const productsCount = await Product.countDocuments(conditions)
  return {
    data: JSON.parse(JSON.stringify(products)) as IProduct[],
    totalPages: Math.ceil(productsCount / limit),
  }
}

// GET ALL PRODUCTS
export async function getAllProducts({
  query,
  limit,
  page,
  category,
  tag,
  price,
  rating,
  sort,
}: {
  query: string
  category: string
  tag: string
  limit?: number
  page: number
  price?: string
  rating?: string
  sort?: string
}) {
  const {
    common: { pageSize },
  } = await getSetting()
  limit = limit || pageSize
  await connectToDatabase()

  const queryFilter =
    query && query !== 'all'
      ? {
          name: {
            $regex: query,
            $options: 'i',
          },
        }
      : {}
  const categoryFilter = category && category !== 'all' ? { category } : {}
  const tagFilter = tag && tag !== 'all' ? { tags: tag } : {}

  const ratingFilter =
    rating && rating !== 'all'
      ? {
          avgRating: {
            $gte: Number(rating),
          },
        }
      : {}
  // 10-50
  const priceFilter =
    price && price !== 'all'
      ? {
          price: {
            $gte: Number(price.split('-')[0]),
            $lte: Number(price.split('-')[1]),
          },
        }
      : {}
  const order: Record<string, 1 | -1> =
    sort === 'best-selling'
      ? { numSales: -1 }
      : sort === 'price-low-to-high'
        ? { price: 1 }
        : sort === 'price-high-to-low'
          ? { price: -1 }
          : sort === 'avg-customer-review'
            ? { avgRating: -1 }
            : { _id: -1 }
  const isPublished = { isPublished: true }
  const products = await Product.find({
    ...isPublished,
    ...queryFilter,
    ...tagFilter,
    ...categoryFilter,
    ...priceFilter,
    ...ratingFilter,
  })
    .sort(order)
    .skip(limit * (Number(page) - 1))
    .limit(limit)
    .lean()

  const countProducts = await Product.countDocuments({
    ...queryFilter,
    ...tagFilter,
    ...categoryFilter,
    ...priceFilter,
    ...ratingFilter,
  })
  return {
    products: JSON.parse(JSON.stringify(products)) as IProduct[],
    totalPages: Math.ceil(countProducts / limit),
    totalProducts: countProducts,
    from: limit * (Number(page) - 1) + 1,
    to: limit * (Number(page) - 1) + products.length,
  }
}

export async function getAllTags() {
  const tags = await Product.aggregate([
    { $unwind: '$tags' },
    { $group: { _id: null, uniqueTags: { $addToSet: '$tags' } } },
    { $project: { _id: 0, uniqueTags: 1 } },
  ])
  return (
    (tags[0]?.uniqueTags
      .sort((a: string, b: string) => a.localeCompare(b))
      .map((x: string) =>
        x
          .split('-')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
      ) as string[]) || []
  )
}

// Lấy sản phẩm theo danh mục (sử dụng name hoặc slug)
export async function getProductsByCategory(categoryIdentifier: string, page: number = 1, limit: number = 12) {
  try {
    await connectToDatabase()
    
    // Tìm category theo slug hoặc name
    const category = await Category.findOne({ 
      $or: [
        { slug: categoryIdentifier },
        { name: categoryIdentifier }
      ],
      isActive: true 
    })
    
    if (!category) {
      return { success: false, error: 'Category not found' }
    }
    
    const skip = (page - 1) * limit
    
    const products = await Product.find({ 
      category: category.name, // Sử dụng name để liên kết với Product
      isPublished: true 
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    
    const total = await Product.countDocuments({ 
      category: category.name, 
      isPublished: true 
    })
    
    return {
      success: true,
      products: JSON.parse(JSON.stringify(products)),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      category: JSON.parse(JSON.stringify(category))
    }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// Lấy số lượng sản phẩm theo từng danh mục
export async function getCategoriesWithProductCount() {
  try {
    await connectToDatabase()
    
    const categories = await Category.find({ isActive: true }).sort({ name: 1 })
    
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const productCount = await Product.countDocuments({ 
          category: category.name, // Sử dụng name để liên kết với Product
          isPublished: true 
        })
        
        return {
          ...JSON.parse(JSON.stringify(category)),
          productCount
        }
      })
    )
    
    return { success: true, categories: categoriesWithCount }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

//BRANDS AND TAGS ACTIONS
// Lấy tất cả brands với số lượng sản phẩm
export async function getBrandsWithProductCount() {
  try {
    await connectToDatabase()
    
    const brands = await Product.aggregate([
      { $match: { isPublished: true } },
      { 
        $group: { 
          _id: '$brand', 
          productCount: { $sum: 1 },
          totalSales: { $sum: '$numSales' },
          avgRating: { $avg: '$avgRating' }
        } 
      },
      { 
        $project: { 
          _id: 0, 
          brand: '$_id', 
          productCount: 1,
          totalSales: 1,
          avgRating: { $round: ['$avgRating', 1] }
        } 
      },
      { $sort: { productCount: -1 } }
    ])
    
    return { success: true, brands }
  } catch (error: any) {
    return { success: false, error: formatError(error) }
  }
}

// Lấy tất cả tags với số lượng sản phẩm
export async function getTagsWithProductCount() {
  try {
    await connectToDatabase()
    
    const tags = await Product.aggregate([
      { $match: { isPublished: true } },
      { $unwind: '$tags' },
      { 
        $group: { 
          _id: '$tags', 
          productCount: { $sum: 1 },
          totalSales: { $sum: '$numSales' },
          avgRating: { $avg: '$avgRating' }
        } 
      },
      { 
        $project: { 
          _id: 0, 
          tag: '$_id', 
          productCount: 1,
          totalSales: 1,
          avgRating: { $round: ['$avgRating', 1] }
        } 
      },
      { $sort: { productCount: -1 } }
    ])
    
    return { success: true, tags }
  } catch (error: any) {
    return { success: false, error: formatError(error) }
  }
}

// Lấy sản phẩm theo brand
export async function getProductsByBrand({
  brand,
  page = 1,
  limit = 12,
  sort = 'latest'
}: {
  brand: string
  page?: number
  limit?: number
  sort?: string
}) {
  try {
    await connectToDatabase()
    
    const order: Record<string, 1 | -1> =
      sort === 'best-selling'
        ? { numSales: -1 }
        : sort === 'price-low-to-high'
          ? { price: 1 }
          : sort === 'price-high-to-low'
            ? { price: -1 }
            : sort === 'avg-customer-review'
              ? { avgRating: -1 }
              : { createdAt: -1 }
    
    const skip = (page - 1) * limit
    
    const products = await Product.find({ 
      brand, 
      isPublished: true 
    })
    .sort(order)
    .skip(skip)
    .limit(limit)
    
    const total = await Product.countDocuments({ 
      brand, 
      isPublished: true 
    })
    
    return {
      success: true,
      products: JSON.parse(JSON.stringify(products)),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      }
    }
  } catch (error: any) {
    return { success: false, error: formatError(error) }
  }
}

// Lấy sản phẩm theo tag (đã có sẵn trong code gốc, nhưng cải tiến thêm)
export async function getProductsByTagEnhanced({
  tag,
  page = 1,
  limit = 12,
  sort = 'latest'
}: {
  tag: string
  page?: number
  limit?: number
  sort?: string
}) {
  try {
    await connectToDatabase()
    
    const order: Record<string, 1 | -1> =
      sort === 'best-selling'
        ? { numSales: -1 }
        : sort === 'price-low-to-high'
          ? { price: 1 }
          : sort === 'price-high-to-low'
            ? { price: -1 }
            : sort === 'avg-customer-review'
              ? { avgRating: -1 }
              : { createdAt: -1 }
    
    const skip = (page - 1) * limit
    
    const products = await Product.find({ 
      tags: { $in: [tag] }, 
      isPublished: true 
    })
    .sort(order)
    .skip(skip)
    .limit(limit)
    
    const total = await Product.countDocuments({ 
      tags: { $in: [tag] }, 
      isPublished: true 
    })
    
    return {
      success: true,
      products: JSON.parse(JSON.stringify(products)),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      }
    }
  } catch (error: any) {
    return { success: false, error: formatError(error) }
  }
}

// Lấy thống kê tổng quan brands & tags
export async function getBrandTagStatistics() {
  try {
    await connectToDatabase()
    
    const [brandStats, tagStats] = await Promise.all([
      Product.aggregate([
        { $match: { isPublished: true } },
        { $group: { _id: '$brand' } },
        { $count: 'totalBrands' }
      ]),
      Product.aggregate([
        { $match: { isPublished: true } },
        { $unwind: '$tags' },
        { $group: { _id: '$tags' } },
        { $count: 'totalTags' }
      ])
    ])
    
    const totalBrands = brandStats[0]?.totalBrands || 0
    const totalTags = tagStats[0]?.totalTags || 0
    
    return {
      success: true,
      statistics: {
        totalBrands,
        totalTags
      }
    }
  } catch (error: any) {
    return { success: false, error: formatError(error) }
  }
}