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

themes["Red"] = createTheme({
  type: "dark",
  theme: {
    colors: {
      primary: '#ff0000', // main color
      primaryLightActive: '#ff5500', // button color on click
      primarySolidHover: '#ff3333', // scrollbars on hover
      
      gradient: 'linear-gradient(112deg, #ff5500 -25%, #ff3300 -10%, #ff0000 80%)', // primary button gradient
      secondary: "#8c1919", // dropdown background
      secondaryLightHover: "#8c1919", // item background on hover
      backgroundContrast: "#2c0c0c", // popover background
      neutralLight: "#8c1919", // popover selected item
      
      sidebarUnselectedText: "#ffffff", // navbar entries when not hovered
      waitingBackground: "#dddddd", // behind loading icons
      backgroundSecondary: "#121414", // behind main panel
      background: "#990000", // item background
      mainBackground: "#330000" // behind everything    
    },
    space: {},
    fonts: {
      sans: "'Inter', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif"
    }
  }
});

themes["Midnight Blue"] = createTheme({
  type: "dark",
  theme: {
    colors: {
      primary: '#003366',
      primaryLightActive: '#004488',
      primarySolidHover: '#0055aa',
      gradient: 'linear-gradient(112deg, #0055aa -25%, #004488 -10%, #003366 80%)',
      secondary: "#1a2f4d",
      secondaryLightHover: "#1a2f4d",
      backgroundContrast: "#0c182a",
      neutralLight: "#1a2f4d",
      sidebarUnselectedText: "#ffffff",
      waitingBackground: "#dddddd",
      backgroundSecondary: "#1214144D",
      background: "#0033664D",
      mainBackground: "#000022"
    },
    space: {},
    fonts: {
      sans: "'Inter', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif"
    }
  }
});


themes["Deep Purple"] = createTheme({
  type: "dark",
  theme: {
    colors: {
      primary: '#800080',
      primaryLightActive: '#a335cd',
      primarySolidHover: '#993399',
      gradient: 'linear-gradient(112deg, #993399 -25%, #a335cd -10%, #800080 80%)',
      secondary: "#421c42",
      secondaryLightHover: "#421c42",
      backgroundContrast: "#1c0f1c",
      neutralLight: "#421c42",
      sidebarUnselectedText: "#ffffff",
      waitingBackground: "#dddddd",
      backgroundSecondary: "#1214144D",
      background: "#8000804D",
      mainBackground: "#330033"
    },
    space: {},
    fonts: {
      sans: "'Inter', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif"
    }
  }
});

themes["Emerald Green"] = createTheme({
  type: "dark",
  theme: {
    colors: {
      primary: '#007a63',
      primaryLightActive: '#00b997',
      primarySolidHover: '#00997a',
      gradient: 'linear-gradient(112deg, #00997a -25%, #00b997 -10%, #007a63 80%)',
      secondary: "#194c3d",
      secondaryLightHover: "#194c3d",
      backgroundContrast: "#0c2e25",
      neutralLight: "#194c3d",
      sidebarUnselectedText: "#ffffff",
      waitingBackground: "#dddddd",
      backgroundSecondary: "#1214144D",
      background: "#007a634D",
      mainBackground: "#003d31"
    },
    space: {},
    fonts: {
      sans: "'Inter', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif"
    }
  }
});

themes["Ruby Red"] = createTheme({
  type: "dark",
  theme: {
    colors: {
      primary: '#9e2020',
      primaryLightActive: '#e62b2b',
      primarySolidHover: '#b71c1c',
      gradient: 'linear-gradient(112deg, #b71c1c -25%, #e62b2b -10%, #9e2020 80%)',
      secondary: "#4d1414",
      secondaryLightHover: "#4d1414",
      backgroundContrast: "#1c0c0c",
      neutralLight: "#4d1414",
      sidebarUnselectedText: "#ffffff",
      waitingBackground: "#dddddd",
      backgroundSecondary: "#1214144D",
      background: "#9e20204D",
      mainBackground: "#330000"
    },
    space: {},
    fonts: {
      sans: "'Inter', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif"
    }
  }
});

themes["Coral Orange"] = createTheme({
  type: "dark",
  theme: {
    colors: {
      primary: '#ff5722',
      primaryLightActive: '#ff7539',
      primarySolidHover: '#ff5a33',
      gradient: 'linear-gradient(112deg, #ff5a33 -25%, #ff7539 -10%, #ff5722 80%)',
      secondary: "#8c361b",
      secondaryLightHover: "#8c361b",
      backgroundContrast: "#2c0f08",
      neutralLight: "#8c361b",
      sidebarUnselectedText: "#ffffff",
      waitingBackground: "#dddddd",
      backgroundSecondary: "#1214144D",
      background: "#ff57224D",
      mainBackground: "#993d19"
    },
    space: {},
    fonts: {
      sans: "'Inter', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif"
    }
  }
});

themes["Cotton Candy"] = createTheme({
  type: "dark",
  theme: {
    colors: {
      primary: '#e36bbf',
      primaryLightActive: '#ed99d4',
      primarySolidHover: '#da599e',
      gradient: 'linear-gradient(112deg, #da599e -25%, #ed99d4 -10%, #e36bbf 80%)',
      secondary: "#9973b8",
      secondaryLightHover: "#9973b8",
      backgroundContrast: "#4f335b",
      neutralLight: "#9973b8",
      sidebarUnselectedText: "#ffffff",
      waitingBackground: "#dddddd",
      backgroundSecondary: "#1214144D",
      background: "#e36bbf4D",
      mainBackground: "#9e47aa"
    },
    space: {},
    fonts: {
      sans: "'Inter', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif"
    }
  }
});

themes["Aurora Borealis"] = createTheme({
  type: "dark",
  theme: {
    colors: {
      primary: '#53c4e6',
      primaryLightActive: '#8adaf5',
      primarySolidHover: '#47b8db',
      gradient: 'linear-gradient(112deg, #47b8db -25%, #8adaf5 -10%, #53c4e6 80%)',
      secondary: "#1c4e5e",
      secondaryLightHover: "#1c4e5e",
      backgroundContrast: "#0c2832",
      neutralLight: "#1c4e5e",
      sidebarUnselectedText: "#ffffff",
      waitingBackground: "#dddddd",
      backgroundSecondary: "#1214144D",
      background: "#53c4e64D",
      mainBackground: "#134653"
    },
    space: {},
    fonts: {
      sans: "'Inter', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif"
    }
  }
});

themes["SoundCloud"] = createTheme({
  type: "dark",
  theme: {
    colors: {
      primary: '#ff3a00',
      primaryLightActive: '#ff6500',
      primarySolidHover: '#d12b00',
      gradient: 'linear-gradient(112deg, #d12b00 -25%, #ff6500 -10%, #ff3a00 80%)',
      secondary: "#ff5500",
      secondaryLightHover: "#ff5500",
      backgroundContrast: "#121212",
      neutralLight: "#ff3a00",
      sidebarUnselectedText: "#ffffff",
      waitingBackground: "#dddddd",
      backgroundSecondary: "#000000",
      background: "#1f1f1f",
      mainBackground: "#1f1f1f"
    },
    space: {},
    fonts: {
      sans: "'Inter', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif"
    }
  }
});



themes["Spotify"] = createTheme({
  type: "dark",
  theme: {
    colors: {
      primary: '#1DB954', 
      primaryLightActive: '#3DDC84', 
      primarySolidHover: '#1AA34A', 
      gradient: 'linear-gradient(112deg, #1AA34A -25%, #3DDC84 -10%, #1DB954 80%)', 
      secondary: '#191414', 
      secondaryLightHover: '#222121', 
      backgroundContrast: '#282828', 
      neutralLight: '#FFFFFF2D', 
      sidebarUnselectedText: '#B3B3B3', 
      waitingBackground: '#2E2E2E', 
      backgroundSecondary: '#121212', 
      background: '#1212124D', 
      mainBackground: '#000000' 
    },
    space: {},
    fonts: {
      sans: "'Inter', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif"
    }
  }
});

themes["Apple Music"] = createTheme({
  type: "dark",
  theme: {
    colors: {
      primary: '#ff2d55',
      primaryLightActive: '#ff6382',
      primarySolidHover: '#cc2349',
      gradient: 'linear-gradient(112deg, #cc2349 -25%, #ff6382 -10%, #ff2d55 80%)',
      secondary: '#161616',
      secondaryLightHover: '#1f1f1f',
      backgroundContrast: '#282828',
      neutralLight: '#FFFFFF2D',
      sidebarUnselectedText: '#B3B3B3',
      waitingBackground: '#2E2E2E',
      backgroundSecondary: '#121212',
      background: '#1212124D',
      mainBackground: '#000000'
    },
    space: {},
    fonts: {
      sans: "'Inter', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif"
    }
  }
});


themes["YouTube Music"] = createTheme({
  type: "dark",
  theme: {
    colors: {
      primary: '#ff0000',
      primaryLightActive: '#ff3838',
      primarySolidHover: '#cc0000',
      gradient: 'linear-gradient(112deg, #cc0000 -25%, #ff3838 -10%, #ff0000 80%)',
      secondary: '#121212',
      secondaryLightHover: '#1c1c1c',
      backgroundContrast: '#282828',
      neutralLight: '#ffffff2D',
      sidebarUnselectedText: '#B3B3B3',
      waitingBackground: '#2E2E2E',
      backgroundSecondary: '#0d0d0d',
      background: '#1212124D',
      mainBackground: '#000000'
    },
    space: {},
    fonts: {
      sans: "'Inter', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif"
    }
  }
});

themes["Simpsons Theme"] = createTheme({
  type: "dark",
  theme: {
    colors: {
      primary: '#ffcd00',
      primaryLightActive: '#ffe154',
      primarySolidHover: '#ffbc00', 
      gradient: 'linear-gradient(112deg, #ffbc00 -25%, #ffe154 -10%, #ffcd00 80%)',
      secondary: '#2a2a2a', 
      secondaryLightHover: '#333333',
      backgroundContrast: '#333333', 
      neutralLight: '#ffffff', 
      sidebarUnselectedText: '#ffffff', 
      waitingBackground: '#dddddd', 
      backgroundSecondary: '#1214144D', 
      background: '#ffcd004D',
      mainBackground: '#000000'
    },
    space: {},
    fonts: {
      sans: "'Inter', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif"
    }
  }
});

themes["TransTheme"] = createTheme({
  type: "dark",
  theme: {
    colors: {
      primary: '#55CDFC',
      primaryLightActive: '#8AD9FF',
      primarySolidHover: '#3BA4D7',
      gradient: 'linear-gradient(112deg, #3BA4D7 -25%, #8AD9FF -10%, #55CDFC 80%)',
      secondary: '#F7A8B8',
      secondaryLightHover: '#F7A8B8',
      backgroundContrast: '#282828',
      neutralLight: '#F7A8B8',
      sidebarUnselectedText: '#ffffff',
      waitingBackground: '#dddddd',
      backgroundSecondary: '#1214144D',
      background: '#F7A8B84D',
      mainBackground: '#000000'
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