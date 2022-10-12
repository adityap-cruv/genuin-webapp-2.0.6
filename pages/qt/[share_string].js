import { useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { Question } from '../../components/question';
import { Layout } from '../../components/layout';
import { Error } from '../../components/error';
import { SEO } from '../../components/seo';
import { GetAppModal } from '../../components/getAppModal';
import { TopNav } from '../../components/topNav';
import { appStoreLink } from '../../config';

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
    return Boolean(question) ? 'Question on Genuin: ' + question : question;
  }, [question]);

  const askedBy = useMemo(
    () =>
      Boolean(owner?.nickname)
        ? ` asked by @${owner?.nickname}`
        : owner?.nickname,
    [owner?.nickname]
  );
  const description = useMemo(
    () =>
      Boolean(askedBy)
        ? `Answer this trending question on Genuin${askedBy}`
        : `Answer this trending question on Genuin`,
    [askedBy]
  );

  const showGetAppToViewDialog = () =>
    handleShowModalAppDownload(() => <>Get the app to view this video.</>);

  return Boolean(question_id) ? (
    <Layout>
      <SEO
        description={description}
        title={_question}
        openGraphType='object'
        openGraphTitle={_question}
        metaImageWidth={1084}
        metaImageHeight={546}
        urlToCopy={share_url}
        videoPreviewImage={preview_image}
      />
      <TopNav showGetAppModal={showGetAppToViewDialog} />
      <Question previewImage={preview_image} />
      <GetAppModal
        show={showModalAppDownload}
        onClose={handleCloseAppDownload}
        TextNode={getAppComponentRef.current}
        getAppLink={appStoreLink}
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
    share_string !== ''
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
