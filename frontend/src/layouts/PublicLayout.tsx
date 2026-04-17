import { Box, Container } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { AppHeader } from '../components/AppHeader';

export function PublicLayout() {
  return (
    <Box minHeight="100vh">
      <AppHeader />
      <Container maxWidth="xl" sx={{ py: { xs: 4, md: 6 } }}>
        <Outlet />
      </Container>
    </Box>
  );
}
