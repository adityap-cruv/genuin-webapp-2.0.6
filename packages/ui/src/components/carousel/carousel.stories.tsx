import type { Meta, StoryObj } from "@storybook/react";
import { 
  Carousel, 
  CarouselContent, 
  CarouselDots, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "./carousel";

/**
 * The Carousel component provides a sliding container for cycling through content.
 * It supports both horizontal and vertical orientations, custom navigation controls,
 * and keyboard navigation.
 */
const meta: Meta<typeof Carousel> = {
  title: "Components/Carousel",
  component: Carousel,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "A flexible carousel component with customizable navigation and orientation.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="gencl:w-full gencl:max-w-3xl gencl:p-10 gencl:bg-white">
        <Story />
      </div>
    ),
  ],
  tags: ["autodocs"],
  argTypes: {
    orientation: {
      description: "Direction of carousel movement",
      control: "select",
      options: ["horizontal", "vertical"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Carousel>;

/**
 * Default horizontal carousel with images
 */
export const Default: Story = {
  render: () => (
    <Carousel>
      <CarouselContent>
        {Array.from({ length: 5 }).map((_, index) => (
          <CarouselItem key={index}>
            <div className="gencl:p-1">
              <div className="gencl:flex gencl:aspect-square gencl:items-center gencl:justify-center gencl:rounded-md gencl:border gencl:border-secondary-200 gencl:bg-secondary-100 gencl:p-6">
                <span className="gencl:text-3xl gencl:font-semibold">
                  {index + 1}
                </span>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
  parameters: {
    docs: {
      description: {
        story: "Basic horizontal carousel with navigation buttons.",
      },
    },
  },
};

/**
 * Vertical orientation carousel
 */
export const Vertical: Story = {
  render: () => (
    <Carousel orientation="vertical">
      <CarouselContent>
        {Array.from({ length: 5 }).map((_, index) => (
          <CarouselItem key={index}>
            <div className="gencl:p-1">
              <div className="gencl:flex gencl:h-40 gencl:items-center gencl:justify-center gencl:rounded-md gencl:border gencl:border-secondary-200 gencl:bg-secondary-100">
                <span className="gencl:text-3xl gencl:font-semibold">
                  {index + 1}
                </span>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
  parameters: {
    docs: {
      description: {
        story: "Vertical orientation with custom height and navigation placement.",
      },
    },
  },
};

/**
 * Multiple items per view
 */
export const MultipleItems: Story = {
  render: () => (
    <Carousel
      opts={{
        align: "start",
        slidesToScroll: 2,
      }}
    >
      <CarouselContent className="-ml-2 md:-ml-4">
        {Array.from({ length: 10 }).map((_, index) => (
          <CarouselItem key={index} className="pl-2 md:pl-4 basis-1/2 md:basis-1/3">
            <div className="gencl:flex gencl:aspect-square gencl:items-center gencl:justify-center gencl:rounded-md gencl:border gencl:border-secondary-200 gencl:bg-secondary-100">
              <span className="gencl:text-3xl gencl:font-semibold">
                {index + 1}
              </span>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
  parameters: {
    docs: {
      description: {
        story: "Shows multiple items per view with responsive layout.",
      },
    },
  },
};

/**
 * Custom Navigation Style
 */
export const CustomNavigation: Story = {
  render: () => (
    <Carousel>
      <CarouselContent>
        {Array.from({ length: 5 }).map((_, index) => (
          <CarouselItem key={index}>
            <div className="gencl:p-1">
              <div className="gencl:flex gencl:aspect-square gencl:items-center gencl:justify-center gencl:rounded-md gencl:border gencl:border-secondary-200 gencl:bg-secondary-100">
                <span className="gencl:text-3xl gencl:font-semibold">
                  {index + 1}
                </span>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious 
        theme="primary"
        className="gencl:bg-primary gencl:text-white hover:gencl:bg-primary/90"
      />
      <CarouselNext 
        theme="primary"
        className="gencl:bg-primary gencl:text-white hover:gencl:bg-primary/90"
      />
    </Carousel>
  ),
  parameters: {
    docs: {
      description: {
        story: "Carousel with custom styled navigation buttons.",
      },
    },
  },
};

/**
 * Interactive carousel with dots navigation and swipe functionality
 */
export const WithDotsAndSwipe: Story = {
  render: () => (
    <div className="gencl:space-y-8">
      <Carousel
        opts={{
          align: "start",
          loop: true,
          dragFree: true,
        }}
      >
        <CarouselContent>
          {Array.from({ length: 6 }).map((_, index) => (
            <CarouselItem key={index}>
              <div className="gencl:p-1">
                <div className="gencl:aspect-video gencl:flex gencl:items-center gencl:justify-center gencl:rounded-xl gencl:border gencl:border-secondary-200 gencl:bg-gradient-to-br gencl:from-primary/5 gencl:to-secondary-100">
                  <div className="gencl:text-center">
                    <span className="gencl:text-4xl gencl:font-semibold gencl:text-primary">
                      {index + 1}
                    </span>
                    <p className="gencl:mt-2 gencl:text-sm gencl:text-secondary-600">
                      Swipe or use dots
                    </p>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious 
          className="gencl:-left-4 gencl:size-8 gencl:opacity-50 hover:gencl:opacity-100" 
        />
        <CarouselNext 
          className="gencl:-right-4 gencl:size-8 gencl:opacity-50 hover:gencl:opacity-100" 
        />
        <CarouselDots 
          className="gencl:mt-4"
          dotClassName="gencl:size-2 gencl:opacity-50"
          activeDotClassName="gencl:size-2.5 gencl:opacity-100"
        />
      </Carousel>
      <div className="gencl:text-center gencl:text-sm gencl:text-secondary-600">
        <p>Try swiping left/right or using the dot navigation</p>
        <p className="gencl:mt-1 gencl:text-xs">Supports touch, mouse drag, and keyboard navigation</p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: `
A fully interactive carousel that demonstrates:
- Smooth swipe/drag interactions
- Dot navigation for direct slide access
- Infinite loop navigation
- Touch, mouse, and keyboard support
- Visual feedback for active slide
- Responsive navigation controls
        `,
      },
    },
  },
};