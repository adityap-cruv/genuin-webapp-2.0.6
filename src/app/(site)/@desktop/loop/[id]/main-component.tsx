'use client'
import { Button } from '@components/ui/button'
import type { LoopDetailsType } from '@lib/schemas/loop/details'
import Image from 'next/image'
import icShare from '@icons/icShareBlue.svg'
import icQuestion from '@icons/icQuestion.svg'
import { CustomAvatar } from '@components/custom/custom-avatar'

interface Props {
  loopDetails: LoopDetailsType
}

export function MainComponent({ loopDetails }: Props) {
  if (loopDetails)
    return (
      <main className="p-6">
        <span className="w-1/2">
          <p className="text-title-lg font-semibold">{loopDetails.group.group_name}</p>
          <p className="line-clamp-2 w-1/2 pt-2 text-body-sm font-medium">{loopDetails.group.group_description}</p>
          <div className="w-1/2 rounded-lg border border-monochrome-9 p-4">
            <span className="flex">
              <span className="flex-1">
                <p className="text-body-sm text-monochrome">Created by</p>
                <span className="flex items-center gap-x-1 pt-2">
                  <CustomAvatar imageUrl="" fallbackString="No" isAvatar={false} />
                  <p className="text-title-sm">@kim.paquette</p>
                </span>
              </span>
              <span className="flex-1">
                <p className="text-body-sm text-monochrome">Created by</p>
                <span className="flex items-center gap-x-1 pt-2">
                  <CustomAvatar imageUrl="" fallbackString="No" isAvatar={false} />
                  <p className="text-title-sm">@kim.paquette</p>
                </span>
              </span>
            </span>
            <Stats
              statsData={[
                { key: 'Posts', value: 35 },
                { key: 'Collaborators', value: 5 },
                { key: 'Subscribers', value: 150 },
              ]}
            />
          </div>
          <span className="flex gap-x-3 pt-2">
            <Button>
              <p>Subscribe</p>
            </Button>
            <Button variant="outline" className="border-primary">
              <span className="flex">
                <Image src={icQuestion} alt="question" />
                <p className="text-body-sm font-medium text-primary">Q&A</p>
              </span>
            </Button>
          </span>
        </span>
      </main>
    )
}

function Stats({
  statsData,
}: {
  /**
   * Here statsData accept array of object in which you pass key the statTitle, and
   * value which accepts value of stat
   */
  statsData: Array<{ key: string; value: number }>
}) {
  return (
    <div className="flex justify-start gap-x-4 pt-6">
      {statsData.map((obj, index) => {
        return (
          <div key={index} className="flex items-center gap-x-1">
            <p className="text-title-lg">{obj.value}</p>
            <p className="text-body-sm text-monochrome">{obj.key}</p>
          </div>
        )
      })}
    </div>
  )
}
