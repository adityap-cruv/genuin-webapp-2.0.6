import mobileFrame  from "../images/mobile_frame.png"

export const HomePageVideo = () => {
   return (
      <div
      style={{
         width: 380,
         heigth: 770
         }}>
         <img
            src={mobileFrame.src}
            alt='Learn Web3 via bite-sized content'
            title='Learn Web3 via bite-sized content'
            className='img-carousel mx-auto d-block'
         />
      </div>);
}