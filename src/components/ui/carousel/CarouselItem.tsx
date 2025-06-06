
import * as React from "react"
import { cn } from "@/lib/utils"
import { useCarousel } from "./context"

export const CarouselItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { api } = useCarousel()
  const [isActive, setIsActive] = React.useState(false)
  const itemRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!api || !itemRef.current) return

    const updateActiveState = () => {
      const slides = api.slideNodes()
      const currentSlide = api.selectedScrollSnap()
      const slideIndex = slides.indexOf(itemRef.current!)
      setIsActive(slideIndex === currentSlide)
    }

    updateActiveState()
    api.on('select', updateActiveState)
    api.on('reInit', updateActiveState)

    return () => {
      api.off('select', updateActiveState)
      api.off('reInit', updateActiveState)
    }
  }, [api])

  return (
    <div
      ref={(node) => {
        if (typeof ref === 'function') ref(node)
        else if (ref) ref.current = node
        itemRef.current = node
      }}
      role="group"
      aria-roledescription="slide"
      className={cn(
        "absolute inset-0 w-full transition-opacity duration-500",
        isActive ? "opacity-100 z-10" : "opacity-0 z-0",
        className
      )}
      {...props}
    />
  )
})
CarouselItem.displayName = "CarouselItem"
