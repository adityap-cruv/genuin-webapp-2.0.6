'use client'

import { openModal } from '@/lib/utils'
import { Status } from '../report/status'
import { Modal } from './report'
import React, { useEffect } from 'react'
import { useReportContext } from './context'
import { useMenuContext } from '../menu/context'
import { useGenuinOptions } from '@/lib/stores/genuin-options'
import { Loader } from '@/components/ui/loader'
import { useToast } from '@components/ui/use-toast'

export function Report() {
  const { reportModalType, changeReportType } = useReportContext()
  const { changeModalType } = useMenuContext()
  const { user } = useGenuinOptions()
  const { toast } = useToast()

  const renderContent = () => {
    switch (reportModalType) {
      case 'report':
        return <Modal />
      case 'reportSuccess':
        return <Status title="Post reported" subtitle="Our team will review and act on your report." />
      case 'loginRequired':
        return (
          <Status
            title="Login to Report"
            subtitle="You need to login in order to report the post."
            action={{
              label: 'Continue',
              onClick: () => {
                changeModalType('report')
                openModal({ subtitle: 'Get the app to report the video.' })
              },
            }}
          />
        )
      default:
        return null
    }
  }

  useEffect(() => {
    if (user) {
      if (user.isBrandSystemUser) {
        changeModalType(null)
        toast({ title: 'Brand Owner Cannot Report Post.' })
        return
      }
      changeReportType('report')
    } else {
      changeReportType('loginRequired')
    }
  }, [user])

  return <>{reportModalType === null ? <Loader /> : renderContent()}</>
}
