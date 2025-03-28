import { ChevronRightIcon } from 'lucide-react'
import { type BlogSectionType } from '../../../../../types/embed/embed-blog'
import MultiEmbed from '../multi-embed'
import { type EmbedConfigsType } from '@/hooks/use-embed-details'
import { TwitterIcon } from '@images/embed/social-icons/twitter-icon'
import { LinkedInIcon } from '@images/embed/social-icons/linkedin-icon'

const BlogsSection = ({
  blogSection,
  embedConfigs,
}: {
  blogSection: BlogSectionType
  embedConfigs: EmbedConfigsType
}) => {
  return (
    <section className="py-10 md:pb-20">
      <div className="flex w-full flex-col md:flex-row md:gap-14">
        {/* Main Content */}
        <div className="flex flex-col gap-6 md:w-3/5">
          <img src={blogSection?.image} alt="blog-image" className="h-auto w-full" />

          <div className="flex flex-col gap-4">
            <p className="text-title-1-bold">{blogSection?.blogContent[0].title}</p>
            <p className="text-body-1-med md:text-title-3-med">{blogSection?.blogContent[0].description}</p>
          </div>

          <MultiEmbed
            dataEmbedId={embedConfigs['Home/Blog Embed'].embedId}
            dataEmbedApiKey={embedConfigs['Home/Blog Embed'].embedApiKey}
            style={{
              height: '400px',
              width: '100%',
              zIndex: 20,
            }}
          />

          {blogSection?.blogContent.slice(1).map((item, index) => (
            <div className="flex flex-col gap-4" key={index}>
              <p className="text-title-1-bold">{item.title}</p>
              <p className="text-body-1-med md:text-title-3-med">{item.description}</p>
            </div>
          ))}
        </div>

        {/* Sidebar Content */}
        <div className="flex flex-col gap-6 md:w-2/5">
          <MultiEmbed
            dataEmbedId={embedConfigs['Blog Embed'].embedId}
            dataEmbedApiKey={embedConfigs['Blog Embed'].embedApiKey}
            style={{
              height: '615px',
              width: '350px',
            }}
          />

          <p className="px-10 py-4 text-title-2-bold md:p-5 md:text-title-1-bold">Popular</p>

          {blogSection?.popularBlogs.map((item, index) => (
            <div className="flex flex-col gap-5 px-10 py-4 md:p-5" key={index}>
              <p className="flex items-center justify-between gap-4">
                <span className="text-title-2-demi md:text-title-3-demi">{item.blog}</span>
                <ChevronRightIcon />
              </p>
              <p className="text-body-1-med text-secondary-400">{item.videos}</p>
            </div>
          ))}

          <div className="flex flex-col gap-3 rounded-xl bg-primary p-5">
            <p className="text-body-1-med text-monochrome-white md:text-title-3-med">Share with your community!</p>
            <div className="flex items-center gap-3">
              <LinkedInIcon className="fill-monochrome-white" variant="light" />
              <TwitterIcon className="fill-monochrome-white" variant="light" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default BlogsSection
