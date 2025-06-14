
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

    // Compter le nombre de slides en regardant dans CarouselContent
    React.useEffect(() => {
      const findCarouselContent = (element: React.ReactNode): number => {
        if (React.isValidElement(element)) {
          if (element.type && (element.type as any).displayName === 'CarouselContent') {
            const contentChildren = React.Children.toArray(element.props.children)
            console.log('CarouselContent children found:', contentChildren.length)
            return contentChildren.length
          }
          if (element.props && element.props.children) {
            return findCarouselContent(element.props.children)
          }
        }
        if (Array.isArray(element)) {
          for (const child of element) {
            const count = findCarouselContent(child)
            if (count > 0) return count
          }
        }
        return 0
      }

      const slideCount = findCarouselContent(children)
      setTotalSlides(slideCount)
      console.log('Total slides detected:', slideCount)
    }, [children])

    const canScrollPrev = currentSlide > 0
    const canScrollNext = currentSlide < totalSlides - 1

    console.log('Current slide:', currentSlide, 'Total slides:', totalSlides, 'Can scroll next:', canScrollNext)

    const scrollPrev = React.useCallback(() => {
      console.log('Scroll prev called, canScrollPrev:', canScrollPrev)
      if (canScrollPrev) {
        setCurrentSlide(prev => {
          console.log('Moving from slide', prev, 'to', prev - 1)
          return prev - 1
        })
      }
    }, [canScrollPrev])

    const scrollNext = React.useCallback(() => {
      console.log('Scroll next called, canScrollNext:', canScrollNext, 'currentSlide:', currentSlide, 'totalSlides:', totalSlides)
      if (canScrollNext) {
        setCurrentSlide(prev => {
          console.log('Moving from slide', prev, 'to', prev + 1)
          return prev + 1
        })
      }
    }, [canScrollNext, currentSlide, totalSlides])

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
