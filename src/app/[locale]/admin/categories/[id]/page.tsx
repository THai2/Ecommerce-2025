/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Edit, Calendar, Hash } from 'lucide-react'
import { toast } from 'sonner'
import { getCategoryById } from '@/lib/actions/category.action'
import { IProduct } from '@/models/product'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatDateTime } from '@/lib/utils'
import DeleteDialog from '@/components/shared/delete-dialog'
import { deleteProduct, getProductsByCategory } from '@/lib/actions/product.actions'
import { useTranslations } from 'next-intl'

export default function CategoryDetailPage() {
  const params = useParams()
  const t = useTranslations('Admin.Categories.Detail')
  const [category, setCategory] = useState<any>(null)
  const [products, setProducts] = useState<IProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)
  const limit = 10

  useEffect(() => {
    if (params.id) {
      fetchData(params.id as string)
    }
  }, [params.id, page])

  const fetchData = async (id: string) => {
    try {
      setLoading(true)
      
      // Fetch category
      const categoryResult = await getCategoryById(id)
      if (!categoryResult.success) {
        throw new Error(t('Messages.FetchCategoryError'))
      }
      setCategory(categoryResult.category)
      
      // Fetch products by category name
      const productsResult = await getProductsByCategory(categoryResult.category.name, page, limit)
      
      if (productsResult.success) {
        setProducts(productsResult.products)
        setTotalProducts(productsResult.pagination?.total || 0)
      } else {
        throw new Error(t('Messages.FetchProductsError'))
      }
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handleDeleteSuccess = () => {
    toast.success(t('Messages.DeleteSuccess'))
    fetchData(params.id as string)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        <span className="sr-only">{t('Loading')}</span>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">{t('CategoryNotFound')}</h1>
          <Link href="/admin/categories">
            <Button className="mt-4">{t('BackToCategories')}</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Link href="/admin/categories">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('BackToCategories')}
          </Button>
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{category.name}</h1>
            <p className="text-gray-600 mt-1">{t('Title')}</p>
          </div>
          <Link href={`/admin/categories/${category._id}/edit`}>
            <Button>
              <Edit className="w-4 h-4 mr-2" />
              {t('EditCategory')}
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{t('CategoryInformation')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">{t('Name')}</label>
                <p className="text-lg font-medium">{category.name}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">{t('Slug')}</label>
                <p className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                  {category.slug}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">{t('Description')}</label>
                <p className="text-gray-700">
                  {category.description || t('NoDescription')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Products Section */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>{t('ProductsInCategory', { count: totalProducts })}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('ProductName')}</TableHead>
                    <TableHead className="text-right">{t('Price')}</TableHead>
                    <TableHead>{t('Stock')}</TableHead>
                    <TableHead>{t('Published')}</TableHead>
                    <TableHead>{t('LastUpdate')}</TableHead>
                    <TableHead className="w-[100px]">{t('Actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product._id}>
                      <TableCell>
                        <Link href={`/admin/products/${product._id}`}>
                          {product.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-right">${product.price}</TableCell>
                      <TableCell>{product.countInStock}</TableCell>
                      <TableCell>{product.isPublished ? t('Yes') : t('No')}</TableCell>
                      <TableCell>
                        {formatDateTime(product.updatedAt).dateTime}
                      </TableCell>
                      <TableCell className="flex gap-1">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/admin/products/${product._id}`}>{t('Edit')}</Link>
                        </Button>
                        <DeleteDialog
                          id={product._id}
                          action={deleteProduct}
                          callbackAction={handleDeleteSuccess}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {totalProducts > limit && (
                <div className="flex items-center justify-end gap-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page <= 1}
                  >
                    {t('Previous')}
                  </Button>
                  <span>
                    {t('PageInfo', { 
                      current: page, 
                      total: Math.ceil(totalProducts / limit) 
                    })}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= Math.ceil(totalProducts / limit)}
                  >
                    {t('Next')}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>{t('StatusMetadata')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">{t('Status')}</label>
                <div className="mt-1">
                  <Badge variant={category.isActive ? 'default' : 'secondary'}>
                    {category.isActive ? t('Active') : t('Inactive')}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  {t('CategoryID')}
                </label>
                <p className="font-mono text-xs text-gray-600">{category._id}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {t('Created')}
                </label>
                <p className="text-sm">
                  {new Date(category.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {t('LastUpdated')}
                </label>
                <p className="text-sm">
                  {new Date(category.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}