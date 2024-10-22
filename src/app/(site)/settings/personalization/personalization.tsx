'use client'
import { Switch } from '@components/ui/switch'
import { NotificationsSettings } from '@lib/api/settings'
import { useRouter } from 'next/navigation'
import Analytics from '@services/analytics'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Dialog, DialogClose, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { CategoryInputSettings } from './category-input-settings'
import { useEffect, useRef, useState } from 'react'
import { getCategoryList } from '@/components/common/modals/authentication/screens/category-input/api'

export function Personalization({
  settingsData,
  setSettingsData,
  isMobile,
}: {
  settingsData: { roundtable_notification: boolean }
  setSettingsData: any
  isMobile: boolean
}) {
  const router = useRouter()
  const { data: CategoryData, isLoading } = getCategoryList()
  const [selectedItems, setSelectedItem] = useState<Set<string>>(new Set())
  const initialSelectedItemsRef = useRef<Set<string>>(new Set())
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    if (CategoryData) {
      const initialSelectedItems = new Set<string>()
      CategoryData.forEach((category: any) => {
        category.topics.forEach((topic: any) => {
          if (topic.is_selected) {
            initialSelectedItems.add(topic.topic_id)
          }
        })
      })
      setSelectedItem(initialSelectedItems)
      initialSelectedItemsRef.current = new Set(initialSelectedItems) // Store initial selected items
    }
  }, [CategoryData])

  async function onToggle(value: boolean) {
    const { status } = await NotificationsSettings({
      roundtable_notification: value,
    })
    if (status) {
      setSettingsData((prevSettingsData: any) => ({
        ...prevSettingsData,
        roundtable_notification: value,
      }))
      void Analytics.track({
        eventName: 'Notification Settings Modified',
        properties: {},
      })
    }
  }

  return (
    <div>
      <div className={`${isMobile ? 'm-4' : 'mx-8 my-4'} flex items-center justify-between`}>
        {isMobile && (
          <ChevronLeft
            className="block md:hidden"
            onClick={() => {
              router.back()
              void Analytics.track({
                eventName: 'Settings Closed',
                properties: {},
              })
            }}
          />
        )}
        <p className="text-title-2-bold">Personalization</p>
        <div></div>
      </div>
      {isMobile && <hr className="bg-monochrome-black/10" />}
      {settingsData && (
        <div>
          <div className={`${isMobile ? 'm-4' : 'mx-8 my-4'}`}>
            <div
              className={cn('flex cursor-pointer justify-between rounded-t-lg border-b border-tertiary-300 px-2 py-4')}>
              <p className="text-body-1-demi">Group Notifications</p>
              <Switch
                checked={settingsData.roundtable_notification}
                onCheckedChange={(value) => {
                  void onToggle(value)
                }}
              />
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <div
                  className={cn(
                    'flex cursor-pointer justify-between rounded-t-lg border-b border-tertiary-300 px-2 py-4 hover:bg-tertiary-100'
                  )}
                  onClick={() => {
                    setDialogOpen(true)
                  }}>
                  <p className="text-body-1-demi">Interests</p>
                  <div className="flex items-center">
                    <p className="text-body-1-demi text-tertiary">{selectedItems.size} selected</p>
                    <ChevronRight className="h-6 w-6 stroke-tertiary" />
                  </div>
                </div>
              </DialogTrigger>
              <DialogContent
                showClose={false}
                className="rounded-t-lg !py-10"
                onInteractOutside={(e) => {
                  e.preventDefault()
                  setSelectedItem(initialSelectedItemsRef.current)
                  setDialogOpen(false)
                }}>
                <DialogClose className="absolute right-4 top-4 outline-none">
                  <X
                    className="stroke-secondary"
                    onClick={() => {
                      setSelectedItem(initialSelectedItemsRef.current)
                    }}
                  />
                </DialogClose>
                <CategoryInputSettings
                  CategoryData={CategoryData}
                  isLoading={isLoading}
                  selectedItems={selectedItems}
                  setSelectedItem={setSelectedItem}
                  onClose={() => {
                    setDialogOpen(false)
                    initialSelectedItemsRef.current = new Set(selectedItems)
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      )}
    </div>
  )
}
