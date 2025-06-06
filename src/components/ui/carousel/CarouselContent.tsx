
import * as React from "react"
import { cn } from "@/lib/utils"
import { useCarousel } from "./context"

export const CarouselContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { carouselRef, orientation } = useCarousel()

  return (
    <div ref={carouselRef} className="overflow-hidden">
      <div
        ref={ref}
        className={cn(
          "flex min-h-[600px] overflow-hidden",
          orientation === "vertical" ? "flex-col" : "flex-row",
          className
        )}
        {...props}
      />
    </div>
  )
})
CarouselContent.displayName = "CarouselContent"
