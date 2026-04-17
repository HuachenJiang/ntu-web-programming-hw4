import { Box, Container } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { AppHeader } from '../components/AppHeader';

export function PrivateLayout() {
  return (
    <Box minHeight="100vh">
      <AppHeader showPrivateLinks />
      <Container maxWidth="xl" sx={{ py: { xs: 4, md: 5 } }}>
        <Outlet />
      </Container>
    </Box>
  );
}
