import {
  Text,
  VStack,
  Image,
  Flex,
  useBreakpointValue,
} from "@chakra-ui/react";
import { Modal } from "react-bootstrap";
import logo from "../images/Genuin_icon_vector.svg";
import { InstallApp } from "./installApp";

export const GetAppModal = ({ show, onClose, TextNode = () => null }) => {
  const mobile = useBreakpointValue({ base: true, sm: false });

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
        <VStack px={mobile ? 8 : 16}>
          <Image src={logo.src} alt='Genuin' title='Genuin' h={16} />
          <Text fontWeight={700} fontSize={40}>
            Download App
          </Text>
          <Text fontSize={20} fontWeight={600}>
            {typeof TextNode === "function" ? <TextNode /> : null}
          </Text>
        </VStack>
      </Modal.Body>
      <Modal.Footer className='justify-content-center border-0 py-10'>
        <Flex pb={8}>
          <InstallApp small onClick={onClose} />
        </Flex>
      </Modal.Footer>
    </Modal>
  );
};
