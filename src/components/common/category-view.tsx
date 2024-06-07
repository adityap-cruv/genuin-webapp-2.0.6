import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@components/ui/accordion'
import { getCategories } from '@lib/api/category'
import { useEffect, useState } from 'react'
import { CustomAvatar } from '@components/custom/custom-avatar'
import Link from 'next/link'
import { PATH_NAME } from '@lib/utils/constants/path'

interface Category {
  category: string
  communities: Community[]
}

interface Community {
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

export function CategoryView() {
  const [categories, setCategories] = useState<Category[] | null>(null)

  useEffect(() => {
    async function fetchCategories() {
      void getCategories().then((res) => {
        if (res.code === 200) {
          setCategories(res.data)
        }
      })
    }
    void fetchCategories()
  }, [])

  const CommonComponent = () => {
    return (
      <>
        <p className="text-title-2-demi text-tertiary">Categories</p>
        <Accordion type="single" collapsible className="my-1.5">
          {categories?.map((category: Category, index: number) => {
            return (
              <div key={index}>
                <AccordionItem value={category.category} className="border-none">
                  <AccordionTrigger className="p-0 py-1.5">
                    <p className="line-clamp-1 text-left text-title-2-demi">{category.category}</p>
                  </AccordionTrigger>
                  {category.communities.map((item: Community, index: number) => (
                    <AccordionContent key={index} className="p-0">
                      <Link href={PATH_NAME.community(item.handle)}>
                        <div className="flex items-center gap-3 px-3 py-1.5 hover:bg-monochrome-6/10">
                          <CustomAvatar
                            className="h-8 w-8 bg-red-40"
                            imageUrl={item.dp ?? ''}
                            fallbackString={item.name ?? ''}
                            isAvatar={false}
                          />
                          <p className="text-title-2-demi">{item.name}</p>
                        </div>
                      </Link>
                    </AccordionContent>
                  ))}
                </AccordionItem>
              </div>
            )
          })}
        </Accordion>
      </>
    )
  }

  if (!categories || categories.length === 0) return

  return (
    <>
      <div className="hidden lg:block">
        <CommonComponent />
      </div>
      <div className="lg:hidden">
        <CommonComponent />
      </div>
    </>
  )
}
