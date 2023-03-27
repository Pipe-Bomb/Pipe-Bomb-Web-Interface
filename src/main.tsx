import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import "./styles/App.scss";
import { NextUIProvider, createTheme, Text } from '@nextui-org/react';
import { BrowserRouter } from "react-router-dom";

const dark = createTheme({
  type: "dark",
  theme: {
    colors: {
      primaryLight: '#8bd5ca',
      primaryLightHover: '#8bd5ca',
      primaryLightActive: '#8bd5ca',
      primaryLightContrast: '#8bd5ca',
      primaryAlpha: '#cad3f5',
      primary: '#8bd5ca',
      primaryBorder: '#8bd5ca',
      primaryBorderHover: '#8bd5ca',
      primarySolidHover: '#8bd5ca',
      primarySolidContrast: '$white',
      primaryShadow: '#89b4fa',

      gradient: 'linear-gradient(112deg, #8bd5ca -25%, #91d7e3 -10%, #8bd5ca 80%)',
      link: '#b8c0e0',

      sidebarUnselectedText: "#a5adcb",
      waitingBackground: "#181825",
      backgroundSecondary: "#181825",
      background: "#11111b",
      backgroundContrast: "#181825",
    },
    space: {},
    fonts: {
      sans: "'Manrope', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif"
    }
  }
});

// const midnight = createTheme({
//   type: "dark",
//   theme: {
//     colors: {
//       primaryLight: '$green200',
//       primaryLightHover: '$green300',
//       primaryLightActive: '$green400',
//       primaryLightContrast: '$green600',
//       primaryAlpha: 'rgba(74, 222, 123, 0.2)',
//       primary: '#4ADE7B',
//       primaryBorder: '$green500',
//       primaryBorderHover: '$green600',
//       primarySolidHover: '$green700',
//       primarySolidContrast: '$white',
//       primaryShadow: '$green500',

//       gradient: 'linear-gradient(112deg, $blue100 -25%, $pink500 -10%, $purple500 80%)',
//       link: '#5E1DAD',

//       sidebarUnselectedText: "$gray800",
//       waitingBackground: "$gray300",
//       backgroundSecondary: "#121414"
//     },
//     space: {},
//     fonts: {
//       sans: "'Manrope', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif"
//     }
//   }
// });

// const pink = createTheme({
//   type: "dark",
//   theme: {
//     colors: {
//       primaryLight: '#FEC5E5',
//       primaryLightHover: '#FEC5E5',
//       primaryLightActive: '#FEC5E5',
//       primaryLightContrast: '#FEC5E5',
//       primaryAlpha: '#cad3f5',
//       primary: '#FF1694',
//       primaryBorder: '#FD5DA8',
//       primaryBorderHover: '#FEC5E5',
//       primarySolidHover: '#FEC5E5',
//       primarySolidContrast: '$white',
//       primaryShadow: '#89b4fa',
      


//       gradient: 'linear-gradient(112deg, #FC46AA -25%, #FF1694 -10%, #FF1694 80%)',
//       link: '#b8c0e0',
//       hover: '#FC94AF',


//       sidebarUnselectedText: "#FC94AF",
//       text: "#FC94AF",
//       waitingBackground: "#181825",
//       backgroundSecondary: "#181825",
//       background: "#11111b",
//       backgroundContrast: "#181825",
//     },
//     space: {},
//     fonts: {
//       sans: "'Manrope', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif"
//     }
//   },
// });

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
    <NextUIProvider theme={dark}>
      <App />
    </NextUIProvider>
    </BrowserRouter>
  </React.StrictMode>
);
