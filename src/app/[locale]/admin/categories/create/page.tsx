'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Save } from 'lucide-react'
import { toast } from 'sonner'
import { createCategory } from '@/lib/actions/category.action'
import { useTranslations } from 'next-intl'

export default function CreateCategoryPage() {
  const router = useRouter()
  const t = useTranslations('Admin.Categories')
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    isActive: true
  })

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
      toast.error(t('Messages.CategoryNameRequired'))
      return
    }

    setLoading(true)
    try {
      const result = await createCategory({
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim(),
        isActive: formData.isActive
      })

      if (result.success) {
        toast.success(t('Messages.CategoryCreated'))
        router.push('/admin/categories')
      } else {
        toast.error(result.error || t('Messages.CategoryCreateFailed'))
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error(t('Messages.ErrorCreatingCategory'))
    } finally {
      setLoading(false)
    }
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
        <h1 className="text-3xl font-bold">{t('CreateNewCategory')}</h1>
        <p className="text-gray-600 mt-1">{t('AddNewProductCategory')}</p>
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
                  <Label htmlFor="name">{t('CategoryName')} *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={handleNameChange}
                    placeholder={t('Placeholders.CategoryName')}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="slug">{t('Slug')}</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder={t('Placeholders.Slug')}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {t('SlugDescription')}
                  </p>
                </div>

                <div>
                  <Label htmlFor="description">{t('Description')}</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder={t('Placeholders.Description')}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>{t('CategorySettings')}</CardTitle>
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
                  <Label htmlFor="isActive">{t('Active')}</Label>
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
                    {t('Creating')}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {t('CreateCategory')}
                  </>
                )}
              </Button>
              <Link href="/admin/categories">
                <Button type="button" variant="outline">
                  {t('Cancel')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}