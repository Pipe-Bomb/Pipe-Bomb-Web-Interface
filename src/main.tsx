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
      primaryLight: '$green200',
      primaryLightHover: '$green300',
      primaryLightActive: '$green400',
      primaryLightContrast: '$green600',
      primaryAlpha: 'rgba(74, 222, 123, 0.2)',
      primary: '#4ADE7B',
      primaryBorder: '$green500',
      primaryBorderHover: '$green600',
      primarySolidHover: '$green700',
      primarySolidContrast: '$white',
      primaryShadow: '$green500',

      gradient: 'linear-gradient(112deg, $blue100 -25%, $pink500 -10%, $purple500 80%)',
      link: '#5E1DAD',

      sidebarUnselectedText: "$gray800",
      waitingBackground: "$gray300",
      backgroundSecondary: "#121414"
    },
    space: {},
    fonts: {
      sans: "'Manrope', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif"
    }
  }
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
    <NextUIProvider theme={dark}>
      <App />
    </NextUIProvider>
    </BrowserRouter>
  </React.StrictMode>
);
