/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react'
import { ICategory } from '@/models/category'
import { toast } from 'sonner'
import { deleteCategory, getCategories } from '@/lib/actions/category.action'
import { useTranslations } from 'next-intl'

export default function CategoriesPage() {
  const t = useTranslations('Admin.Categories')
  const [categories, setCategories] = useState<ICategory[]>([])
  const [filteredCategories, setFilteredCategories] = useState<ICategory[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    const filtered = categories.filter(category =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.slug.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredCategories(filtered)
  }, [categories, searchTerm])

  const fetchCategories = async () => {
    try {
      const result = await getCategories()
      if (result.success) {
        setCategories(result.categories)
      } else {
        toast.error(t('FetchError'))
      }
    } catch (error) {
      toast.error(t('FetchError'))
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    try {
      const result = await deleteCategory(id)
      if (result.success) {
        toast.success(t('DeleteSuccess'))
        fetchCategories()
      } else {
        toast.error(result.error || t('DeleteError'))
      }
    } catch (error) {
      toast.error(t('DeleteError'))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500">{t('Loading')}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">{t('Title')}</h1>
          <p className="text-gray-600 mt-1">{t('Subtitle')}</p>
        </div>
        <Link href="/admin/categories/create">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            {t('AddCategory')}
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder={t('SearchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="text-sm text-gray-500">
              {t('TotalCategories', { count: filteredCategories.length })}
            </div>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('TableHeaders.Name')}</TableHead>
              <TableHead>{t('TableHeaders.Slug')}</TableHead>
              <TableHead>{t('TableHeaders.Description')}</TableHead>
              <TableHead>{t('TableHeaders.Status')}</TableHead>
              <TableHead>{t('TableHeaders.Created')}</TableHead>
              <TableHead className="text-right">{t('TableHeaders.Actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCategories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="text-gray-500">
                    {searchTerm ? t('NoResults') : t('NoCategories')}
                  </div>
                  {!searchTerm && (
                    <Link href="/admin/categories/create">
                      <Button variant="outline" className="mt-2">
                        {t('CreateFirstCategory')}
                      </Button>
                    </Link>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              filteredCategories.map((category) => (
                <TableRow key={category._id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="font-mono text-sm">{category.slug}</TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate">
                      {category.description || t('NoDescription')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={category.isActive ? 'default' : 'secondary'}>
                      {category.isActive ? t('Active') : t('Inactive')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(category.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/categories/${category._id}`}>
                        <Button variant="ghost" size="sm" title={t('View')}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Link href={`/admin/categories/${category._id}/edit`}>
                        <Button variant="ghost" size="sm" title={t('Edit')}>
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-600 hover:text-red-700"
                            title={t('Delete')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t('DeleteTitle')}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t.rich('DeleteMessage', {
                                name: category.name,
                                strong: (chunks) => <strong>{chunks}</strong>
                              })}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t('Cancel')}</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(category._id, category.name)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              {t('Delete')}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}