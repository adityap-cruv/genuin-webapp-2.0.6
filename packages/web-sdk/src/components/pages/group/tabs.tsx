import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Posts } from './posts'
import { Members } from './members'
import { TabsProps } from '@radix-ui/react-tabs'
import { cn } from '@/utils'

type LoopTabsType = { slug: string } & TabsProps

export function LoopTabs({
  slug,
  className,
  defaultValue,
  ...restProps
}: LoopTabsType) {
  return (
    <Tabs
      defaultValue='Posts'
      className={cn(className)}
      {...restProps}>
      <TabsList className='sticky flex max-w-min'>
        <TabsTrigger value='Posts'>
          <p className='text-title-3-bold'>Posts</p>
        </TabsTrigger>
        <TabsTrigger value='Members'>
          <p className='text-title-3-bold'>Members</p>
        </TabsTrigger>
      </TabsList>
      <hr className='border-t border-tertiary-200' />
      <TabsContent
        value='Posts'
        className='p-2'>
        <Posts
          showTitle={false}
          slug={slug}
        />
      </TabsContent>
      <TabsContent value='Members'>
        <Members
          showTitle={false}
          slug={slug}
        />
      </TabsContent>
    </Tabs>
  )
}
