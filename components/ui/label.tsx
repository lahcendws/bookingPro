import * as React from 'react'
import { cn } from '@/lib/utils'

const Label = React.forwardRef<
  HTMLLabelElement,
  React.ComponentProps<typeof label>
>(({ className, ...props }, ref) => (
  <label
    className={cn('text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-75', className)}
    ref={ref}
    {...props}
  />
))
Label.displayName = 'Label'

export { Label }