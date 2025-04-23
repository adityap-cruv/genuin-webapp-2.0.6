import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion'
import { type ComponentProps, useEffect, useState } from 'react'
import { CustomAvatar } from './custom-avatar'
import { cn } from '@/utils'
import { Shimmer } from './shimmer'
import { getBaseHeaders } from '@/headers'
import { getApiUrl } from '@/utils'
import { CustomLink } from '@/router/custom-link'
import { usePathNameWithSubdomain } from '@/hooks/usePathNameWithSubdomain'

type Category = {
  category: string
  communities: Community[]
}

type Community = {
  community_id: string
  handle: string
  name: string
  description: string
  color_code: string
  text_color_code: string
  dp: string
  dp_s: string
  dp_m: string
  dp_l: string
  slug: string
}

export function Categories({ className, ...props }: ComponentProps<'div'>) {
  const [isError, setIsError] = useState(false)
  const [categories, setCategories] = useState<Category[] | null>(null)
  const pathName = usePathNameWithSubdomain()

  useEffect(() => {
    async function fetchCategories() {
      void getCategories()
        .then((res) => {
          if (res.code === 200) {
            setCategories(res.data)
          }
        })
        .catch(() => {
          setIsError(true)
        })
    }
    void fetchCategories()
  }, [])

  if (isError) return

  if (!categories || categories.length === 0)
    return (
      <>
        <Shimmer />
      </>
    )

  return (
    <div
      className={cn(className)}
      {...props}>
      <p className='text-title-2-demi text-tertiary'>Categories</p>
      <Accordion
        type='single'
        collapsible
        className='my-1.5'>
        {categories?.map((category: Category, index: number) => {
          return (
            <div key={index}>
              <AccordionItem
                value={category.category}
                className='border-none'>
                <AccordionTrigger className='p-0 py-1.5'>
                  <p className='line-clamp-1 text-left text-title-2-demi'>
                    {category.category}
                  </p>
                </AccordionTrigger>
                {category.communities.map((item: Community, index: number) => (
                  <AccordionContent
                    key={index}
                    className='p-0'>
                    <CustomLink
                      target='_blank'
                      href={pathName.community(item.slug) + '?feed=1'}>
                      <div className='flex items-center gap-3 rounded-md px-3 py-1.5'>
                        <CustomAvatar
                          className='h-8 w-8 bg-red-40'
                          imageUrl={item.dp_s ?? item.dp}
                          fallbackString={item.name ?? ''}
                          isAvatar={false}
                        />
                        <p className='break-all text-title-2-demi lg:line-clamp-1'>
                          {item.name}
                        </p>
                      </div>
                    </CustomLink>
                  </AccordionContent>
                ))}
              </AccordionItem>
            </div>
          )
        })}
      </Accordion>
    </div>
  )
}

export async function getCategories(): Promise<{ code: number; data: any }> {
  try {
    const response = await fetch(
      getApiUrl('/api/v3/trending/categories_communities'),
      {
        method: 'GET',
        headers: getBaseHeaders(true),
      },
    )

    if (!response.ok) {
      throw new Error('Failed to fetch categories')
    }

    const resData = await response.json()
    return { code: resData.code, data: resData.data }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('::error in getCategories API::', e)
    return { code: 0, data: null } // Return default values in case of failure
  }
}
