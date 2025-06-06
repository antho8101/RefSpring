
import * as React from "react"
import { cn } from "@/lib/utils"
import { useCarousel } from "./context"

export const CarouselContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { currentSlide } = useCarousel()

  return (
    <div
      ref={ref}
      className={cn(
        "relative min-h-[600px] w-full overflow-hidden",
        className
      )}
      {...props}
    >
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            ...child.props,
            isActive: index === currentSlide,
            slideIndex: index
          })
        }
        return child
      })}
    </div>
  )
})
CarouselContent.displayName = "CarouselContent"
