// app/api/orders/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { Cart } from '@/types'
import { formatError } from '@/lib/utils'
import { OrderInputSchema } from '@/lib/validator'
import Order from '@/models/order'
import { auth } from '../../../../auth'
import { calcDeliveryDateAndPrice } from '@/services/order-service'


//Create
export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await connectToDatabase()
    
    // Authenticate user
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Parse the request body
    const clientSideCart: Cart = await request.json()
    
    // Create order
    const createdOrder = await createOrderFromCart(
      clientSideCart,
      session.user.id!
    )
    
    // Return successful response
    return NextResponse.json({
      success: true,
      message: 'Order placed successfully',
      data: { orderId: createdOrder._id.toString() }
    }, { status: 201 })
    
  } catch (error) {
    // Handle errors
    console.error('Error creating order:', error)
    return NextResponse.json(
      { success: false, message: formatError(error) },
      { status: 400 }
    )
  }
}

// Helper function to create an order from cart
async function createOrderFromCart(
  clientSideCart: Cart,
  userId: string
) {
  // Recalculate prices on the server
  const priceData = await calcDeliveryDateAndPrice({
    items: clientSideCart.items,
    shippingAddress: clientSideCart.shippingAddress,
    deliveryDateIndex: clientSideCart.deliveryDateIndex,
  })
  
  // Merge cart with calculated prices
  const cart = {
    ...clientSideCart,
    ...priceData,
  }

  // Validate order data
  const order = OrderInputSchema.parse({
    user: userId,
    items: cart.items,
    shippingAddress: cart.shippingAddress,
    paymentMethod: cart.paymentMethod,
    itemsPrice: cart.itemsPrice,
    shippingPrice: cart.shippingPrice,
    taxPrice: cart.taxPrice,
    totalPrice: cart.totalPrice,
    expectedDeliveryDate: cart.expectedDeliveryDate,
  })
  
  // Create and return order
  return await Order.create(order)
}
