import React from 'react';

export default function SuccessSpinner() {
  return (
    <>
      <style>{`
        .vivospinner {
          color: hsl(126, 90%, 24%);
          overflow: visible;
          margin: auto;
          width: 5em;
          height: auto;
          transition: color 0.3s;
        }

        .vivospinner circle,
        .vivospinner g,
        .vivospinner path {
          animation-duration: 3s;
          animation-timing-function: linear;
          animation-fill-mode: forwards;
        }

        .vivospinner__check,
        .vivospinner__pop-start,
        .vivospinner__worm {
          transform-origin: 24px 24px;
        }

        .vivospinner__check {
          animation-name: vivospinner-check;
        }

        .vivospinner__pop-dot {
          animation-name: vivospinner-pop-dot;
        }

        .vivospinner__pop-dot-group {
          animation-name: vivospinner-pop-dot-group1;
        }

        .vivospinner__pop-dot-group + .vivospinner__pop-dot-group {
          animation-name: vivospinner-pop-dot-group2;
        }

        .vivospinner__pop-end {
          animation-name: vivospinner-pop-end;
        }

        .vivospinner__pop-start {
          animation-name: vivospinner-pop-start;
        }

        .vivospinner__worm {
          animation-name: vivospinner-worm;
        }

        .dark-theme-spinner {
          color: hsl(126, 90%, 50%);
        }

        @keyframes vivospinner-check {
          from, 64% {
            stroke-dashoffset: -36.7;
            transform: scale(1);
          }
          75%, 77% {
            animation-timing-function: cubic-bezier(0.65,0,0.35,1);
            stroke-dashoffset: 13.7;
            transform: scale(1);
          }
          79% {
            animation-timing-function: cubic-bezier(0.65,0,0.35,1);
            stroke-dashoffset: 13.7;
            transform: scale(0.4);
          }
          87% {
            animation-timing-function: cubic-bezier(0.32,0,0.67,0);
            stroke-dashoffset: 13.7;
            transform: scale(1.4);
          }
          93%, to {
            stroke-dashoffset: 13.7;
            transform: scale(1);
          }
        }

        @keyframes vivospinner-pop-dot {
          from, 80% {
            animation-timing-function: cubic-bezier(0.33,1,0.68,1);
            transform: translate(0,6px);
          }
          90%, to {
            transform: translate(0,0);
          }
        }

        @keyframes vivospinner-pop-dot-group1 {
          from, 82.5%, 90%, to {
            opacity: 0;
          }
          85%, 87.5% {
            opacity: 1;
          }
        }

        @keyframes vivospinner-pop-dot-group2 {
          from, 82.5%, to {
            opacity: 0;
          }
          85%, 90% {
            opacity: 1;
          }
        }

        @keyframes vivospinner-pop-end {
          from {
            animation-timing-function: steps(1,end);
            opacity: 0;
            r: 18px;
            stroke-width: 4px;
          }
          82.5% {
            animation-timing-function: linear;
            opacity: 1;
            r: 18px;
            stroke-width: 4px;
          }
          84%, to {
            opacity: 0;
            r: 19px;
            stroke-width: 3px;
          }
        }

        @keyframes vivospinner-pop-start {
          from {
            animation-timing-function: steps(1,end);
            opacity: 0;
            transform: scale(0.35);
          }
          76% {
            animation-timing-function: cubic-bezier(0.65,0,0.35,1);
            opacity: 1;
            transform: scale(0.35);
          }
          82.5% {
            animation-timing-function: steps(1,start);
            opacity: 1;
            transform: scale(1);
          }
          to {
            opacity: 0;
            transform: scale(1);
          }
        }

        @keyframes vivospinner-worm {
          from {
            stroke-dashoffset: -51.84;
            transform: rotate(-119deg);
          }
          60% {
            stroke-dashoffset: -51.84;
            transform: rotate(961deg);
          }
          64% {
            animation-timing-function: cubic-bezier(0.61,1,0.88,1);
            stroke-dashoffset: -51.84;
            transform: rotate(1033deg);
          }
          72.5%, to {
            stroke-dashoffset: -138.23;
            transform: rotate(1033deg);
          }
        }
      `}</style>

      <svg className="vivospinner" viewBox="0 0 48 48" role="img" aria-label="A partial ring that rotates and then is shaped as a checkmark">
        <g fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="4">
          <circle className="vivospinner__worm" cx="24" cy="24" r="22" strokeDasharray="138.23 138.23" strokeDashoffset="-51.84" transform="rotate(-119)" />
          <circle className="vivospinner__pop-end" stroke="hsl(105,40%,70%)" cx="24" cy="24" r="18" opacity="0" />
          <g fill="currentColor" stroke="none">
            <circle className="vivospinner__pop-start" fill="hsl(105,40%,70%)" cx="24" cy="24" r="20" opacity="0" />
            <g>
              <g className="vivospinner__pop-dot-group" opacity="0">
                <circle className="vivospinner__pop-dot" fill="hsl(240,90%,70%)" cx="22" cy="5" r="1.5" />
              </g>
              <g className="vivospinner__pop-dot-group" opacity="0">
                <circle className="vivospinner__pop-dot" fill="hsl(210,90%,70%)" cx="26" cy="2" r="1.5" />
              </g>
            </g>
            <g transform="rotate(51.43,24,24)">
              <g className="vivospinner__pop-dot-group" opacity="0">
                <circle className="vivospinner__pop-dot" fill="hsl(15,90%,70%)" cx="22" cy="5" r="1.5" />
              </g>
              <g className="vivospinner__pop-dot-group" opacity="0">
                <circle className="vivospinner__pop-dot" fill="hsl(300,90%,70%)" cx="26" cy="2" r="1.5" />
              </g>
            </g>
            <g transform="rotate(102.86,24,24)">
              <g className="vivospinner__pop-dot-group" opacity="0">
                <circle className="vivospinner__pop-dot" fill="hsl(105,40%,70%)" cx="22" cy="5" r="1.5" />
              </g>
              <g className="vivospinner__pop-dot-group" opacity="0">
                <circle className="vivospinner__pop-dot" fill="hsl(150,40%,70%)" cx="26" cy="2" r="1.5" />
              </g>
            </g>
            <g transform="rotate(154.29,24,24)">
              <g className="vivospinner__pop-dot-group" opacity="0">
                <circle className="vivospinner__pop-dot" fill="hsl(270,90%,70%)" cx="22" cy="5" r="1.5" />
              </g>
              <g className="vivospinner__pop-dot-group" opacity="0">
                <circle className="vivospinner__pop-dot" fill="hsl(300,90%,70%)" cx="26" cy="2" r="1.5" />
              </g>
            </g>
            <g transform="rotate(205.71,24,24)">
              <g className="vivospinner__pop-dot-group" opacity="0">
                <circle className="vivospinner__pop-dot" fill="hsl(150,40%,70%)" cx="22" cy="5" r="1.5" />
              </g>
              <g className="vivospinner__pop-dot-group" opacity="0">
                <circle className="vivospinner__pop-dot" fill="hsl(210,90%,70%)" cx="26" cy="2" r="1.5" />
              </g>
            </g>
            <g transform="rotate(257.14,24,24)">
              <g className="vivospinner__pop-dot-group" opacity="0">
                <circle className="vivospinner__pop-dot" fill="hsl(240,90%,70%)" cx="22" cy="5" r="1.5" />
              </g>
              <g className="vivospinner__pop-dot-group" opacity="0">
                <circle className="vivospinner__pop-dot" fill="hsl(210,90%,70%)" cx="26" cy="2" r="1.5" />
              </g>
            </g>
            <g transform="rotate(308.57,24,24)">
              <g className="vivospinner__pop-dot-group" opacity="0">
                <circle className="vivospinner__pop-dot" fill="hsl(270,90%,70%)" cx="22" cy="5" r="1.5" />
              </g>
              <g className="vivospinner__pop-dot-group" opacity="0">
                <circle className="vivospinner__pop-dot" fill="hsl(150,40%,70%)" cx="26" cy="2" r="1.5" />
              </g>
            </g>
          </g>
          <path className="vivospinner__check" d="M 17 25 L 22 30 C 22 30 32.2 19.8 37.3 14.7 C 41.8 10.2 39 7.9 39 7.9" strokeDasharray="36.7 36.7" strokeDashoffset="-36.7" />
        </g>
      </svg>
    </>
  );
}
