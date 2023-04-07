import { Spinner } from "@chakra-ui/react";

export const GenuinLoader = ({
   height="100%"
}) => {
   return (<>
      <div
         style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: height
         }}>
         <Spinner
            thickness='4px'
            speed='1s'
            emptyColor='blue'
            color='white'
            size='lg' />
      </div>
   </>)
}