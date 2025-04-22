// app/api/orders/[orderId]/paypal/create/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { formatError } from '@/lib/utils'
import Order from '@/models/order'
import { paypal } from '@/lib/paypal'
import mongoose from 'mongoose'
import { auth } from '../../../../../../../auth'

// POST: Create PayPal order
export async function POST(
  request: NextRequest,
  context: { params: { orderId: string } }
) {
  try {
    // Get the orderId from context params - no need to await
    const { orderId } = context.params
    
    // Validate orderId format
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
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
    
    // Start a session for transaction safety
    const dbSession = await mongoose.startSession()
    dbSession.startTransaction()
    
    try {
      // Find order and ensure it belongs to the authenticated user
      const order = await Order.findOne({
        _id: orderId,
        user: session.user.id
      }).session(dbSession)
      
      if (!order) {
        await dbSession.abortTransaction()
        return NextResponse.json(
          { success: false, message: 'Order not found' },
          { status: 404 }
        )
      }
      
      // Check if order already has a payment - prevent duplicate payments
      if (order.isPaid) {
        await dbSession.abortTransaction()
        return NextResponse.json(
          { success: false, message: 'Order is already paid' },
          { status: 400 }
        )
      }
      
      // Create PayPal order with proper error handling
      const paypalOrder = await paypal.createOrder(order.totalPrice)
      
      // Update order with initial payment result
      order.paymentResult = {
        id: paypalOrder.id,
        email_address: '',
        status: 'PENDING',
        pricePaid: '0',
      }
      
      // Save the order
      await order.save({ session: dbSession })
      
      // Commit transaction
      await dbSession.commitTransaction()
      
      // Return success response with PayPal order ID
      return NextResponse.json({
        success: true,
        message: 'PayPal order created successfully',
        data: paypalOrder.id,
      })
      
    } catch (error) {
      // Rollback transaction in case of error
      await dbSession.abortTransaction()
      throw error
    } finally {
      // End session
      dbSession.endSession()
    }
    
  } catch (error) {
    console.error('Error creating PayPal order:', error)
    return NextResponse.json(
      { success: false, message: formatError(error) },
      { status: 500 }
    )
  }
}