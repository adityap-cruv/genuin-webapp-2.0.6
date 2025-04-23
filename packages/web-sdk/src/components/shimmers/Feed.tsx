import { CustomizationType } from '@/type'
import { Shimmer } from '../ui/shimmer'

export const FeedShimmers = {
  Feed: feed,
}

function feed({
  videoHeight,
  customizations,
}: {
  videoHeight: number
  customizations: CustomizationType
}) {
  return (
    <div className='relative bg-white overflow-x-hidden __gen__sdk__hide__scrollbar h-full w-full'>
      <div
        className='relative border-2 border-gray-100 rounded-xl'
        style={{
          height: `calc((${videoHeight}px - 24px) * (0.88))`,
          width: `calc(100% - 16px)`,
        }}>
        {/* video section */}
        <Shimmer className='p-0 h-[90%] w-full' />
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
          <div className='absolute w-full bottom-0 flex justify-around items-center h-[10%]'>
            <Shimmer className='h-8 w-8 rounded-md' />
            <Shimmer className='h-8 w-8 rounded-md' />
            <Shimmer className='h-8 w-8 rounded-md' />
          </div>
        )}
      </div>
    </div>
  )
}
