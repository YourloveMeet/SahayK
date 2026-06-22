'use client'

import React from 'react'

export const DominosLoader = () => {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="spinner-dominos">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        /* From Uiverse.io by satyamchaudharydev */ 
        .spinner-dominos {
          position: relative;
          width: 60px;
          height: 60px;
          display: flex;
          justify-content: center;
          align-items: center;
          border-radius: 50%;
          margin-left: -75px;
        }

        .spinner-dominos span {
          position: absolute;
          top: 50%;
          left: var(--left);
          width: 35px;
          height: 7px;
          background: #ffff;
          animation: dominos 1s ease infinite;
          box-shadow: 2px 2px 3px 0px rgba(0,0,0,0.2);
        }

        .spinner-dominos span:nth-child(1) {
          --left: 80px;
          animation-delay: 0.125s;
        }

        .spinner-dominos span:nth-child(2) {
          --left: 70px;
          animation-delay: 0.3s;
        }

        .spinner-dominos span:nth-child(3) {
          --left: 60px;
          animation-delay: 0.425s;
        }

        .spinner-dominos span:nth-child(4) {
          animation-delay: 0.54s;
          --left: 50px;
        }

        .spinner-dominos span:nth-child(5) {
          animation-delay: 0.665s;
          --left: 40px;
        }

        .spinner-dominos span:nth-child(6) {
          animation-delay: 0.79s;
          --left: 30px;
        }

        .spinner-dominos span:nth-child(7) {
          animation-delay: 0.915s;
          --left: 20px;
        }

        .spinner-dominos span:nth-child(8) {
          --left: 10px;
        }

        @keyframes dominos {
          50% {
            opacity: 0.7;
          }

          75% {
            -webkit-transform: rotate(90deg);
            transform: rotate(90deg);
          }

          80% {
            opacity: 1;
          }
        }
      `}} />
    </div>
  );
};

export const FalconLoader = () => {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="spinner-falcon">
        <div className="spinner1-falcon"></div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        /* From Uiverse.io by xXJollyHAKERXx */ 
        .spinner-falcon {
          background-image: linear-gradient(#ffffff 35%, #71717a);
          width: 100px;
          height: 100px;
          animation: spinning82341 1.7s linear infinite;
          text-align: center;
          border-radius: 50px;
          filter: blur(1px);
          box-shadow: 0px -5px 20px 0px rgba(255, 255, 255, 0.5), 0px 5px 20px 0px rgba(113, 113, 122, 0.5);
        }

        .spinner1-falcon {
          background-color: var(--background, #0A0A0A);
          width: 100px;
          height: 100px;
          border-radius: 50px;
          filter: blur(10px);
        }

        @keyframes spinning82341 {
          to {
            transform: rotate(360deg);
          }
        }
      `}} />
    </div>
  );
};
