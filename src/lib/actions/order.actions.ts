'use server'

import { revalidatePath } from 'next/cache'
import { paypal } from '../paypal'
import Order, { IOrder } from '@/models/order'
import { connectToDatabase } from '../db'
import { formatError } from '../utils'
import { sendPurchaseReceipt } from '../../../emails'
export async function getOrderById(orderId: string): Promise<IOrder> {
  await connectToDatabase()
  const order = await Order.findById(orderId)
  return JSON.parse(JSON.stringify(order))
}

export async function createPayPalOrder(orderId: string) {
  await connectToDatabase()
  try {
    const order = await Order.findById(orderId)
    if (order) {
      const paypalOrder = await paypal.createOrder(order.totalPrice)
      order.paymentResult = {
        id: paypalOrder.id,
        email_address: '',
        status: '',
        pricePaid: '0',
      }
      await order.save()
      return {
        success: true,
        message: 'PayPal order created successfully',
        data: paypalOrder.id,
      }
    } else {
      throw new Error('Order not found')
    }
  } catch (err) {
    return { success: false, message: formatError(err) }
  }
}

export async function approvePayPalOrder(
  orderId: string,
  data: { orderID: string }
) {
  await connectToDatabase()
  try {
    const order = await Order.findById(orderId).populate('user', 'email')
    if (!order) throw new Error('Order not found')

    const captureData = await paypal.capturePayment(data.orderID)
    if (
      !captureData ||
      captureData.id !== order.paymentResult?.id ||
      captureData.status !== 'COMPLETED'
    )
      throw new Error('Error in paypal payment')
    order.isPaid = true
    order.paidAt = new Date()
    order.paymentResult = {
      id: captureData.id,
      status: captureData.status,
      email_address: captureData.payer.email_address,
      pricePaid:
        captureData.purchase_units[0]?.payments?.captures[0]?.amount?.value,
    }
    await order.save()
    await sendPurchaseReceipt({ order })
    revalidatePath(`/account/orders/${orderId}`)
    return {
      success: true,
      message: 'Your order has been successfully paid by PayPal',
    }
  } catch (err) {
    return { success: false, message: formatError(err) }
  }
}