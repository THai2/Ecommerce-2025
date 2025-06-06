import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth } from '../../../../../../auth'
import Link from 'next/link'
import CarouselForm from '../carousel-form'

export const metadata: Metadata = {
  title: 'Create Carousel',
}

export default async function CreateCarouselPage() {
  const session = await auth()

  if (!session || session.user.role !== 'Admin') {
    redirect('/signin')
  }

  return (
     <main className='max-w-6xl mx-auto p-4'>
      <div className='flex mb-4'>
        <Link href='/admin/carousels'>Carousels</Link>
        <span className='mx-1'>›</span>
        <Link href='/admin/carousels/create'>Create</Link>
      </div>

      <div className='my-8'>
        <CarouselForm type='Create' />
      </div>
    </main>
  )
}