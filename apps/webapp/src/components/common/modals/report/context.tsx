'use client'
import React, { createContext, useContext, useState } from 'react'

// Combine all modal types
type ReportType = 'report' | 'reportSuccess' | 'loginRequired' | null

type ReportContextType = {
  changeReportType: (type: ReportType) => void
  reportModalType: ReportType
}

const ReportContext = createContext<ReportContextType | null>(null)

interface ReportProviderProps {
  children: React.ReactNode
}

export const ReportProvider: React.FC<ReportProviderProps> = ({ children }) => {
  // Modal state
  const [reportModalType, setModalType] = useState<ReportType>(null)

  const value: ReportContextType = {
    changeReportType: setModalType,
    reportModalType,
  }

  return <ReportContext.Provider value={value}>{children}</ReportContext.Provider>
}

export const useReportContext = (): ReportContextType => {
  const context = useContext(ReportContext)
  if (!context) {
    throw new Error('useReportContext must be used within a MenuProvider')
  }
  return context
}
