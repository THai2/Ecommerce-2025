import { useEffect, useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getCategories } from '@/lib/actions/category.action'

interface CategorySelectProps {
  value: string
  onChange: (value: string) => void
  required?: boolean
  disabled?: boolean
}

export const CategorySelect = ({
  value,
  onChange,
  required = false,
  disabled = false
}: CategorySelectProps) => {
  const [categories, setCategories] = useState<{ name: string; slug: string }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const result = await getCategories(true) // Only active categories
        if (result.success) {
          setCategories(result.categories)
        }
      } finally {
        setLoading(false)
      }
    }
    loadCategories()
  }, [])

  if (loading) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Loading categories..." />
        </SelectTrigger>
      </Select>
    )
  }

  return (
    <Select 
      value={value} 
      onValueChange={onChange}
      required={required}
      disabled={disabled || categories.length === 0}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select a category" />
      </SelectTrigger>
      <SelectContent>
        {categories.map((category) => (
          <SelectItem key={category.slug} value={category.name}>
            {category.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}