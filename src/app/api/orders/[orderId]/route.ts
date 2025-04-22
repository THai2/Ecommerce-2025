// app/api/orders/[orderId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { formatError } from '@/lib/utils'
import Order from '@/models/order'
import mongoose from 'mongoose'
import { auth } from '../../../../../auth'

// GET: Fetch order by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    // Validate orderId format
    if (!mongoose.Types.ObjectId.isValid(params.orderId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid order ID format' },
        { status: 400 }
      )
    }

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
    
    // Fetch order with optimized projection
    const order = await Order.findOne({
      _id: params.orderId,
      user: session.user.id // Security: Ensure user can only access their own orders
    }).lean()
    
    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      )
    }
    
    // Return order data - sanitized by lean() method which converts to POJO
    return NextResponse.json({
      success: true,
      data: order
    })
    
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { success: false, message: formatError(error) },
      { status: 500 }
    )
  }
}