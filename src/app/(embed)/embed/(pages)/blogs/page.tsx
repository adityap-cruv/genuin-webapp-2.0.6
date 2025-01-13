import BlogsSection from '@/components/common/embed/blogs/blogs-section'
import EmbedNav from '@/components/common/embed/embed-nav'
import EmbedFooter from '@/components/common/embed/embed-footer'
import { EmbedBlog } from '@/content/embed/embed-blog'

export default async function Page() {
  const blogData = EmbedBlog.find((item) => item.food)?.food

  return (
    <div className="w-full overflow-scroll px-4 md:px-0">
      <EmbedNav />
      <BlogsSection blogSection={blogData?.blogSection} />
      <EmbedFooter />
    </div>
  )
}
