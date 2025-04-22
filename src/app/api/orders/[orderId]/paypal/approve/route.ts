import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { formatError } from '@/lib/utils'
import Order from '@/models/order'
import { paypal } from '@/lib/paypal'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import mongoose from 'mongoose'
import { auth } from '../../../../../../../auth'
import { sendPurchaseReceipt } from '../../../../../../../emails'

// Input validation schema
const approvePayPalSchema = z.object({
  orderID: z.string().min(1, "PayPal order ID is required")
})

// POST: Approve and capture PayPal payment
export async function POST(
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

    // Parse and validate request body
    let data: { orderID: string }
    try {
      data = approvePayPalSchema.parse(await request.json())
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { success: false, message: error.errors[0].message },
          { status: 400 }
        )
      }
      throw error
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
      // Find order with user data for email receipt
      const order = await Order.findOne({
        _id: params.orderId,
        user: session.user.id
      }).populate('user', 'email').session(dbSession)
      
      if (!order) {
        await dbSession.abortTransaction()
        return NextResponse.json(
          { success: false, message: 'Order not found' },
          { status: 404 }
        )
      }
      
      // Verify order isn't already paid
      if (order.isPaid) {
        await dbSession.abortTransaction()
        return NextResponse.json(
          { success: false, message: 'Order is already paid' },
          { status: 400 }
        )
      }
      
      // Capture payment from PayPal with retries
      let captureData
      try {
        captureData = await paypal.capturePayment(data.orderID)
      } catch (error) {
        console.error('PayPal capture failed:', error)
        await dbSession.abortTransaction()
        return NextResponse.json(
          { success: false, message: 'Payment capture failed' },
          { status: 500 }
        )
      }
      
      // Validate capture data against our order
      if (
        !captureData ||
        captureData.id !== order.paymentResult?.id ||
        captureData.status !== 'COMPLETED'
      ) {
        await dbSession.abortTransaction()
        return NextResponse.json(
          { success: false, message: 'Error in PayPal payment verification' },
          { status: 400 }
        )
      }
      
      // Update order with payment details
      order.isPaid = true
      order.paidAt = new Date()
      order.paymentResult = {
        id: captureData.id,
        status: captureData.status,
        email_address: captureData.payer.email_address,
        pricePaid: captureData.purchase_units[0]?.payments?.captures[0]?.amount?.value,
      }
      
      // Save order
      await order.save({ session: dbSession })
      
      // Commit transaction
      await dbSession.commitTransaction()
      
      // Non-blocking operations after successful payment
      // These operations should not block the response
      
      // Send confirmation email
      sendPurchaseReceipt({ order })
        .catch(error => console.error('Error sending receipt email:', error))
      
      // Revalidate page cache
      revalidatePath(`/account/orders/${params.orderId}`)
      
      // Return success response
      return NextResponse.json({
        success: true,
        message: 'Your order has been successfully paid by PayPal',
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
    console.error('Error processing PayPal payment:', error)
    return NextResponse.json(
      { success: false, message: formatError(error) },
      { status: 500 }
    )
  }
}