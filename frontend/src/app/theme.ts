import { alpha, createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#355c4c',
      light: '#4d7d69',
      dark: '#234033',
      contrastText: '#f7f1e3',
    },
    secondary: {
      main: '#c7774b',
      light: '#d89b74',
      dark: '#9c5630',
      contrastText: '#fff7ed',
    },
    background: {
      default: '#efe6d2',
      paper: '#f8f1e1',
    },
    text: {
      primary: '#1d211f',
      secondary: '#52564c',
    },
    success: {
      main: '#53764f',
    },
    warning: {
      main: '#b8843d',
    },
  },
  typography: {
    fontFamily: '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif',
    h1: {
      fontFamily: '"Cormorant Garamond", "STSong", serif',
      fontWeight: 700,
      letterSpacing: '-0.03em',
    },
    h2: {
      fontFamily: '"Cormorant Garamond", "STSong", serif',
      fontWeight: 700,
      letterSpacing: '-0.03em',
    },
    h3: {
      fontFamily: '"Cormorant Garamond", "STSong", serif',
      fontWeight: 700,
    },
    h4: {
      fontFamily: '"Cormorant Garamond", "STSong", serif',
      fontWeight: 700,
    },
    h5: {
      fontFamily: '"Cormorant Garamond", "STSong", serif',
      fontWeight: 700,
    },
    button: {
      textTransform: 'none',
      fontWeight: 700,
      letterSpacing: '0.04em',
    },
  },
  shape: {
    borderRadius: 22,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          paddingInline: 20,
          paddingBlock: 10,
          boxShadow: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 28,
          border: `1px solid ${alpha('#355c4c', 0.16)}`,
          backgroundImage:
            'linear-gradient(160deg, rgba(255,255,255,0.78), rgba(248,241,225,0.9))',
          boxShadow: '0 22px 60px rgba(36, 44, 39, 0.12)',
          backdropFilter: 'blur(10px)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage:
            'linear-gradient(180deg, rgba(255,255,255,0.86), rgba(248,241,225,0.95))',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          fontWeight: 700,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          backgroundColor: alpha('#fffdf7', 0.72),
        },
      },
    },
  },
});
