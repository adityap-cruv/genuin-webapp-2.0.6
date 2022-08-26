import * as React from "react";
import { useState } from "react";
import { Image, Navbar, Nav, Button, Modal } from "react-bootstrap";

const logo = require("../../../images/logo_header_new.svg");
const logo_icon = require("../../../images/Genuin_icon_vector.svg");

export const TopNav = () => {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <Navbar bg="gradient" expand={false} className="p-3">
      <Navbar.Brand href="/" className="p-0">
        <Image src={logo} alt="Genuin" title="Genuin" />
      </Navbar.Brand>
      <div className="d-flex align-items-center justify-content-center">
        <Button variant="primary" className="me-3" onClick={handleShow}>
          Get App
        </Button>
        <Navbar.Toggle aria-controls="navbarMoreOptionDrawer" />
        <Navbar.Collapse id="navbarMoreOptionDrawer">
          <Nav>
            <Navbar.Toggle aria-controls="navbarMoreOptionDrawer" />
            <Nav.Link href="#InvestInGenuin">Invest in Genuin</Nav.Link>
            <Nav.Link href="#JoinUs">Join us</Nav.Link>
            <Nav.Link href="#TermsOfService">Terms of Service</Nav.Link>
            <Nav.Link href="#PrivacyPolicy">Privacy Policy</Nav.Link>
            <Nav.Link href="/" className="text-primary small mt-auto">
              &copy; 2022 Genuin Inc.
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </div>
      <Modal
        show={show}
        onHide={handleClose}
        centered
        className="modal-app-download"
      >
        <Modal.Header closeButton className="border-0"></Modal.Header>
        <Modal.Body className="text-center py-0">
          <Image src={logo_icon} alt="Genuin" title="Genuin" className="mb-4" />
          <h5 className="mb-0">
            Get the app to <strong>save this video</strong>
          </h5>
        </Modal.Body>
        <Modal.Footer className="justify-content-center border-0">
          <Button
            variant="primary"
            onClick={handleClose}
            className="border-0 btn-get-app"
          >
            Get App
          </Button>
        </Modal.Footer>
      </Modal>
    </Navbar>
  );
};
