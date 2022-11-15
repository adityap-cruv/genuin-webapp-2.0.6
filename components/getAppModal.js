import { Flex, VStack } from "@chakra-ui/react";
import { Modal, Image, Button } from "react-bootstrap";
import logo from "../images/Genuin_icon_vector.svg";

export const GetAppModal = ({
  show,
  onClose,
  TextNode = () => null,
  getAppLink,
}) => {
  const onCloseWrapper = () => {
    window.open(getAppLink, "_blank");
    onClose();
  };
  return (
    <Modal
      key='app'
      show={show}
      onHide={onClose}
      centered
      className='modal-app-download'
      style={{
        zIndex: 10000,
      }}
    >
      <Modal.Header closeButton className='border-0'></Modal.Header>
      <Modal.Body className='text-center py-0'>
        <VStack>
          <Image src={logo.src} alt='Genuin' title='Genuin' className='mb-4' />
          <h5 className='mb-0'>
            {typeof TextNode === "function" ? <TextNode /> : null}
          </h5>
        </VStack>
      </Modal.Body>
      <Modal.Footer className='justify-content-center border-0'>
        <Button
          variant='primary'
          onClick={onCloseWrapper}
          className='border-0 btn-get-app'
        >
          Get App
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
