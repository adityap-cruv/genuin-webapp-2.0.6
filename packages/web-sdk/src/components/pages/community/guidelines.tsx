import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import type { CommunityDetailsType } from './schema'

export function Guidelines({
  guidelines,
}: {
  guidelines?: CommunityDetailsType['guidelines']
}) {
  if (!guidelines || guidelines.length === 0) return

  return (
    <div className='mb-4'>
      <p className='my-2 text-title-3-bold'>Guidelines</p>
      <>
        <Accordion
          type='single'
          collapsible>
          {guidelines.map((guideline, index: number) => {
            return (
              <div key={index}>
                <AccordionItem
                  value={guideline.title}
                  className='border-none'>
                  <AccordionTrigger className='my-1 p-0'>
                    <p className='line-clamp-1 text-left text-body-1-med'>
                      {index + 1}. {guideline.title}
                    </p>
                  </AccordionTrigger>
                  <AccordionContent className='w-[80%] pl-4'>
                    <p className='line-clamp-2 text-left  text-tertiary'>
                      {guideline.description}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </div>
            )
          })}
        </Accordion>
      </>
    </div>
  )
}
