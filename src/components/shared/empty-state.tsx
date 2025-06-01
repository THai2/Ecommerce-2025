import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  description: string
  actionText: string
  actionHref: string
  icon?: ReactNode
}

export default function EmptyState({
  title,
  description,
  actionText,
  actionHref,
  icon
}: EmptyStateProps) {
  return (
    <div className="container flex flex-col items-center justify-center py-12 text-center">
      {icon && <div className="mb-4">{icon}</div>}
      <h2 className="mb-2 text-2xl font-bold tracking-tight">{title}</h2>
      <p className="mb-6 text-muted-foreground">{description}</p>
      <Button asChild>
        <Link href={actionHref}>{actionText}</Link>
      </Button>
    </div>
  )
}