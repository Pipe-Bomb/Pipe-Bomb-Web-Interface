import { createTheme } from '@nextui-org/react';

const themes: {[key: string]: any} = {};

themes["Classic"] = createTheme({ // todo: tidy up theme
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
      backgroundSecondary: "#11111b",
      background: "#212133",
      backgroundContrast: "#181825",
      secondaryLightHover: '#2e2e42',
    },
    space: {},
    fonts: {
      sans: "'Inter', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif"
    },
    shadows: {
      center: "0 0 20px 6px rgb(0 0 0 / 0.2)"
    }
  }
});

themes["Grape"] = createTheme({ // todo: tidy up theme
  type: "dark",
  theme: {
    colors: {
      logoID: "main",
      primaryLight: '#6E56BA',
      primaryLightHover: '#6E56BA',
      primaryLightActive: '#6E56BA',
      primaryLightContrast: '#6E56BA',
      primaryAlpha: '#cad3f5',
      primary: '#55418C',
      primaryBorder: '#6E56BA',
      primaryBorderHover: '#6E56BA',
      primarySolidHover: '#5A42A6',
      primarySolidContrast: '$white',
      primaryShadow: '#89b4fa',
      secondaryLightHover: '#4B406E',
      selection: '#6E56BA',
      

      gradient: 'linear-gradient(112deg, #4B406E -25%, #4B406E -10%, #4B406E 80%)',
      link: '#b8c0e0',

      sidebarUnselectedText: "#9587C2",
      waitingBackground: "#181825",
      backgroundSecondary: "#100C18",
      background: "#1E192A",
      backgroundContrast: "#1E192A",
    },
    space: {},
    fonts: {
      sans: "'Inter', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif"
    },
    shadows: {
      center: "0 0 20px 6px rgb(0 0 0 / 0.2)"
    }
  }
});

themes["Honey"] = createTheme({
  type: "dark",
  theme: {
    colors: {
      primary: '#ff6d00', // main colour
      primaryLightActive: '#ff6d00', // button colour on click
      primarySolidHover: '#ff9e00', // scrollbars on hover

      gradient: 'linear-gradient(112deg, #FF9E00 -25%, #FF8500 -10%, #FF6D00 80%)', // primary button gradient
      secondary: "#5c361b", // dropdown background
      secondaryLightHover: "#5c361b", // item background on hover
      backgroundContrast: "#180f00", // popover background
      neutralLight: "#5c361b", // popover selected item

      sidebarUnselectedText: "$gray800", // navbar entries when not hovered
      waitingBackground: "$gray300", // behind loading icons
      backgroundSecondary: "#121414", // behind main panel
      background: "#241f1b", // item background
      mainBackground: "#180f00" // behind everything
    },
    space: {},
    fonts: {
      sans: "'Inter', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif"
    }
  }
});

export default class Theme {
    public static getTheme(themeId: string) {
        const theme = themes[themeId];
        if (theme) return theme;
        return themes["Classic"];
    }

    public static getThemeIds() {
      return Object.keys(themes);
    }
}