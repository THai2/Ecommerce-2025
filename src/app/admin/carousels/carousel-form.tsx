'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import {
    Form, FormField, FormItem, FormLabel,
    FormControl, FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent } from '@/components/ui/card'

import { ImageUploader, ImagePreview } from '@/components/shared/image-uploader'
import { createCarousel, updateCarousel } from '@/lib/actions/carousel.action'
import { CarouselInputSchema } from '@/lib/validator'
import { ICarouselInput } from '@/types'
import { toSlug } from '@/lib/utils'

const defaultValues: ICarouselInput = {
    title: '',
    buttonCaption: '',
    imageUrl: '',
    url: '',
    isPublished: false,
}

const CarouselForm = ({
    type,
    carousel,
    carouselId,
}: {
    type: 'Create' | 'Update',
    carousel?: ICarouselInput,
    carouselId?: string
}) => {
    const router = useRouter()
    const form = useForm<ICarouselInput>({
        resolver: zodResolver(CarouselInputSchema),
        defaultValues: carousel || defaultValues,
    })

    const imageUrl = form.watch('imageUrl')

    const handleImageUploaded = (data: { url: string }) => {
        form.setValue('imageUrl', data.url)
        toast.success('Image uploaded')
    }

    const handleImageRemove = () => {
        form.setValue('imageUrl', '')
    }

    const onSubmit = async (values: ICarouselInput) => {
        const res = type === 'Create'
            ? await createCarousel(values)
            : await updateCarousel({ ...values, _id: carouselId! })

        if (!res.success) {
            toast.error(res.message)
        } else {
            toast.success(res.message)
            router.push('/admin/carousels')
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                <FormField
                    control={form.control}
                    name='title'
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl><Input {...field} placeholder='Enter title' /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name='buttonCaption'
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Button Caption</FormLabel>
                            <FormControl><Input {...field} placeholder='Shop Now' /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name='url'
                    render={({ field }) => (
                        <FormItem className='w-full'>
                            <FormLabel>Url</FormLabel>

                            <FormControl>
                                <div className='relative'>
                                    <Input
                                        placeholder='/search?tag='
                                        className='pl-8'
                                        {...field}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const title = form.getValues('title')
                                            const slug = toSlug(title)
                                            form.setValue('url', `/search?tag=${slug}`)
                                        }}
                                        className="absolute right-2 top-2.5"
                                    >
                                        Generate
                                    </button>
                                </div>
                            </FormControl>

                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name='imageUrl'
                    render={() => (
                        <FormItem>
                            <FormLabel>Image</FormLabel>
                            <Card>
                                <CardContent className='space-y-4 mt-4 min-h-48'>
                                    {imageUrl ? (
                                        <ImagePreview imageUrl={imageUrl} onRemove={handleImageRemove} />
                                    ) : (
                                        <ImageUploader onImageUploaded={handleImageUploaded} />
                                    )}
                                </CardContent>
                            </Card>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name='isPublished'
                    render={({ field }) => (
                        <FormItem className='flex items-center gap-2'>
                            <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormLabel>Published</FormLabel>
                        </FormItem>
                    )}
                />

                <Button type='submit' disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? 'Saving...' : `${type} Carousel`}
                </Button>
            </form>
        </Form>
    )
}

export default CarouselForm
