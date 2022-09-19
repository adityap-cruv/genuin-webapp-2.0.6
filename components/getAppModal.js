import { Modal, Image, Button } from 'react-bootstrap';
import logo from '../images/Genuin_icon_vector.svg';

export const GetAppModal = ({
  show,
  onClose,
  TextNode = () => null,
  getAppLink,
}) => {
  return (
    <Modal
      key='app'
      show={show}
      onHide={onClose}
      centered
      className='modal-app-download'
    >
      <Modal.Header closeButton className='border-0'></Modal.Header>
      <Modal.Body className='text-center py-0'>
        <Image src={logo.src} alt='Genuin' title='Genuin' className='mb-4' />
        <h5 className='mb-0'>
          {typeof TextNode === 'function' ? <TextNode /> : null}
        </h5>
      </Modal.Body>
      <Modal.Footer className='justify-content-center border-0'>
        <Button
          variant='primary'
          onClick={onClose}
          className='border-0 btn-get-app'
        >
          Get App
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
