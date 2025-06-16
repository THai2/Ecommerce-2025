/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import Category, { ICategory } from "@/models/category"
import { connectToDatabase } from "../db"
import Product from "@/models/product"


// Tạo danh mục mới
export async function createCategory(data: {
  name: string
  slug: string
  description?: string
  isActive?: boolean
}) {
  try {
    await connectToDatabase()
    
    const category = new Category({
      name: data.name,
      slug: data.slug,
      description: data.description,
      isActive: data.isActive ?? true,
    })

    await category.save()
    return { success: true, category: JSON.parse(JSON.stringify(category)) }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// Lấy tất cả danh mục
export async function getCategories(activeOnly: boolean = false) {
  try {
    await connectToDatabase()
    
    const filter = activeOnly ? { isActive: true } : {}
    const categories = await Category.find(filter).sort({ name: 1 })
    
    return { success: true, categories: JSON.parse(JSON.stringify(categories)) }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// Lấy danh mục theo slug
export async function getCategoryBySlug(slug: string) {
  try {
    await connectToDatabase()
    
    const category = await Category.findOne({ slug, isActive: true })
    if (!category) {
      return { success: false, error: 'Category not found' }
    }
    
    return { success: true, category: JSON.parse(JSON.stringify(category)) }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// Cập nhật danh mục
export async function updateCategory(id: string, data: Partial<ICategory>) {
  try {
    await connectToDatabase()
    
    const category = await Category.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    )
    
    if (!category) {
      return { success: false, error: 'Category not found' }
    }
    
    return { success: true, category: JSON.parse(JSON.stringify(category)) }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// Xóa danh mục (soft delete)
export async function deleteCategory(id: string) {
  try {
    await connectToDatabase()
    
    // Lấy thông tin category trước khi xóa
    const category = await Category.findById(id)
    if (!category) {
      return { success: false, error: 'Category not found' }
    }
    
    // Kiểm tra xem có sản phẩm nào đang sử dụng danh mục này không
    const productsCount = await Product.countDocuments({ category: category.name })
    if (productsCount > 0) {
      return { success: false, error: 'Cannot delete category with existing products' }
    }
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    )
    
    return { success: true, message: 'Category deleted successfully' }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getCategoryById(id: string) {
  try {
    await connectToDatabase()
    const category = await Category.findById(id)
    if (!category) {
      return { success: false, error: 'Category not found' }
    }
    return { success: true, category: JSON.parse(JSON.stringify(category)) }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}