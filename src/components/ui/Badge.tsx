import { cn } from '@/lib/utils'
import { HTMLAttributes } from 'react'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'blue' | 'green' | 'yellow' | 'red' | 'slate' | 'navy' | 'purple' | 'cyan'
  size?: 'xs' | 'sm' | 'md'
}

function Badge({ className, variant = 'default', size = 'sm', children, ...props }: BadgeProps) {
  const variants = {
    default: 'bg-slate-100 text-slate-600',
    blue:    'bg-blue-50 text-blue-700',
    green:   'bg-emerald-50 text-emerald-700',
    yellow:  'bg-amber-50 text-amber-700',
    red:     'bg-red-50 text-red-700',
    slate:   'bg-slate-100 text-slate-500',
    navy:    'bg-slate-900 text-white',
    purple:  'bg-violet-50 text-violet-700',
    cyan:    'bg-cyan-50 text-cyan-700',
  }

  const sizes = {
    xs: 'px-2 py-0.5 text-[10px] font-semibold',
    sm: 'px-2.5 py-0.5 text-xs font-semibold',
    md: 'px-3 py-1 text-sm font-medium',
  }

  return (
    <span
      className={cn('inline-flex items-center rounded-full gap-1', variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </span>
  )
}

export { Badge }
