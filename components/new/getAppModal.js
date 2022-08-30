import { Modal, Image, Button } from 'react-bootstrap';
const logo_icon = require('../../images/Genuin_icon_vector.svg');

export const GetAppModal = ({ show, onClose, getAppLink }) => (
  <Modal
    key='app'
    show={show}
    onHide={onClose}
    centered
    className='modal-app-download'
  >
    <Modal.Header closeButton className='border-0'></Modal.Header>
    <Modal.Body className='text-center py-0'>
      <Image src={logo_icon} alt='Genuin' title='Genuin' className='mb-4' />
      <h5 className='mb-0'>
        Get the app to <strong>save this video</strong>
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
