
import * as React from "react"
import { cn } from "@/lib/utils"

interface CarouselItemProps extends React.HTMLAttributes<HTMLDivElement> {
  isActive?: boolean
  slideIndex?: number
}

export const CarouselItem = React.forwardRef<
  HTMLDivElement,
  CarouselItemProps
>(({ className, isActive = false, slideIndex, ...props }, ref) => {
  return (
    <div
      ref={ref}
      role="group"
      aria-roledescription="slide"
      className={cn(
        "absolute inset-0 w-full h-full flex items-center justify-center transition-opacity duration-500",
        isActive ? "opacity-100 z-10" : "opacity-0 z-0",
        className
      )}
      {...props}
    />
  )
})
CarouselItem.displayName = "CarouselItem"
