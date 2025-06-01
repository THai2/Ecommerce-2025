'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '../../../auth'
import { connectToDatabase } from '../db'
import Wishlist from '@/models/wishlist'

export async function addToWishlist(productId: string) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return {
        success: false,
        message: 'You need to login to add to wishlist'
      }
    }

    await connectToDatabase()

    let wishlist = await Wishlist.findOne({ user: session.user.id })

    if (!wishlist) {
      wishlist = new Wishlist({
        user: session.user.id,
        products: [productId]
      })
    } else {
      if (wishlist.products.includes(productId)) {
        return {
          success: false,
          message: 'Product already in wishlist'
        }
      }
      
      wishlist.products.push(productId)
    }

    await wishlist.save()

    revalidatePath('/wishlist')
    revalidatePath('/products')

    return {
      success: true,
      message: 'Added to wishlist successfully'
    }
  } catch (error) {
    console.error('Error adding to wishlist:', error)
    return {
      success: false,
      message: 'Failed to add to wishlist'
    }
  }
}

export async function removeFromWishlist(productId: string) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return {
        success: false,
        message: 'You need to login'
      }
    }

    await connectToDatabase()

    const wishlist = await Wishlist.findOne({ user: session.user.id })

    if (!wishlist) {
      return {
        success: false,
        message: 'Wishlist not found'
      }
    }

    wishlist.products = wishlist.products.filter(
      (id: string) => id.toString() !== productId
    )

    await wishlist.save()

    revalidatePath('/wishlist')
    revalidatePath('/products')

    return {
      success: true,
      message: 'Removed from wishlist'
    }
  } catch (error) {
    console.error('Error removing from wishlist:', error)
    return {
      success: false,
      message: 'Failed to remove from wishlist'
    }
  }
}

export async function getWishlist() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return {
        success: false,
        wishlist: null,
        message: 'You need to login'
      }
    }

    await connectToDatabase()

    const wishlist = await Wishlist.findOne({ user: session.user.id })
      .populate('products')
      .exec()

    return {
      success: true,
      wishlist: wishlist || { products: [] },
      message: 'Wishlist retrieved successfully'
    }
  } catch (error) {
    console.error('Error getting wishlist:', error)
    return {
      success: false,
      wishlist: null,
      message: 'Failed to retrieve wishlist'
    }
  }
}

export async function checkInWishlist(productId: string) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return false
    }

    await connectToDatabase()

    const wishlist = await Wishlist.findOne({ 
      user: session.user.id,
      products: productId 
    })

    return !!wishlist
  } catch (error) {
    console.error('Error checking wishlist:', error)
    return false
  }
}