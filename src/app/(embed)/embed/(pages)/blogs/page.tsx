'use client'
import BlogsSection from '@/components/common/embed/blogs/blogs-section'
import EmbedNav from '@/components/common/embed/embed-nav'
import EmbedFooter from '@/components/common/embed/embed-footer'
import { EmbedBlog } from '@/content/embed/embed-blog'
import { getIndustryName } from '@/lib/utils'
import { useEmbedConfig } from '@/components/embed/embed-config-provider'
import { useShallow } from 'zustand/react/shallow'

export default async function Page() {
  const { config } = useEmbedConfig(
    useShallow((state) => ({
      config: state.config,
    }))
  )
  const industryName = getIndustryName(config?.industry_type)
  const blogData = (EmbedBlog.find((item: any) => item[industryName]) as any)?.[industryName]

  return (
    <div className="w-full overflow-scroll px-4 md:px-0">
      <EmbedNav />
      <BlogsSection blogSection={blogData?.blogSection} />
      <EmbedFooter />
    </div>
  )
}
