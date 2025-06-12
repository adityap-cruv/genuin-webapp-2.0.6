'use client'
import { RadioGroup, RadioItem } from '@/components/ui/radio'
import { Button } from '@/components/ui/button'
import { useCallback, useState } from 'react'
import { Loader } from '@/components/ui/loader'
import { report } from './api'
import { useAnalyticsTracker } from '../../player/control-layer/actions/use-analytics-event'
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
  const { contentId } = useMenuContext()
  const { changeReportType } = useReportContext()
  const [selectedReason, setSelectedReason] = useState<string>('')
  const { trackEvent } = useAnalyticsTracker()
  const { toast } = useToast()

  const handleReasonChange = (value: string) => {
    setSelectedReason(value)
  }

  const reportMutation = useMutation({
    mutationFn: async () =>
      await report(contentId, 'VIDEO', {
        type: reportReasons.indexOf(selectedReason),
        text: selectedReason,
      }),
    onSuccess: () => {
      setSelectedReason('')
      changeReportType('reportSuccess')
      trackEvent('Video Report', contentId)
    },
    onError: () => {
      toast({ title: 'Something went wrong. Please try again.' })
    },
  })

  const handleSubmit = useCallback(() => {
    reportMutation.mutate()
  }, [selectedReason, contentId, reportMutation])

  return (
    <div
      className="!p-0 sm:max-w-lg sm:px-8 md:w-full md:rounded-2xl"
      onKeyDown={(e) => {
        if (e.code === 'Enter') {
          handleSubmit()
        }
      }}>
      <h2 className="w-full border-b border-tertiary-300 pb-4 pt-8 text-center text-title-1-bold">Report</h2>
      <div className="px-6 pt-4">
        <h3 className="mb-2 text-title-3-bold">Why are you reporting this post?</h3>
        <p className="mb-6 text-monochrome">Your report is anonymous.</p>
        <input type="text" style={{ position: 'absolute', opacity: 0, height: 0 }} />
        <RadioGroup className="gap-4" value={selectedReason} onValueChange={handleReasonChange}>
          {reportReasons.map((reason: string) => (
            <RadioItem key={reason} value={reason} label={reason} className="md:gap-40" />
          ))}
        </RadioGroup>
        <Button
          disabled={selectedReason.trim() === '' || reportMutation.isLoading}
          onClick={handleSubmit}
          className="my-6 h-12 w-full bg-primary text-body-1-med text-monochrome-white">
          {reportMutation.isLoading ? <Loader className="stroke-monochrome-white" /> : 'Submit'}
        </Button>
      </div>
    </div>
  )
}
