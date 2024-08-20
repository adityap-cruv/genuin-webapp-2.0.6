import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ModalShell } from '../authentication/modal-shell'
import { HOW_IT_WORKS } from '@/lib/constants'

const TABS_TRIGGER_CLASS =
  'rounded-lg border-none py-2 !text-title-3-med data-[state=active]:!text-title-3-demi text-secondary-300 data-[state=active]:bg-monochrome-white data-[state=active]:text-primary'

export function HowItWorks() {
  const [flowType, setFlowType] = useState<'rewards' | 'cash'>('rewards')

  return (
    <ModalShell>
      <span className="text-center">
        <h3 className="text-title-1-demi" style={{ fontSize: '32px' }}>
          How it works
        </h3>
      </span>
      <Tabs
        className="w-full"
        defaultValue={flowType}
        onValueChange={(value) => {
          setFlowType(value as 'rewards' | 'cash')
        }}>
        <TabsList className="h-14 rounded-lg bg-tertiary-200 p-2">
          <TabsTrigger className={TABS_TRIGGER_CLASS} value="rewards">
            Reward credits
          </TabsTrigger>
          <TabsTrigger className={TABS_TRIGGER_CLASS} value="cash">
            Cash earnings
          </TabsTrigger>
        </TabsList>
        <p className="my-6 text-center text-secondary-300">
          Earn real cash by completing challenges. Deposit cash earnings directly to your bank anytime, or use them to
          shop.
        </p>
        {HOW_IT_WORKS[flowType].map((item, index) => {
          return (
            <div key={index} className="bg-white flex items-center pb-8">
              <div className="text-2xl mr-4">{item.icon}</div>
              <div>
                <p className="text-monochrome-black">{item.title}</p>
                <p className="text-tertiary">{item.description}</p>
              </div>
            </div>
          )
        })}
      </Tabs>
    </ModalShell>
  )
}
