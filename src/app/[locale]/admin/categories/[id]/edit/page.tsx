/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Save } from 'lucide-react'
import { ICategory } from '@/models/category'
import { toast } from 'sonner'
import { getCategoryById, updateCategory } from '@/lib/actions/category.action'
import { useTranslations } from 'next-intl'

export default function EditCategoryPage() {
  const params = useParams()
  const router = useRouter()
  const t = useTranslations('Admin.Categories')
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    isActive: true
  })

  useEffect(() => {
    if (params.id) {
      fetchCategory(params.id as string)
    }
  }, [params.id])

  const fetchCategory = async (id: string) => {
    try {
      const result = await getCategoryById(id)
      if (result.success) {
        const category = result.category
        setFormData({
          name: category.name,
          slug: category.slug,
          description: category.description || '',
          isActive: category.isActive
        })
      } else {
        toast.error(t('Messages.FetchError'))
        router.push('/admin/categories')
      }
    } catch (error) {
      toast.error(t('Messages.LoadError'))
      router.push('/admin/categories')
    } finally {
      setInitialLoading(false)
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error(t('Messages.NameRequired'))
      return
    }

    setLoading(true)
    try {
      const result = await updateCategory(params.id as string, {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim(),
        isActive: formData.isActive
      })

      if (result.success) {
        toast.success(t('Messages.UpdateSuccess'))
        router.push('/admin/categories')
      } else {
        toast.error(result.error || t('Messages.UpdateError'))
      }
    } catch (error) {
      toast.error(t('Messages.UpdateError'))
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        <span className="sr-only">{t('Loading')}</span>
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
        <h1 className="text-3xl font-bold">{t('EditCategory')}</h1>
        <p className="text-gray-600 mt-1">{t('UpdateInfo')}</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{t('CategoryInformation')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">{t('NameLabel')} *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={handleNameChange}
                    placeholder={t('NamePlaceholder')}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="slug">{t('SlugLabel')}</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder={t('SlugPlaceholder')}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {t('SlugDescription')}
                  </p>
                </div>

                <div>
                  <Label htmlFor="description">{t('DescriptionLabel')}</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder={t('DescriptionPlaceholder')}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>{t('SettingsTitle')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, isActive: checked as boolean }))
                    }
                  />
                  <Label htmlFor="isActive">{t('ActiveLabel')}</Label>
                </div>
                <p className="text-sm text-gray-500">
                  {t('ActiveDescription')}
                </p>
              </CardContent>
            </Card>

            <div className="mt-6 flex gap-3">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {t('Updating')}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {t('UpdateButton')}
                  </>
                )}
              </Button>
              <Link href="/admin/categories">
                <Button type="button" variant="outline">
                  {t('CancelButton')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}