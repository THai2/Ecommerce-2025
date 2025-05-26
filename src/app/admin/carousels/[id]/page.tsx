import { notFound, redirect } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'

import { getCarouselById } from '@/lib/actions/carousel.action'
import CarouselForm from '../carousel-form'
import { auth } from '../../../../../auth'

export const metadata: Metadata = {
    title: 'Update Carousel',
}

type UpdateCarouselProps = {
    params: Promise<{
        id: string
    }>
}

const UpdateCarousel = async (props: UpdateCarouselProps) => {

    const session = await auth()

    if (!session || session.user.role !== 'Admin') {
        redirect('/signin')
    }
    const params = await props.params
    const { id } = params

    const carousel = await getCarouselById(id)
    if (!carousel) notFound()

    return (
        <main className='max-w-6xl mx-auto p-4'>
            <div className='flex mb-4'>
                <Link href='/admin/carousels'>Carousels</Link>
                <span className='mx-1'>›</span>
                <Link href={`/admin/carousels/${carousel._id}`}>{carousel._id}</Link>
            </div>

            <div className='my-8'>
                <CarouselForm type='Update' carousel={carousel} carouselId={carousel._id} />
            </div>
        </main>
    )
}

export default UpdateCarousel
