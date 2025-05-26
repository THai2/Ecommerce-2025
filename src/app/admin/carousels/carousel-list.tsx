/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import Link from 'next/link'
import { useEffect, useState, useTransition } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import DeleteDialog from '@/components/shared/delete-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  deleteCarousel,
  getAllCarouselsForAdmin,
} from '@/lib/actions/carousel.action'
import { ICarousel } from '@/models/carousel'

type CarouselListDataProps = {
  carousels: ICarousel[]
  totalPages: number
  totalCarousels: number
  from: number
  to: number
}

const CarouselList = () => {
  const [page, setPage] = useState(1)
  const [inputValue, setInputValue] = useState('')
  const [data, setData] = useState<CarouselListDataProps>()
  const [isPending, startTransition] = useTransition()

  const fetchData = (query = '', page = 1) => {
    startTransition(async () => {
      const data = await getAllCarouselsForAdmin({ query, page })
      setData(data)
    })
  }

  const handlePageChange = (direction: 'next' | 'prev') => {
    const newPage = direction === 'next' ? page + 1 : page - 1
    setPage(newPage)
    fetchData(inputValue, newPage)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    if (value) {
      clearTimeout((window as any).debounce)
      ;(window as any).debounce = setTimeout(() => {
        fetchData(value, 1)
      }, 500)
    } else {
      fetchData('', 1)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className='space-y-2'>
      <div className='flex-between flex-wrap gap-2'>
        <div className='flex flex-wrap items-center gap-2 '>
          <h1 className='font-bold text-lg'>Carousels</h1>
          <div className='flex items-center gap-2'>
            <Input
              className='w-auto'
              type='text'
              value={inputValue}
              onChange={handleInputChange}
              placeholder='Filter title...'
            />
            {isPending ? (
              <p>Loading...</p>
            ) : (
              <p>
                {data?.totalCarousels === 0
                  ? 'No'
                  : `${data?.from}-${data?.to} of ${data?.totalCarousels}`}
                {' results'}
              </p>
            )}
          </div>
        </div>
        <Button asChild variant='default'>
          <Link href='/admin/carousels/create'>Create Carousel</Link>
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Image</TableHead>
            <TableHead>Button</TableHead>
            <TableHead>URL</TableHead>
            <TableHead>Published</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.carousels.map((carousel) => (
            <TableRow key={carousel._id}>
              <TableCell>{carousel.title}</TableCell>
              <TableCell>
                <img src={carousel.imageUrl} alt={carousel.title} className='h-12 rounded' />
              </TableCell>
              <TableCell>{carousel.buttonCaption}</TableCell>
              <TableCell>
                <a href={carousel.url} target='_blank' rel='noopener noreferrer' className='underline text-blue-600'>
                  {carousel.url}
                </a>
              </TableCell>
              <TableCell>{carousel.isPublished ? 'Yes' : 'No'}</TableCell>
              <TableCell className='flex gap-1'>
                <Button asChild variant='outline' size='sm'>
                  <Link href={`/admin/carousels/${carousel._id}`}>Edit</Link>
                </Button>
                <DeleteDialog
                  id={carousel._id}
                  action={deleteCarousel}
                  callbackAction={() => fetchData(inputValue, page)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {(data?.totalPages ?? 0) > 1 && (
        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            onClick={() => handlePageChange('prev')}
            disabled={page <= 1}
            className='w-24'
          >
            <ChevronLeft /> Previous
          </Button>
          Page {page} of {data?.totalPages}
          <Button
            variant='outline'
            onClick={() => handlePageChange('next')}
            disabled={page >= (data?.totalPages ?? 0)}
            className='w-24'
          >
            Next <ChevronRight />
          </Button>
        </div>
      )}
    </div>
  )
}

export default CarouselList
