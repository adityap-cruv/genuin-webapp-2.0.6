import { Image, Navbar, Button } from "react-bootstrap";
import { handleHireLinkClick } from "../actions/appInstall";
import logo from "../images/logo_header_new.svg";
import logoBlue from "../images/logo_header_new_blue.svg";

export const HomeNav = ({
   showGetAppModal,
   isContiner = false,
   isBlue = false,
   variant = "dark",
}) => {

   return (
      <Navbar
         {...(isContiner ? { className: "p-3 container" } : { className: "p-3" })}
         expand={false}
         fixed='top'
         onToggle={(isOpen) => setIsOpen(isOpen)}
         style={{
            background: variant === "light" ? "transparent" : "white",
         }}
         variant={variant}
      >
         <Navbar.Brand href='/' className='p-0'>
            <Image
               src={isBlue ? logoBlue.src : logo.src}
               alt='Genuin'
               title='Genuin'
            />
         </Navbar.Brand>
         <div className='d-flex align-items-center justify-content-center'>
            <Button
               variant='primary'
               className='me-3'
               onClick={handleHireLinkClick}
               style={{
                  fontSize: 22,
               }}
            >
               Join us
            </Button>
         </div>
      </Navbar>
   );
};
