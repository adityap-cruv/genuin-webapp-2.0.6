'use client'
import BlogsSection from '@/components/common/embed/blogs/blogs-section'
import EmbedNav from '@/components/common/embed/embed-nav'
import EmbedFooter from '@/components/common/embed/embed-footer'
import { EmbedBlog } from '@/content/embed/embed-blog'
import { getDataForIndustry } from '@/lib/utils'
import { useEmbedConfig } from '@/components/embed/embed-config-provider'
import { useShallow } from 'zustand/react/shallow'
import { useEmbedSetup } from '@/hooks/use-embed-details'

export default function Page() {
  const { config } = useEmbedConfig(
    useShallow((state) => ({
      config: state.config,
    }))
  )
  const blogData = getDataForIndustry(config, EmbedBlog)
  const { embedConfigs } = useEmbedSetup({ config })

  return (
    <div className="w-full overflow-scroll px-5">
      <EmbedNav />
      <BlogsSection blogSection={blogData?.blogSection} embedConfigs={embedConfigs} />
      <EmbedFooter />
    </div>
  )
}
