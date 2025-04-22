import data from '@/lib/data'
import { connectToDatabase } from '.'
import Product from '@/models/product'
import { cwd } from 'process'
import { loadEnvConfig } from '@next/env'
import User from '@/models/user'

loadEnvConfig(cwd())

const main = async () => {
  try {
    const { products, users } = data
    await connectToDatabase(process.env.MONGODB_URI)

    await Product.deleteMany()
    const createdProducts = await Product.insertMany(products)

    await User.deleteMany()
    const createdUser = await User.insertMany(users)
    console.log({
      createdProducts,createdUser,
      message: 'Seeded database successfully',
    })
    process.exit(0)
  } catch (error) {
    console.error(error)
    throw new Error('Failed to seed database')
  }
}

main()