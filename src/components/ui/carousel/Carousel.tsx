
import * as React from "react"
import { cn } from "@/lib/utils"
import { CarouselContext } from "./context"
import { CarouselProps } from "./types"

export const Carousel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & CarouselProps
>(
  (
    {
      orientation = "horizontal",
      opts,
      setApi,
      plugins,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const [currentSlide, setCurrentSlide] = React.useState(0)
    const [totalSlides, setTotalSlides] = React.useState(0)

    // Compter le nombre de slides
    React.useEffect(() => {
      const slideCount = React.Children.count(children)
      setTotalSlides(slideCount)
    }, [children])

    const canScrollPrev = currentSlide > 0
    const canScrollNext = currentSlide < totalSlides - 1

    const scrollPrev = React.useCallback(() => {
      if (canScrollPrev) {
        setCurrentSlide(prev => prev - 1)
      }
    }, [canScrollPrev])

    const scrollNext = React.useCallback(() => {
      if (canScrollNext) {
        setCurrentSlide(prev => prev + 1)
      }
    }, [canScrollNext])

    // API compatible pour l'OnboardingCarousel
    const api = React.useMemo(() => ({
      selectedScrollSnap: () => currentSlide,
      on: (event: string, callback: () => void) => {
        // Simuler les événements d'Embla
      },
      off: (event: string, callback: () => void) => {
        // Simuler les événements d'Embla
      }
    }), [currentSlide])

    React.useEffect(() => {
      if (setApi) {
        setApi(api as any)
      }
    }, [api, setApi])

    const handleKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault()
          scrollPrev()
        } else if (event.key === "ArrowRight") {
          event.preventDefault()
          scrollNext()
        }
      },
      [scrollPrev, scrollNext]
    )

    return (
      <CarouselContext.Provider
        value={{
          carouselRef: null,
          api: api as any,
          opts,
          orientation,
          scrollPrev,
          scrollNext,
          canScrollPrev,
          canScrollNext,
          currentSlide,
          totalSlides
        }}
      >
        <div
          ref={ref}
          onKeyDownCapture={handleKeyDown}
          className={cn("relative", className)}
          role="region"
          aria-roledescription="carousel"
          {...props}
        >
          {children}
        </div>
      </CarouselContext.Provider>
    )
  }
)
Carousel.displayName = "Carousel"
