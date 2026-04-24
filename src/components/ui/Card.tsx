import { cn } from '@/lib/utils'
import { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
  variant?: 'default' | 'bordered' | 'filled'
}

function Card({ className, hover = false, padding = 'md', variant = 'default', children, ...props }: CardProps) {
  const paddings = { none: '', sm: 'p-5', md: 'p-7', lg: 'p-8' }

  const variants = {
    default: 'bg-white border border-slate-200 shadow-sm',
    bordered: 'bg-white border-2 border-slate-300',
    filled: 'bg-slate-50 border border-slate-200',
  }

  return (
    <div
      className={cn(
        'rounded-2xl',
        variants[variant],
        paddings[padding],
        hover && 'transition-all duration-200 hover:shadow-md hover:-translate-y-1 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mb-4', className)} {...props}>{children}</div>
}

function CardTitle({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-base font-bold text-slate-900', className)} {...props}>{children}</h3>
}

function CardDescription({ className, children, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm text-slate-500 mt-0.5', className)} {...props}>{children}</p>
}

function CardContent({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('', className)} {...props}>{children}</div>
}

function CardFooter({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('mt-4 pt-4 border-t border-slate-100 flex items-center gap-3', className)} {...props}>
      {children}
    </div>
  )
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
