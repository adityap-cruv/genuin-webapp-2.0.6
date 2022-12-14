import { useMemo, useRef, useState } from "react";
import axios from "axios";
import { Question } from "../../components/question";
import { Layout } from "../../components/layout";
import { Error } from "../../components/error";
import { SEO } from "../../components/seo";
import { GetAppModal } from "../../components/getAppModal";
import { TopNav } from "../../components/topNav";
import { appStoreLink } from "../../config";

const QuestionWrapper = ({
  question_id,
  question,
  preview_image,
  share_url,
  owner,
}) => {
  const [showModalAppDownload, setShowModalAppDownload] = useState(false);
  const getAppComponentRef = useRef(() => null);
  const handleCloseAppDownload = () => {
    getAppComponentRef.current = () => null;
    setShowModalAppDownload(false);
  };
  const handleShowModalAppDownload = (message = () => null) => {
    getAppComponentRef.current = message;
    setShowModalAppDownload(true);
  };

  const _question = useMemo(() => {
    return Boolean(question) ? "Question on Genuin: " + question : question;
  }, [question]);

  const askedBy = useMemo(
    () =>
      Boolean(owner?.nickname)
        ? ` asked by @${owner?.nickname}`
        : owner?.nickname,
    [owner?.nickname]
  );
  const openGraphDescription = useMemo(
    () =>
      Boolean(askedBy)
        ? `Answer this trending question on Genuin${askedBy}`
        : `Answer this trending question on Genuin`,
    [askedBy]
  );
  const description = useMemo(
    () =>
    Boolean(owner?.nickname)
        ? `{Asked by ${owner && owner.name.replace(/\s+/g, '') != ""?`[${owner?.name.trim()}] `: ''}(@${owner?.nickname})} ${owner.bio.replace(/\s+/g, '') != ""?"| "+owner.bio.replace(/\n+/g, '\n').replace(/\s+\n+\s+|\s+\n+|\n+\s+|\n+/g, ' '):""}`
        : `{Answer this trending Web3 question on Genuin}`
  );
  const title = `Answer '${question}' on Genuin | Reach billions of people with your expert advice.`

  const showGetAppToViewDialog = () =>
    handleShowModalAppDownload(() => <>Get the app to view this video.</>);

  const ORG_SCHEMA = JSON.stringify({
    "@context": "http://schema.org",
    "@type": "WebPage",
    id: `${share_url}`,
    url: `${share_url}`,
    name: `${title}`,
    isPartOf: `${process.env.genuinurl}#website`,
    image: `${preview_image}/#primaryimage`,
    thumbnailUrl: `${preview_image}`,
    description: `${description}`,
    inLanguage: "en-US",
    potentialAction: [
      {
        "@type": "WatchAction",
        target: `${share_url}`,
        image: `${preview_image}`
      },
    ],
  });

  return Boolean(question_id) ? (
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

      <TopNav showGetAppModal={showGetAppToViewDialog} />
      <Question previewImage={preview_image} />
      <GetAppModal
        show={showModalAppDownload}
        onClose={handleCloseAppDownload}
        TextNode={getAppComponentRef.current}
      />
    </Layout>
  ) : (
    <Error />
  );
};
QuestionWrapper.getInitialProps = async ({ query: { share_string } }) => {
  if (
    share_string !== undefined &&
    share_string !== null &&
    share_string !== ""
  ) {
    var url_to_use = `${process.env.apiurl}/api/v3/qt/web?question_id=${share_string}`;
    return axios
      .get(url_to_use)
      .then((response) => {
        return Promise.resolve(response?.data?.data ?? {});
      })
      .catch((err) => {
        return Promise.resolve({});
      });
  } else {
    return Promise.resolve({});
  }
};
export default QuestionWrapper;
