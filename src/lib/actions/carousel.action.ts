'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { connectToDatabase } from '@/lib/db'
import { formatError } from '@/lib/utils'
import { PAGE_SIZE } from '@/lib/constants'
import { CarouselInputSchema, CarouselUpdateSchema } from '../validator'
import { ICarouselInput } from '@/types'
import Carousel, { ICarousel } from '@/models/carousel'


// CREATE
export async function createCarousel(data: ICarouselInput) {
  try {
    const carousel = CarouselInputSchema.parse(data)
    await connectToDatabase()
    await Carousel.create(carousel)
    revalidatePath('/admin/carousels')
    return {
      success: true,
      message: 'Carousel created successfully',
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// UPDATE
export async function updateCarousel(data: z.infer<typeof CarouselUpdateSchema>) {
  try {
    const carousel = CarouselUpdateSchema.parse(data)
    await connectToDatabase()
    await Carousel.findByIdAndUpdate(carousel._id, carousel)
    revalidatePath('/admin/carousels')
    return {
      success: true,
      message: 'Carousel updated successfully',
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// DELETE
export async function deleteCarousel(id: string) {
  try {
    await connectToDatabase()
    const res = await Carousel.findByIdAndDelete(id)
    if (!res) throw new Error('Carousel not found')
    revalidatePath('/admin/carousels')
    return {
      success: true,
      message: 'Carousel deleted successfully',
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// GET ONE CAROUSEL BY ID
export async function getCarouselById(carouselId: string) {
  await connectToDatabase()
  const carousel = await Carousel.findById(carouselId)
  return JSON.parse(JSON.stringify(carousel)) as ICarousel
}

// GET ALL CAROUSELS FOR ADMIN
export async function getAllCarouselsForAdmin({
  query,
  page = 1,
  sort = 'latest',
  limit,
}: {
  query: string
  page?: number
  sort?: string
  limit?: number
}) {
  await connectToDatabase()

  const pageSize = limit || PAGE_SIZE
  const queryFilter =
    query && query !== 'all'
      ? {
          title: {
            $regex: query,
            $options: 'i',
          },
        }
      : {}

  const order: Record<string, 1 | -1> =
    sort === 'latest' ? { createdAt: -1 } : { _id: -1 }

  const carousels = await Carousel.find({
    ...queryFilter,
  })
    .sort(order)
    .skip(pageSize * (Number(page) - 1))
    .limit(pageSize)
    .lean()

  const countCarousels = await Carousel.countDocuments({
    ...queryFilter,
  })

  return {
    carousels: JSON.parse(JSON.stringify(carousels)) as ICarousel[],
    totalPages: Math.ceil(countCarousels / pageSize),
    totalCarousels: countCarousels,
    from: pageSize * (Number(page) - 1) + 1,
    to: pageSize * (Number(page) - 1) + carousels.length,
  }
}

// GET ALL PUBLISHED CAROUSELS
export async function getAllPublishedCarousels({
  limit,
  page = 1,
}: {
  limit?: number
  page?: number
} = {}) {
  limit = limit || PAGE_SIZE
  await connectToDatabase()

  const carousels = await Carousel.find({ isPublished: true })
    .sort({ createdAt: -1 })
    .skip(limit * (Number(page) - 1))
    .limit(limit)
    .lean()

  const countCarousels = await Carousel.countDocuments({ isPublished: true })

  return {
    carousels: JSON.parse(JSON.stringify(carousels)) as ICarousel[],
    totalPages: Math.ceil(countCarousels / limit),
    totalCarousels: countCarousels,
    from: limit * (Number(page) - 1) + 1,
    to: limit * (Number(page) - 1) + carousels.length,
  }
}

// GET CAROUSELS FOR CARD (limited data for homepage)
export async function getCarouselsForCard({ limit = 4 }: { limit?: number } = {}) {
  await connectToDatabase()
  const carousels = await Carousel.find(
    { isPublished: true },
    {
      title: 1,
      buttonCaption: 1,
      imageUrl: 1,
      url: 1,
    }
  )
    .sort({ createdAt: 'desc' })
    .limit(limit)

  return JSON.parse(JSON.stringify(carousels)) as {
    _id: string
    title: string
    buttonCaption: string
    imageUrl: string
    url: string
  }[]
}

// TOGGLE PUBLISH STATUS
export async function toggleCarouselPublish(id: string) {
  try {
    await connectToDatabase()
    const carousel = await Carousel.findById(id)
    if (!carousel) throw new Error('Carousel not found')
    
    carousel.isPublished = !carousel.isPublished
    await carousel.save()
    
    revalidatePath('/admin/carousels')
    revalidatePath('/')
    
    return {
      success: true,
      message: `Carousel ${carousel.isPublished ? 'published' : 'unpublished'} successfully`,
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// BULK DELETE
export async function bulkDeleteCarousels(ids: string[]) {
  try {
    await connectToDatabase()
    const result = await Carousel.deleteMany({ _id: { $in: ids } })
    revalidatePath('/admin/carousels')
    return {
      success: true,
      message: `${result.deletedCount} carousel(s) deleted successfully`,
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}