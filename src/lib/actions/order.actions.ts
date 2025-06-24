'use server'

import { Cart, IOrderList, OrderItem, ShippingAddress } from '@/types'
import { formatError, round2 } from '../utils'
import { connectToDatabase } from '../db'
import { OrderInputSchema } from '../validator'
import { revalidatePath } from 'next/cache'
import { paypal } from '../paypal'
import { DateRange } from 'react-day-picker'
import { getSetting } from './setting.actions'
import Order, { IOrder } from '@/models/order'
import { sendAskReviewOrderItems, sendPurchaseReceipt } from '../../../emails'
import mongoose from 'mongoose'
import Product from '@/models/product'
import { auth } from '../../../auth'
import User from '@/models/user'
import ProductVariant from '@/models/product-variant'
import { getTotalStock } from './product-variant.action'

// CREATE
export const createOrder = async (clientSideCart: Cart) => {
  try {
    await connectToDatabase()
    const session = await auth()
    if (!session) throw new Error('User not authenticated')
    // recalculate price and delivery date on the server
    const createdOrder = await createOrderFromCart(
      clientSideCart,
      session.user.id!
    )
    return {
      success: true,
      message: 'Order placed successfully',
      data: { orderId: createdOrder._id.toString() },
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}
export const createOrderFromCart = async (
  clientSideCart: Cart,
  userId: string
) => {
  const cart = {
    ...clientSideCart,
    ...calcDeliveryDateAndPrice({
      items: clientSideCart.items,
      shippingAddress: clientSideCart.shippingAddress,
      deliveryDateIndex: clientSideCart.deliveryDateIndex,
    }),
  }

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
  return await Order.create(order)
}

export async function updateOrderToPaid(orderId: string) {
  try {
    await connectToDatabase()
    const order = await Order.findById(orderId).populate<{
      user: { email: string; name: string }
    }>('user', 'name email')
    if (!order) throw new Error('Order not found')
    if (order.isPaid) throw new Error('Order is already paid')
    if (order.isCancelled) throw new Error('Cannot pay cancelled order')
    order.isPaid = true
    order.paidAt = new Date()
    await order.save()
    if (!process.env.MONGODB_URI?.startsWith('mongodb://localhost'))
      await updateProductStock(order._id)
    if (order.user.email) await sendPurchaseReceipt({ order })
    revalidatePath(`/account/orders/${orderId}`)
    return { success: true, message: 'Order paid successfully' }
  } catch (err) {
    return { success: false, message: formatError(err) }
  }
}
// const updateProductStock = async (orderId: string) => {
//   const session = await mongoose.connection.startSession()

//   try {
//     session.startTransaction()
//     const opts = { session }

//     const order = await Order.findOneAndUpdate(
//       { _id: orderId },
//       { isPaid: true, paidAt: new Date() },
//       opts
//     )
//     if (!order) throw new Error('Order not found')

//     for (const item of order.items) {
//       const product = await Product.findById(item.product).session(session)
//       if (!product) throw new Error('Product not found')

//       product.countInStock -= item.quantity
//       await Product.updateOne(
//         { _id: product._id },
//         { countInStock: product.countInStock },
//         opts
//       )
//     }
//     await session.commitTransaction()
//     session.endSession()
//     return true
//   } catch (error) {
//     await session.abortTransaction()
//     session.endSession()
//     throw error
//   }
// }
const updateProductStock = async (orderId: string) => {
  const session = await mongoose.connection.startSession()

  try {
    session.startTransaction()
    const opts = { session }

    const order = await Order.findOneAndUpdate(
      { _id: orderId },
      { isPaid: true, paidAt: new Date() },
      opts
    )
    if (!order) throw new Error('Order not found')

    // Lưu trữ các productId bị ảnh hưởng để cập nhật tổng stock
    const affectedProductIds = new Set<string>()

    for (const item of order.items) {
      const { product, color, size, quantity } = item

      // Cập nhật tồn kho size cụ thể trong variant
      const variant = await ProductVariant.findOneAndUpdate(
        {
          productId: product,
          color,
          'sizeStock.size': size,
        },
        {
          $inc: { 'sizeStock.$.stock': -quantity },
        },
        { session }
      )

      if (!variant) throw new Error(`Variant not found for ${product} - ${color} - ${size}`)

      affectedProductIds.add(product)
    }

    // Cập nhật tổng stock của các product bị ảnh hưởng
    for (const productId of affectedProductIds) {
      const totalStock = await getTotalStock(productId)
      await Product.findByIdAndUpdate(
        productId,
        { countInStock: totalStock },
        { session }
      )
    }

    await session.commitTransaction()
    session.endSession()
    return true
  } catch (error) {
    await session.abortTransaction()
    session.endSession()
    throw error
  }
}


export async function deliverOrder(orderId: string) {
  try {
    await connectToDatabase()
    const order = await Order.findById(orderId).populate<{
      user: { email: string; name: string }
    }>('user', 'name email')
    if (!order) throw new Error('Order not found')
    if (!order.isPaid) throw new Error('Order is not paid')
    order.isDelivered = true
    order.deliveredAt = new Date()
    await order.save()
    if (order.user.email) await sendAskReviewOrderItems({ order })
    revalidatePath(`/account/orders/${orderId}`)
    return { success: true, message: 'Order delivered successfully' }
  } catch (err) {
    return { success: false, message: formatError(err) }
  }
}

// DELETE
export async function deleteOrder(id: string) {
  try {
    await connectToDatabase()
    const res = await Order.findByIdAndDelete(id)
    if (!res) throw new Error('Order not found')
    revalidatePath('/admin/orders')
    return {
      success: true,
      message: 'Order deleted successfully',
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// GET ALL ORDERS

export async function getAllOrders({
  limit,
  page,
}: {
  limit?: number
  page: number
}) {
  const {
    common: { pageSize },
  } = await getSetting()
  limit = limit || pageSize
  await connectToDatabase()
  const skipAmount = (Number(page) - 1) * limit
  const orders = await Order.find()
    .populate('user', 'name')
    .sort({ createdAt: 'desc' })
    .skip(skipAmount)
    .limit(limit)
  const ordersCount = await Order.countDocuments()
  return {
    data: JSON.parse(JSON.stringify(orders)) as IOrderList[],
    totalPages: Math.ceil(ordersCount / limit),
  }
}
export async function getMyOrders({
  limit,
  page,
}: {
  limit?: number
  page: number
}) {
  const {
    common: { pageSize },
  } = await getSetting()
  limit = limit || pageSize
  await connectToDatabase()
  const session = await auth()
  if (!session) {
    throw new Error('User is not authenticated')
  }
  const skipAmount = (Number(page) - 1) * limit
  const orders = await Order.find({
    user: session?.user?.id,
  })
    .sort({ createdAt: 'desc' })
    .skip(skipAmount)
    .limit(limit)
  const ordersCount = await Order.countDocuments({ user: session?.user?.id })

  return {
    data: JSON.parse(JSON.stringify(orders)),
    totalPages: Math.ceil(ordersCount / limit),
  }
}
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

      if (!process.env.MONGODB_URI?.startsWith('mongodb://localhost')) {
      await updateProductStock(order._id.toString()) 
    }
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

export const calcDeliveryDateAndPrice = async ({
  items,
  shippingAddress,
  deliveryDateIndex,
}: {
  deliveryDateIndex?: number
  items: OrderItem[]
  shippingAddress?: ShippingAddress
}) => {
  const { availableDeliveryDates } = await getSetting()
  const itemsPrice = round2(
    items.reduce((acc, item) => acc + item.price * item.quantity, 0)
  )

  const deliveryDate =
    availableDeliveryDates[
      deliveryDateIndex === undefined
        ? availableDeliveryDates.length - 1
        : deliveryDateIndex
    ]
  const shippingPrice =
    !shippingAddress || !deliveryDate
      ? undefined
      : deliveryDate.freeShippingMinPrice > 0 &&
          itemsPrice >= deliveryDate.freeShippingMinPrice
        ? 0
        : deliveryDate.shippingPrice

  const taxPrice = !shippingAddress ? undefined : round2(itemsPrice * 0.15)
  const totalPrice = round2(
    itemsPrice +
      (shippingPrice ? round2(shippingPrice) : 0) +
      (taxPrice ? round2(taxPrice) : 0)
  )
  return {
    availableDeliveryDates,
    deliveryDateIndex:
      deliveryDateIndex === undefined
        ? availableDeliveryDates.length - 1
        : deliveryDateIndex,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
  }
}

// GET ORDERS BY USER
export async function getOrderSummary(date: DateRange) {
  await connectToDatabase()
  const from = new Date(date.from!)
  const to = new Date(date.to!)
  to.setHours(23, 59, 59, 999)

  const ordersCount = await Order.countDocuments({
    createdAt: {
      $gte: from,
      $lte: to,
    },
  })
  const productsCount = await Product.countDocuments({
    createdAt: {
      $gte: from,
      $lte: to,
    },
  })
  const usersCount = await User.countDocuments({
    createdAt: {
      $gte: from,
      $lte: to,
    },
  })

  const totalSalesResult = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: from,
          $lte: to,
        },
      },
    },
    {
      $group: {
        _id: null,
        sales: { $sum: '$totalPrice' },
      },
    },
    { $project: { totalSales: { $ifNull: ['$sales', 0] } } },
  ])
  const totalSales = totalSalesResult[0] ? totalSalesResult[0].totalSales : 0

  const today = new Date()
  const sixMonthEarlierDate = new Date(
    today.getFullYear(),
    today.getMonth() - 5,
    1
  )
  const monthlySales = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: sixMonthEarlierDate,
        },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        totalSales: { $sum: '$totalPrice' },
      },
    },
    {
      $project: {
        _id: 0,
        label: '$_id',
        value: '$totalSales',
      },
    },

    { $sort: { label: -1 } },
  ])
  const topSalesCategories = await getTopSalesCategories(date)
  const topSalesProducts = await getTopSalesProducts(date)

  const {
    common: { pageSize },
  } = await getSetting()
  const limit = pageSize
  const latestOrders = await Order.find()
    .populate('user', 'name')
    .sort({ createdAt: 'desc' })
    .limit(limit)
  return {
    ordersCount,
    productsCount,
    usersCount,
    totalSales,
    monthlySales: JSON.parse(JSON.stringify(monthlySales)),
    salesChartData: JSON.parse(JSON.stringify(await getSalesChartData(date))),
    topSalesCategories: JSON.parse(JSON.stringify(topSalesCategories)),
    topSalesProducts: JSON.parse(JSON.stringify(topSalesProducts)),
    latestOrders: JSON.parse(JSON.stringify(latestOrders)) as IOrderList[],
  }
}

async function getSalesChartData(date: DateRange) {
  const from = new Date(date.from!)
  const to = new Date(date.to!)
  to.setHours(23, 59, 59, 999)
  const result = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: from,
          $lte: to,
        },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' },
        },
        totalSales: { $sum: '$totalPrice' },
      },
    },
    {
      $project: {
        _id: 0,
        date: {
          $concat: [
            { $toString: '$_id.year' },
            '/',
            { $toString: '$_id.month' },
            '/',
            { $toString: '$_id.day' },
          ],
        },
        totalSales: 1,
      },
    },
    { $sort: { date: 1 } },
  ])

  return result
}

async function getTopSalesProducts(date: DateRange) {
  const from = new Date(date.from!)
  const to = new Date(date.to!)
  to.setHours(23, 59, 59, 999)
  const result = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: from,
          $lte: to,
        },
      },
    },
    // Step 1: Unwind orderItems array
    { $unwind: '$items' },

    // Step 2: Group by productId to calculate total sales per product
    {
      $group: {
        _id: {
          name: '$items.name',
          image: '$items.image',
          _id: '$items.product',
        },
        totalSales: {
          $sum: { $multiply: ['$items.quantity', '$items.price'] },
        }, // Assume quantity field in orderItems represents units sold
      },
    },
    {
      $sort: {
        totalSales: -1,
      },
    },
    { $limit: 6 },

    // Step 3: Replace productInfo array with product name and format the output
    {
      $project: {
        _id: 0,
        id: '$_id._id',
        label: '$_id.name',
        image: '$_id.image',
        value: '$totalSales',
      },
    },

    // Step 4: Sort by totalSales in descending order
    { $sort: { _id: 1 } },
  ])

  return result
}

async function getTopSalesCategories(date: DateRange, limit = 5) {
  const from = new Date(date.from!)
  const to = new Date(date.to!)
  to.setHours(23, 59, 59, 999)
  const result = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: from,
          $lte: to,
        },
      },
    },
    // Step 1: Unwind orderItems array
    { $unwind: '$items' },
    // Step 2: Group by productId to calculate total sales per product
    {
      $group: {
        _id: '$items.category',
        totalSales: { $sum: '$items.quantity' }, // Assume quantity field in orderItems represents units sold
      },
    },
    // Step 3: Sort by totalSales in descending order
    { $sort: { totalSales: -1 } },
    // Step 4: Limit to top N products
    { $limit: limit },
  ])

  return result
}



// Hủy đơn hàng bởi khách hàng
export async function cancelOrderByUser(orderId: string) {
  try {
    await connectToDatabase()
    const session = await auth()
    if (!session) throw new Error('User not authenticated')

    const order = await Order.findById(orderId)
    if (!order) throw new Error('Order not found')
    
    // Kiểm tra xem đơn hàng có thuộc về người dùng này không
    if (order.user.toString() !== session.user.id) {
      throw new Error('Not authorized to cancel this order')
    }
    
    // Kiểm tra trạng thái đơn hàng
    if (order.isPaid) throw new Error('Cannot cancel paid order')
    if (order.isCancelled) throw new Error('Order is already cancelled')
    
    // Cập nhật trạng thái hủy
    order.isCancelled = true
    order.cancelledAt = new Date()
    order.cancelledBy = 'user'
    await order.save()
    
    revalidatePath(`/account/orders/${orderId}`)
    return { success: true, message: 'Order cancelled successfully' }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// Hủy đơn hàng bởi admin
export async function cancelOrderByAdmin(orderId: string) {
  try {
    await connectToDatabase()
    const session = await auth()
    if (!session) throw new Error('Admin not authenticated')

    // Kiểm tra quyền admin (bạn cần thêm logic kiểm tra role admin ở đây)
    // Ví dụ: if (session.user.role !== 'admin') throw new Error('Not authorized')

    const order = await Order.findById(orderId)
    if (!order) throw new Error('Order not found')
    
    // Kiểm tra trạng thái đơn hàng
    if (order.isDelivered) throw new Error('Cannot cancel delivered order')
    if (order.isCancelled) throw new Error('Order is already cancelled')
    
    // Cập nhật trạng thái hủy
    order.isCancelled = true
    order.cancelledAt = new Date()
    order.cancelledBy = 'admin'
    await order.save()
    
    // Nếu đã thanh toán, cần hoàn tiền
    if (order.isPaid) {
      // Thêm logic hoàn tiền ở đây (PayPal, Stripe, etc.)
      // Ví dụ: await refundPayment(order)
    }
    
    // Nếu đã thanh toán, cập nhật lại tồn kho
    if (order.isPaid && !process.env.MONGODB_URI?.startsWith('mongodb://localhost')) {
      await restoreProductStock(order._id.toString())
    }
    
    revalidatePath(`/admin/orders/${orderId}`)
    return { success: true, message: 'Order cancelled successfully' }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// Hàm khôi phục tồn kho khi hủy đơn hàng
const restoreProductStock = async (orderId: string) => {
  const session = await mongoose.connection.startSession()

  try {
    session.startTransaction()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const opts = { session }

    const order = await Order.findById(orderId).session(session)
    if (!order) throw new Error('Order not found')

    // Lưu trữ các productId bị ảnh hưởng để cập nhật tổng stock
    const affectedProductIds = new Set<string>()

    for (const item of order.items) {
      const { product, color, size, quantity } = item

      // Cập nhật tồn kho size cụ thể trong variant
      const variant = await ProductVariant.findOneAndUpdate(
        {
          productId: product,
          color,
          'sizeStock.size': size,
        },
        {
          $inc: { 'sizeStock.$.stock': quantity }, // Tăng stock thay vì giảm
        },
        { session }
      )

      if (!variant) throw new Error(`Variant not found for ${product} - ${color} - ${size}`)

      affectedProductIds.add(product)
    }

    // Cập nhật tổng stock của các product bị ảnh hưởng
    for (const productId of affectedProductIds) {
      const totalStock = await getTotalStock(productId)
      await Product.findByIdAndUpdate(
        productId,
        { countInStock: totalStock },
        { session }
      )
    }

    await session.commitTransaction()
    session.endSession()
    return true
  } catch (error) {
    await session.abortTransaction()
    session.endSession()
    throw error
  }
}