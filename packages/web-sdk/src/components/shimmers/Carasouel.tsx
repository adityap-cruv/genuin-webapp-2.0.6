import { CustomizationType } from '@/type'
import { Shimmer } from '../ui/shimmer'

export const CarasouelShimmers = {
  Carousel: Carousel,
}

function Carousel({
  embedWidth,
  customizations,
  videoHeight,
  videoWidth,
}: {
  embedWidth: number
  videoHeight: number
  videoWidth: number
  customizations: CustomizationType
}) {
  videoHeight = (videoWidth - 48) * (16 / 9)
  videoWidth = videoHeight * (9 / 16)

  const count = Math.ceil(embedWidth / videoWidth)

  return (
    <div className='relative bg-white overflow-x-hidden __gen__sdk__hide__scrollbar h-full w-full'>
      {/* top section */}
      <div className='flex justify-between items-center mb-4'>
        <div>
          <Shimmer className='h-6 w-32 rounded-md mb-1' />
          <Shimmer className='h-8 w-48 rounded-md' />
        </div>
        <div>
          <Shimmer className='h-10 w-48 rounded-md' />
        </div>
      </div>
      <div
        className='flex gap-3'
        style={{ height: `${videoHeight}px`, width: `${embedWidth}px` }}>
        {Array.from({ length: count }).map((_, index) => {
          return (
            <div
              key={index}
              className='relative border-2 border-gray-100 rounded-xl'>
              {/* video section */}
              <Shimmer
                className='p-0'
                style={{
                  height: `calc((${videoHeight}px) * 0.9)`,
                  width: `${videoWidth}px`,
                }}
              />
              {/* Video View Count Section */}
              {customizations.is_show_view_count && (
                <Shimmer
                  className='absolute left-4 z-10 h-8 w-8 border border-gray-200 shadow-md bg-gray-200 rounded-md'
                  style={{ top: 'calc(90% - 48px)' }}
                />
              )}
              {/* mute/unmute play/pause fullscreen section */}
              <div className='absolute z-10 top-2 right-4 flex gap-4'>
                <Shimmer className='h-8 w-8 rounded-full border-gray-200 shadow-md bg-gray-200' />
                <Shimmer className='h-8 w-8 rounded-full border-gray-200 shadow-md bg-gray-200' />
                <Shimmer className='h-8 w-8 rounded-full border-gray-200 shadow-md bg-gray-200' />
              </div>
              {/* spark comment and share section */}
              {customizations.is_show_social_interaction_data && (
                <div className='flex justify-around items-center h-[10%]'>
                  <Shimmer className='h-8 w-8 rounded-md' />
                  <Shimmer className='h-8 w-8 rounded-md' />
                  <Shimmer className='h-8 w-8 rounded-md' />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
