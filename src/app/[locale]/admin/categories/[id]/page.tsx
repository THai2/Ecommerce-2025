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

export default function CategoryDetailPage() {
  const params = useParams()
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
        throw new Error('Failed to fetch category')
      }
      setCategory(categoryResult.category)
      
      // Fetch products by category name
      const productsResult = await getProductsByCategory(categoryResult.category.name, page, limit)
      
      console.log(productsResult)
      if (productsResult.success) {
        setProducts(productsResult.products)
        setTotalProducts(productsResult.pagination?.total || 0)
      } else {
        throw new Error('Failed to fetch products')
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
    fetchData(params.id as string)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Category Not Found</h1>
          <Link href="/admin/categories">
            <Button className="mt-4">Back to Categories</Button>
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
            Back to Categories
          </Button>
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{category.name}</h1>
            <p className="text-gray-600 mt-1">Category Details</p>
          </div>
          <Link href={`/admin/categories/${category._id}/edit`}>
            <Button>
              <Edit className="w-4 h-4 mr-2" />
              Edit Category
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Category Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Name</label>
                <p className="text-lg font-medium">{category.name}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Slug</label>
                <p className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                  {category.slug}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Description</label>
                <p className="text-gray-700">
                  {category.description || 'No description provided'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Products Section */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Products in this Category ({totalProducts})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Published</TableHead>
                    <TableHead>Last Update</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
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
                      <TableCell>{product.isPublished ? 'Yes' : 'No'}</TableCell>
                      <TableCell>
                        {formatDateTime(product.updatedAt).dateTime}
                      </TableCell>
                      <TableCell className="flex gap-1">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/admin/products/${product._id}`}>Edit</Link>
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
                    Previous
                  </Button>
                  <span>Page {page} of {Math.ceil(totalProducts / limit)}</span>
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= Math.ceil(totalProducts / limit)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Status & Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <div className="mt-1">
                  <Badge variant={category.isActive ? 'default' : 'secondary'}>
                    {category.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  Category ID
                </label>
                <p className="font-mono text-xs text-gray-600">{category._id}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Created
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
                  Last Updated
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