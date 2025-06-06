import { deleteProductImagesFromFirebase, deleteVariantImagesFromFirebase } from '@/lib/firebase/config';
import Product from '@/models/product';
import ProductVariant from '@/models/product-variant';

// Delete a product and all its associated images
export async function deleteProduct(productId: string): Promise<void> {
  try {
    // Get product details first
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    // Delete all variants and their images
    const variants = await ProductVariant.find({ productId });
    
    // Delete variant images from Firebase
    for (const variant of variants) {
      if (variant.images && variant.images.length > 0) {
        await deleteVariantImagesFromFirebase(product.slug, variant.color);
      }
    }

    // Delete main product images from Firebase
    if (product.slug) {
      await deleteProductImagesFromFirebase(product.slug);
    }

    // Delete all variants from database
    await ProductVariant.deleteMany({ productId });

    // Delete product from database
    await Product.findByIdAndDelete(productId);

    console.log(`Successfully deleted product ${product.name} and all associated data`);
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
}

// Delete a specific variant and its images
export async function deleteProductVariant(variantId: string): Promise<void> {
  try {
    const variant = await ProductVariant.findById(variantId);
    if (!variant) {
      throw new Error('Variant not found');
    }

    // Get product for slug
    const product = await Product.findById(variant.productId);
    if (!product) {
      throw new Error('Product not found');
    }

    // Delete variant images from Firebase
    if (variant.images && variant.images.length > 0 && product.slug) {
      await deleteVariantImagesFromFirebase(product.slug, variant.color);
    }

    // Delete variant from database
    await ProductVariant.findByIdAndDelete(variantId);

    // Update product's total stock count
    await updateProductStock(variant.productId);

    console.log(`Successfully deleted variant ${variant.color} for product ${product.name}`);
  } catch (error) {
    console.error('Error deleting variant:', error);
    throw error;
  }
}

// Update product's total stock after variant changes
async function updateProductStock(productId: string): Promise<void> {
  const variants = await ProductVariant.find({ productId });
  
  let totalStock = 0;
  variants.forEach(variant => {
    variant.sizeStock.forEach(sizeItem => {
      totalStock += sizeItem.stock;
    });
  });

  await Product.findByIdAndUpdate(productId, { countInStock: totalStock });
}