import { CssBaseline, ThemeProvider } from '@mui/material';
import { AppProviders } from './providers';
import { theme } from './theme';
import { AppRouter } from '../routes/AppRouter';

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppProviders>
        <AppRouter />
      </AppProviders>
    </ThemeProvider>
  );
}
