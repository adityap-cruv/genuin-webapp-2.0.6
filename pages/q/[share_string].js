import React, { useMemo, useRef, useState } from 'react'
import axios from 'axios'
import { Question } from '../../components/basic/question'
import { Layout } from '../../components/layout/layout'
import { Error } from '../../components/basic/error'
import { SEO } from '../../components/basic/seo'
import { GetAppModal } from '../../components/basic/get_app_modal'
import { TopNav } from '../../components/navbar/top_nav'

const QuestionWrapper = ({
  question_id,
  question,
  preview_image,
  share_url,
  owner
}) => {
  const [showModalAppDownload, setShowModalAppDownload] = useState(false)
  const getAppComponentRef = useRef(() => null)
  const handleCloseAppDownload = () => {
    getAppComponentRef.current = () => null
    setShowModalAppDownload(false)
  }
  const handleShowModalAppDownload = (message = () => null) => {
    getAppComponentRef.current = message
    setShowModalAppDownload(true)
  }

  const _question = useMemo(() => {
    return question ? 'Question on Genuin: ' + question : question
  }, [question])

  const askedBy = useMemo(
    () =>
      owner?.nickname
        ? ` asked by @${owner?.nickname}`
        : owner?.nickname,
    [owner?.nickname]
  )
  const openGraphDescription = useMemo(
    () =>
      askedBy
        ? `Answer this trending question on Genuin${askedBy}`
        : 'Answer this trending question on Genuin',
    [askedBy]
  )
  const bio_val = owner && owner?.nickname && owner.bio.replace(/\s+/g, '') !== '' ? ' ' + owner.bio.replace(/\n+/g, '\n').replace(/\s+\n+\s+|\s+\n+|\n+\s+|\n+/g, ' ') : ''
  const tags_val = owner && owner?.nickname && owner.hashtags && owner.hashtags !== [] && owner.hashtags.length > 0 ? ' ' + owner.hashtags.map((tag) => '#' + tag).join(' ') : ''
  const pipe_val = bio_val || tags_val ? ' |' : ''
  const description = useMemo(
    () =>
      owner?.nickname
        ? `{Asked by ${owner && owner.name.replace(/\s+/g, '') !== '' ? `[${owner?.name.trim()}] ` : ''}(@${owner?.nickname})}${pipe_val}${bio_val}${tags_val}`
        : '{Answer this trending Web3 question on Genuin}'
  )
  const title = `Answer '${question}' on Genuin | Reach billions of people with your expert advice.`

  const showGetAppToViewDialog = () =>
    handleShowModalAppDownload(() => <>Get the app to view this video.</>)

  const ORG_SCHEMA = JSON.stringify({
    '@context': 'http://schema.org',
    '@type': 'WebPage',
    id: `${share_url}`,
    url: `${share_url}`,
    name: `${title}`,
    isPartOf: `${process.env.hostname}#website`,
    image: `${preview_image}/#primaryimage`,
    thumbnailUrl: `${preview_image}`,
    description: `${description}`,
    inLanguage: 'en-US',
    potentialAction: [
      {
        '@type': 'WatchAction',
        target: `${share_url}`,
        image: `${preview_image}`
      }
    ]
  })
  return question_id ? (
    <Layout>
      <SEO
        description={description}
        openGraphDescription={openGraphDescription}
        title={title}
        openGraphType='object'
        openGraphTitle={_question}
        metaImageWidth={1084}
        metaImageHeight={546}
        urlToCopy={share_url}
        videoPreviewImage={preview_image}
      />

      <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: ORG_SCHEMA }}/>

      <TopNav showGetAppModal={showGetAppToViewDialog} backgroundColor='transparent'/>
      <Question previewImage={preview_image} />
      <GetAppModal
        show={showModalAppDownload}
        onClose={handleCloseAppDownload}
        TextNode={getAppComponentRef.current}
      />
    </Layout>
  ) : (
    <Error />
  )
}
QuestionWrapper.getInitialProps = async ({ query: { share_string } }) => {
  if (
    share_string !== undefined &&
    share_string !== null &&
    share_string !== ''
  ) {
    const url_to_use = `${process.env.apiurl}/api/v3/public/qt?question_id=${share_string}`
    return axios
      .get(url_to_use)
      .then((response) => {
        return Promise.resolve({ ...response?.data?.data } ?? {})
      })
      .catch((_err) => {
        return Promise.resolve({})
      })
  }
  return Promise.resolve({})
}
export default QuestionWrapper
