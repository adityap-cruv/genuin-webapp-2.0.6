import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css';

export const Layout = ({ children }) => (
  <div className='layout'>
    <style jsx>{`
      @font-face {
        font-family: 'AvenirNext';
        src: url('/fonts/AvenirNext-Bold-01.ttf');
        src: url('/fonts/AvenirNext-BoldItalic-02.ttf');
        src: url('/fonts/AvenirNext-DemiBold-03.ttf');
        src: url('/fonts/AvenirNext-DemiBoldItalic-04.ttf');
        src: url('/fonts/AvenirNext-Heavy-09.ttf');
        src: url('/fonts/AvenirNext-HeavyItalic-10.ttf');
        src: url('/fonts/AvenirNext-Italic-05.ttf');
        src: url('/fonts/AvenirNext-Medium-06.ttf');
        src: url('/fonts/AvenirNext-MediumItalic-07.ttf');
        src: url('/fonts/AvenirNext-Regular-08.ttf');
        src: url('/fonts/AvenirNext-UltraLight-11.ttf');
        src: url('/fonts/AvenirNext-UltraLightItalic-12.ttf');
      }
      @font-face {
        font-family: 'AvenirNext-DemiBold';
        src: url('/fonts/AvenirNext-DemiBold-03.ttf');
      }
      @font-face {
        font-family: 'AvenirNext-Bold';
        src: url('/fonts/AvenirNext-Bold-01.ttf');
      }
    `}</style>
    {children}
  </div>
);
