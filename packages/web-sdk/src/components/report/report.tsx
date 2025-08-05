'use client'
import { RadioGroup, RadioItem } from '@/components/ui/radio'
import { Button } from '@/components/ui/button'
import { useCallback, useState } from 'react'
import { Loader } from '@/components/loader'
import { performReportAction } from './api'
import { Analytics } from '@/analytics'
import { useMenuContext } from '../menu/context'
import { useMutation } from '@tanstack/react-query'
import { useToast } from '@/components/ui/use-toast'
import { useReportContext } from './context'

const reportReasons = [
  'Inappropriate content',
  'Non-professional content',
  'Spam',
  'Threatening, violent or suicidal',
  'Other',
]

export function Modal() {
  const [selectedReason, setSelectedReason] = useState<string>('')
  const { contentId } = useMenuContext()
  const { toast } = useToast()
  const { changeReportType } = useReportContext()

  const handleReasonChange = (value: string) => {
    setSelectedReason(value)
  }

  const reportMutation = useMutation({
    mutationFn: async () =>
      await performReportAction({
        contentId,
        type: 'VIDEO',
        feedback: {
          type: reportReasons.indexOf(selectedReason),
          text: selectedReason,
        },
      }),
    onSuccess: () => {
      setSelectedReason('')
      changeReportType('reportSuccess')
      Analytics.track(Analytics.EventNames.VideoReport, {
        content_id: contentId,
      })
    },
    onError: () => {
      toast({ title: 'Something went wrong. Please try again.' })
    },
  })

  const handleSubmit = useCallback(() => {
    reportMutation.mutate()
  }, [selectedReason, contentId])

  return (
    <div
      className='sm:max-w-lg md:w-full md:rounded-2xl'
      onKeyDown={(e) => {
        if (e.code === 'Enter') {
          handleSubmit()
        }
      }}>
      <h2 className='w-full border-b border-tertiary-300 pb-4 pt-8 text-center text-title-1-bold'>
        Report
      </h2>
      <div className='px-6 pt-4'>
        <h3 className='mb-2 text-title-3-bold'>
          Why are you reporting this post?
        </h3>
        <p className='mb-6 text-monochrome'>Your report is anonymous.</p>
        <RadioGroup
          className='gap-4'
          value={selectedReason}
          onValueChange={handleReasonChange}>
          {reportReasons.map((reason) => (
            <RadioItem
              key={reason}
              value={reason}
              label={reason}
              className='md:gap-40'
            />
          ))}
        </RadioGroup>
        <Button
          disabled={selectedReason.trim() === '' || reportMutation.isPending}
          onClick={handleSubmit}
          className='my-6 h-12 w-full bg-primary text-body-1-med text-monochrome-white'>
          {reportMutation.isPending ? (
            <Loader className='fill-white' />
          ) : (
            'Submit'
          )}
        </Button>
      </div>
    </div>
  )
}
