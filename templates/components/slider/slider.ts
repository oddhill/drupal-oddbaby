import EmblaCarousel, { EmblaCarouselType } from 'embla-carousel';
import AutoHeight from 'embla-carousel-auto-height';
import Accessibility from 'embla-carousel-accessibility';
import { getResponsiveValue, onBreakpointChange, getCurrentBreakpoint, type BreakpointName } from './breakpoints.ts';
import './slider.scss';

declare const Drupal: {
  behaviors: Record<string, { attach: (context: ParentNode) => void }>;
};
declare function once(id: string, selector: string, context?: ParentNode): Element[];

type SliderElements = {
  root: HTMLElement;
  viewport: HTMLElement;
  prevButton: HTMLButtonElement | null;
  nextButton: HTMLButtonElement | null;
  dotsRoot: HTMLElement | null;
  container: HTMLElement;
};

const getElements = (root: HTMLElement): SliderElements | null => {
  const viewport = root.querySelector<HTMLElement>('.slider__viewport');
  if (!viewport) {
    return null;
  }

  const container = viewport.querySelector<HTMLElement>('.slider__container');
  if (!container) {
    return null;
  }

  return {
    root,
    viewport,
    container,
    prevButton: root.querySelector<HTMLButtonElement>('[data-slider-prev]'),
    nextButton: root.querySelector<HTMLButtonElement>('[data-slider-next]'),
    dotsRoot: root.querySelector<HTMLElement>('[data-slider-dots]'),
  };
};

const updateButtons = (embla: EmblaCarouselType, elements: SliderElements): void => {
  if (elements.prevButton) {
    elements.prevButton.disabled = !embla.canGoToPrev();
  }
  if (elements.nextButton) {
    elements.nextButton.disabled = !embla.canGoToNext();
  }
};

const buildDots = (embla: EmblaCarouselType, elements: SliderElements): void => {
  if (!elements.dotsRoot) {
    return;
  }

  elements.dotsRoot.innerHTML = '';

  try {
    const snaps = embla.snapList();
    snaps.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'slider__dot';
      dot.setAttribute('aria-label', `Go to slide ${index + 1}`);

      dot.addEventListener('click', () => {
        embla.goTo(index);
      });

      elements.dotsRoot?.appendChild(dot);
    });
  } catch (error) {
    // buildDots error silently
  }
};

const updateDots = (embla: EmblaCarouselType, elements: SliderElements): void => {
  if (!elements.dotsRoot) {
    return;
  }

  const activeIndex = embla.selectedSnap();
  const dots = elements.dotsRoot.querySelectorAll<HTMLButtonElement>('.slider__dot');

  dots.forEach((dot, index) => {
    const isActive = index === activeIndex;
    dot.classList.toggle('is-active', isActive);
    dot.setAttribute('aria-current', isActive ? 'true' : 'false');
  });
};

const initSlider = (root: HTMLElement): void => {
  const elements = getElements(root);
  if (!elements) {
    return;
  }

  // Read configuration from data attributes
  const autoplayAttr = root.getAttribute('data-autoplay');
  const autoplayInterval = autoplayAttr && parseInt(autoplayAttr) > 0 ? parseInt(autoplayAttr) : 0;
  const loop = root.getAttribute('data-loop') === 'true';
  const align = (root.getAttribute('data-align') || 'start') as 'start' | 'center' | 'end';
  const autoHeight = root.getAttribute('data-auto-height') === 'true';

  // Read responsive configuration
  const responsiveSlidesPerViewAttr = root.getAttribute('data-slides-per-breakpoint');
  const responsiveSlidesToScrollAttr = root.getAttribute('data-slides-to-scroll-breakpoint');
  
  let responsiveSlidesPerView: Partial<Record<BreakpointName, number>> | null = null;
  let responsiveSlidesToScroll: Partial<Record<BreakpointName, number>> | null = null;

  if (responsiveSlidesPerViewAttr) {
    try {
      responsiveSlidesPerView = JSON.parse(responsiveSlidesPerViewAttr);
    } catch (e) {
      // Invalid JSON, fall back to non-responsive
    }
  }

  if (responsiveSlidesToScrollAttr) {
    try {
      responsiveSlidesToScroll = JSON.parse(responsiveSlidesToScrollAttr);
    } catch (e) {
      // Invalid JSON, fall back to non-responsive
    }
  }

  // Read button configuration
  const buttonPositioning = root.getAttribute('data-button-positioning') || 'bottom';
  const buttonHiddenBpsAttr = root.getAttribute('data-button-hidden-breakpoints');
  let buttonHiddenBreakpoints: BreakpointName[] = [];

  if (buttonHiddenBpsAttr) {
    try {
      buttonHiddenBreakpoints = JSON.parse(buttonHiddenBpsAttr);
    } catch (e) {
      // Invalid JSON
    }
  }

  const controlsElement = root.querySelector<HTMLElement>('[data-slider-controls]');

  // Get initial values - responsive or fallback to data attributes
  const getInitialSlidesToScroll = (): number => {
    if (responsiveSlidesToScroll) {
      const value = getResponsiveValue(responsiveSlidesToScroll);
      if (value) return value;
    }
    return parseInt(root.getAttribute('data-slides-to-scroll') || '1') || 1;
  };

  const getInitialSlidesPerView = (): number => {
    if (responsiveSlidesPerView) {
      const value = getResponsiveValue(responsiveSlidesPerView);
      if (value) return value;
    }
    return parseFloat(root.getAttribute('data-slides-per-view') || '1') || 1;
  };

  let currentSlidesToScroll = getInitialSlidesToScroll();
  let currentSlidesPerView = getInitialSlidesPerView();

  let embla: EmblaCarouselType | null = null;
  let cleanupResizeListener: (() => void) | null = null;

  const updateSlideSize = (slidesPerView: number): void => {
    // Only calculate slide-size for multi-slide layouts
    // For single slide (slides_per_view: 1), preserve CSS value for effects like peeking (70%)
    if (slidesPerView > 1) {
      const slideSize = `calc(100% / ${slidesPerView})`;
      root.style.setProperty('--slide-size', slideSize);
    }
  };

  const updateButtonLayout = (): void => {
    if (!controlsElement) return;

    // Update positioning
    controlsElement.classList.toggle('slider__controls--side-center', buttonPositioning === 'side-center');

    // Update visibility based on current breakpoint
    const currentBreakpoint = getCurrentBreakpoint();
    const shouldHide = buttonHiddenBreakpoints.includes(currentBreakpoint);
    controlsElement.style.display = shouldHide ? 'none' : '';
  };

  const createCarousel = (): void => {
    // Build plugins array based on configuration
    const plugins = [];
    
    if (autoHeight) {
      plugins.push(AutoHeight());
    }

    // Always enable accessibility with plugin
    plugins.push(
      Accessibility({
        announceChanges: true,
        rootNode: (emblaRoot) => emblaRoot.parentElement || emblaRoot
      })
    );

    // Initialize carousel with plugins
    try {
      embla = EmblaCarousel(elements.viewport, {
        align,
        containScroll: 'keepSnaps',
        loop,
        dragFree: false,
        slidesToScroll: currentSlidesToScroll,
      }, plugins);

      // Build dots after Embla is ready
      buildDots(embla, elements);

      // Setup accessibility via plugin
      const setupAccessibility = () => {
        const accessibility = embla?.plugins().accessibility;
        if (!accessibility) {
          return;
        }
        
        accessibility.setupPrevAndNextButtons(
          '[data-slider-prev]',
          '[data-slider-next]'
        );
        
        accessibility.setupDotButtons('[data-slider-dots]');
      };

      setupAccessibility();

      // Button interactions
      if (elements.prevButton) {
        elements.prevButton.addEventListener('click', () => {
          embla?.goToPrev();
        });
      }

      if (elements.nextButton) {
        elements.nextButton.addEventListener('click', () => {
          embla?.goToNext();
        });
      }

      // Keyboard navigation
      elements.viewport.addEventListener('keydown', (event: KeyboardEvent) => {
        if (event.key === 'ArrowLeft') {
          embla?.goToPrev();
        }
        if (event.key === 'ArrowRight') {
          embla?.goToNext();
        }
      });

      // Update UI state
      const syncUi = (): void => {
        if (embla) {
          updateButtons(embla, elements);
          updateDots(embla, elements);
        }
      };

      embla.on('select', syncUi);

      syncUi();
    } catch (error) {
      throw error;
    }
  };

  // Handle responsive updates
  const handleResponsiveUpdate = (): void => {
    const newSlidesToScroll = getInitialSlidesToScroll();
    const newSlidesPerView = getInitialSlidesPerView();

    // Only reinitialize if values changed
    if (newSlidesToScroll !== currentSlidesToScroll || newSlidesPerView !== currentSlidesPerView) {
      currentSlidesToScroll = newSlidesToScroll;
      currentSlidesPerView = newSlidesPerView;

      updateSlideSize(currentSlidesPerView);

      // Destroy and recreate carousel with new settings
      if (embla) {
        embla.destroy();
      }

      createCarousel();
    }
  };

  // Initial setup
  // Only set slide-size if using responsive breakpoints
  if (responsiveSlidesPerView || responsiveSlidesToScroll) {
    updateSlideSize(currentSlidesPerView);
  }
  updateButtonLayout();
  createCarousel();

  // Set up responsive listener if responsive config is provided
  if (responsiveSlidesPerView || responsiveSlidesToScroll || buttonHiddenBreakpoints.length > 0) {
    cleanupResizeListener = onBreakpointChange(() => {
      handleResponsiveUpdate();
      updateButtonLayout();
    });
  }

  // Store cleanup function on root for potential cleanup
  (root as any).__sliderCleanup = () => {
    if (cleanupResizeListener) {
      cleanupResizeListener();
    }
    if (embla) {
      embla.destroy();
    }
  };
};

Drupal.behaviors.genericEmblaSlider = {
  attach(context: ParentNode): void {
    once('generic-embla-slider', '.slider[data-slider="embla"]', context).forEach((element) => {
      try {
        initSlider(element as HTMLElement);
      } catch (error) {
        // Silently fail on initialization errors
      }
    });
  },
};
