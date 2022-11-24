import { Container, Row, Col } from "react-bootstrap";
import { TopNav } from "./topNav";
import { Layout } from "./layout";
import { InstallApp } from "./installApp";

export const Error = ({ homePageUrl = "/" }) => {
  return (
    <Layout>
      <section className='w-100 h-100 bg-gradient-blue d-flex align-items-center'>
        <TopNav isContiner isError variant='light' />
        <Container>
          <Row className='mb-5'>
            <Col
              xs={12}
              lg={10}
              className='d-flex align-items-center justify-content-center mx-auto text-center text-white flex-column'
            >
              <h2 className='fw-bold mb-4 h1'>
                Sorry, this page isn't available.
              </h2>
              <p className='fs-3'>
                The link you followed may be broken, or the page may have been
                removed. Go to <a href={homePageUrl ?? ""}>Genuin Home Page.</a>
              </p>
            </Col>
          </Row>
          <Row xs={2} className='justify-content-center'>
            <InstallApp />
          </Row>
        </Container>
      </section>
    </Layout>
  );
};
