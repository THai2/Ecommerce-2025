'use server'

import { connectToDatabase } from '@/lib/db'
import ProductVariant, { IProductVariant } from '@/models/product-variant'
import Product from '@/models/product'
import { formatError } from '../utils'
import { revalidatePath } from 'next/cache'

// Interface cho input data
export interface IProductVariantInput {
  productId: string
  color: string
  images: string[]
  sizeStock: {
    size: string
    stock: number
  }[]
}

// CREATE/UPDATE - Tạo hoặc cập nhật variant (upsert)
export async function upsertProductVariant(data: IProductVariantInput) {
  try {
    await connectToDatabase()
    
    // Kiểm tra product có tồn tại không
    const product = await Product.findById(data.productId)
    if (!product) {
      return {
        success: false,
        message: 'Product not found'
      }
    }
    
    // Kiểm tra color có trong danh sách colors của product không
    if (!product.colors.includes(data.color)) {
      return {
        success: false,
        message: `Color "${data.color}" is not available for this product`
      }
    }
    
    // Kiểm tra tất cả sizes có trong danh sách sizes của product không
    const invalidSizes = data.sizeStock
      .map(s => s.size)
      .filter(size => !product.sizes.includes(size))
    
    if (invalidSizes.length > 0) {
      return {
        success: false,
        message: `Invalid sizes: ${invalidSizes.join(', ')}`
      }
    }
    
    const variant = await ProductVariant.findOneAndUpdate(
      { 
        productId: data.productId,
        color: data.color 
      },
      {
        images: data.images,
        sizeStock: data.sizeStock,
      },
      { 
        upsert: true, 
        new: true,
        runValidators: true
      }
    )
    
    // Cập nhật tổng stock của product
    await updateProductTotalStock(data.productId)
    
    revalidatePath(`/admin/products/${data.productId}`)
    revalidatePath(`/admin/products/${data.productId}/variants`)
    
    return {
      success: true,
      message: 'Product variant saved successfully',
      data: JSON.parse(JSON.stringify(variant)) as IProductVariant,
    }
  } catch (error) {
    return { 
      success: false, 
      message: formatError(error) 
    }
  }
}

// READ - Lấy tất cả variants của một sản phẩm
export async function getProductVariants(productId: string) {
  try {
    await connectToDatabase()
    
    const variants = await ProductVariant.find({ productId })
      .sort({ color: 1 })
      .lean()
    
    return JSON.parse(JSON.stringify(variants)) as IProductVariant[]
  } catch (error) {
    console.error('Error fetching product variants:', error)
    return []
  }
}

// READ - Lấy variant theo productId và color
export async function getProductVariantByColor(productId: string, color: string) {
  try {
    await connectToDatabase()
    
    const variant = await ProductVariant.findOne({ 
      productId, 
      color 
    }).lean()
    
    return variant ? JSON.parse(JSON.stringify(variant)) as IProductVariant : null
  } catch (error) {
    console.error('Error fetching product variant:', error)
    return null
  }
}

// READ - Lấy variant theo ID
export async function getProductVariantById(variantId: string) {
  try {
    await connectToDatabase()
    
    const variant = await ProductVariant.findById(variantId).lean()
    
    return variant ? JSON.parse(JSON.stringify(variant)) as IProductVariant : null
  } catch (error) {
    console.error('Error fetching product variant:', error)
    return null
  }
}

// DELETE - Xóa variant
export async function deleteProductVariant(productId: string, color: string) {
  try {
    await connectToDatabase()
    
    const result = await ProductVariant.findOneAndDelete({ 
      productId, 
      color 
    })
    
    if (!result) {
      return {
        success: false,
        message: 'Product variant not found'
      }
    }
    
    // Cập nhật lại tổng stock của product
    await updateProductTotalStock(productId)
    
    revalidatePath(`/admin/products/${productId}`)
    revalidatePath(`/admin/products/${productId}/variants`)
    
    return {
      success: true,
      message: 'Product variant deleted successfully',
    }
  } catch (error) {
    return { 
      success: false, 
      message: formatError(error) 
    }
  }
}

// DELETE - Xóa variant theo ID
export async function deleteProductVariantById(variantId: string) {
  try {
    await connectToDatabase()
    
    const variant = await ProductVariant.findById(variantId)
    if (!variant) {
      return {
        success: false,
        message: 'Product variant not found'
      }
    }
    
    const productId = variant.productId
    await ProductVariant.findByIdAndDelete(variantId)
    
    // Cập nhật lại tổng stock của product
    await updateProductTotalStock(productId)
    
    revalidatePath(`/admin/products/${productId}`)
    revalidatePath(`/admin/products/${productId}/variants`)
    
    return {
      success: true,
      message: 'Product variant deleted successfully',
    }
  } catch (error) {
    return { 
      success: false, 
      message: formatError(error) 
    }
  }
}

// DELETE - Xóa tất cả variants của một sản phẩm (khi xóa sản phẩm)
export async function deleteAllProductVariants(productId: string) {
  try {
    await connectToDatabase()
    
    const result = await ProductVariant.deleteMany({ productId })
    
    return {
      success: true,
      message: `Deleted ${result.deletedCount} product variants`,
      deletedCount: result.deletedCount,
    }
  } catch (error) {
    return { 
      success: false, 
      message: formatError(error) 
    }
  }
}

// UPDATE - Cập nhật stock cho một size cụ thể
export async function updateSizeStock(
  productId: string, 
  color: string, 
  size: string, 
  stock: number
) {
  try {
    await connectToDatabase()
    
    // Kiểm tra stock không âm
    if (stock < 0) {
      return {
        success: false,
        message: 'Stock cannot be negative'
      }
    }
    
    const variant = await ProductVariant.findOneAndUpdate(
      { 
        productId, 
        color,
        'sizeStock.size': size 
      },
      { 
        $set: { 'sizeStock.$.stock': stock } 
      },
      { new: true, runValidators: true }
    )
    
    if (!variant) {
      return {
        success: false,
        message: 'Product variant or size not found'
      }
    }
    
    // Cập nhật tổng stock của product
    await updateProductTotalStock(productId)
    
    revalidatePath(`/admin/products/${productId}`)
    revalidatePath(`/admin/products/${productId}/variants`)
    
    return {
      success: true,
      message: 'Size stock updated successfully',
      data: JSON.parse(JSON.stringify(variant)) as IProductVariant,
    }
  } catch (error) {
    return { 
      success: false, 
      message: formatError(error) 
    }
  }
}

// UTILITY - Cập nhật tổng stock của product từ tất cả variants
export async function updateProductTotalStock(productId: string) {
  try {
    await connectToDatabase()
    
    const totalStock = await getTotalStock(productId)
    
    await Product.findByIdAndUpdate(
      productId,
      { countInStock: totalStock },
      { runValidators: false } // Không cần validate khi chỉ update stock
    )
    
    return totalStock
  } catch (error) {
    console.error('Error updating product total stock:', error)
    return 0
  }
}

// UTILITY - Lấy tổng stock của tất cả variants
export async function getTotalStock(productId: string) {
  try {
    await connectToDatabase()
    
    const variants = await ProductVariant.find({ productId })
    
    let totalStock = 0
    variants.forEach(variant => {
      variant.sizeStock.forEach(sizeStock => {
        totalStock += sizeStock.stock
      })
    })
    
    return totalStock
  } catch (error) {
    console.error('Error calculating total stock:', error)
    return 0
  }
}

// UTILITY - Kiểm tra stock availability
export async function checkStockAvailability(
  productId: string, 
  color: string, 
  size: string
) {
  try {
    const variant = await getProductVariantByColor(productId, color)
    
    if (!variant) return 0
    
    const sizeStock = variant.sizeStock.find(s => s.size === size)
    return sizeStock ? sizeStock.stock : 0
  } catch (error) {
    console.error('Error checking stock availability:', error)
    return 0
  }
}

// UTILITY - Lấy tất cả màu sắc có sẵn với stock > 0
export async function getAvailableColors(productId: string) {
  try {
    await connectToDatabase()
    
    const variants = await ProductVariant.find({ productId })
    
    const availableColors = variants
      .filter(variant => {
        // Kiểm tra xem variant có ít nhất 1 size có stock > 0
        return variant.sizeStock.some(sizeStock => sizeStock.stock > 0)
      })
      .map(variant => ({
        color: variant.color,
        images: variant.images,
        totalStock: variant.sizeStock.reduce((sum, s) => sum + s.stock, 0)
      }))
    
    return availableColors
  } catch (error) {
    console.error('Error fetching available colors:', error)
    return []
  }
}

// UTILITY - Lấy tất cả sizes có sẵn cho một màu cụ thể
export async function getAvailableSizes(productId: string, color: string) {
  try {
    const variant = await getProductVariantByColor(productId, color)
    
    if (!variant) return []
    
    return variant.sizeStock
      .filter(sizeStock => sizeStock.stock > 0)
      .map(sizeStock => ({
        size: sizeStock.size,
        stock: sizeStock.stock
      }))
  } catch (error) {
    console.error('Error fetching available sizes:', error)
    return []
  }
}

// UTILITY - Bulk update stock cho nhiều variants
export async function bulkUpdateVariantStock(
  updates: Array<{
    productId: string
    color: string
    size: string
    stock: number
  }>
) {
  try {
    await connectToDatabase()
    
    const bulkOps = updates.map(update => ({
      updateOne: {
        filter: {
          productId: update.productId,
          color: update.color,
          'sizeStock.size': update.size
        },
        update: {
          $set: { 'sizeStock.$.stock': update.stock }
        }
      }
    }))
    
    const result = await ProductVariant.bulkWrite(bulkOps)
    
    // Cập nhật tổng stock cho tất cả products bị ảnh hưởng
    const affectedProductIds = [...new Set(updates.map(u => u.productId))]
    await Promise.all(
      affectedProductIds.map(productId => updateProductTotalStock(productId))
    )
    
    // Revalidate paths
    affectedProductIds.forEach(productId => {
      revalidatePath(`/admin/products/${productId}`)
      revalidatePath(`/admin/products/${productId}/variants`)
    })
    
    return {
      success: true,
      message: `Updated ${result.modifiedCount} variant stocks`,
      modifiedCount: result.modifiedCount,
    }
  } catch (error) {
    return { 
      success: false, 
      message: formatError(error) 
    }
  }
}

// UTILITY - Lấy low stock variants (stock < threshold)
export async function getLowStockVariants(threshold: number = 5) {
  try {
    await connectToDatabase()
    
    const variants = await ProductVariant.find({}).lean()
    
    const lowStockVariants = variants
      .map(variant => ({
        ...variant,
        lowStockSizes: variant.sizeStock.filter(s => s.stock <= threshold && s.stock > 0)
      }))
      .filter(variant => variant.lowStockSizes.length > 0)
    
    return JSON.parse(JSON.stringify(lowStockVariants))
  } catch (error) {
    console.error('Error fetching low stock variants:', error)
    return []
  }
}

// UTILITY - Lấy out of stock variants
export async function getOutOfStockVariants() {
  try {
    await connectToDatabase()
    
    const variants = await ProductVariant.find({}).lean()
    
    const outOfStockVariants = variants
      .map(variant => ({
        ...variant,
        outOfStockSizes: variant.sizeStock.filter(s => s.stock === 0)
      }))
      .filter(variant => 
        variant.sizeStock.every(s => s.stock === 0) || // Tất cả sizes hết hàng
        variant.outOfStockSizes.length > 0 // Có ít nhất 1 size hết hàng
      )
    
    return JSON.parse(JSON.stringify(outOfStockVariants))
  } catch (error) {
    console.error('Error fetching out of stock variants:', error)
    return []
  }
}

// CREATE - Tạo variant mới (không upsert)
export async function createProductVariant(variant: IProductVariantInput) {
  try {
    await connectToDatabase()
    
    // Kiểm tra variant đã tồn tại chưa
    const existingVariant = await ProductVariant.findOne({
      productId: variant.productId,
      color: variant.color
    })
    
    if (existingVariant) {
      return {
        success: false,
        message: `Variant with color "${variant.color}" already exists`
      }
    }
    
    const newVariant = await ProductVariant.create(variant)
    
    // Cập nhật tổng stock của product
    await updateProductTotalStock(variant.productId)
    
    revalidatePath(`/admin/products/${variant.productId}`)
    revalidatePath(`/admin/products/${variant.productId}/variants`)
    
    return {
      success: true,
      message: 'Product variant created successfully',
      data: JSON.parse(JSON.stringify(newVariant)) as IProductVariant,
    }
  } catch (error) {
    return { 
      success: false, 
      message: formatError(error) 
    }
  }
}

// UPDATE - Cập nhật variant (không tạo mới)
export async function updateProductVariant(
  variantId: string,
  updates: Partial<IProductVariantInput>
) {
  try {
    await connectToDatabase()
    
    const variant = await ProductVariant.findById(variantId)
    if (!variant) {
      return {
        success: false,
        message: 'Product variant not found'
      }
    }
    
    const updatedVariant = await ProductVariant.findByIdAndUpdate(
      variantId,
      updates,
      { new: true, runValidators: true }
    )
    
    // Cập nhật tổng stock của product
    await updateProductTotalStock(variant.productId)
    
    revalidatePath(`/admin/products/${variant.productId}`)
    revalidatePath(`/admin/products/${variant.productId}/variants`)
    
    return {
      success: true,
      message: 'Product variant updated successfully',
      data: JSON.parse(JSON.stringify(updatedVariant)) as IProductVariant,
    }
  } catch (error) {
    return { 
      success: false, 
      message: formatError(error) 
    }
  }
}