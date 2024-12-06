import { useNavigate } from 'react-router-dom';
import { Box, Button, Stack, TextField, Typography } from '@mui/material';

function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/home');
  };

  return (
    <Box sx={{ 
      maxWidth: 400, 
      margin: 'auto', 
      padding: 2 
    }}>
      <Stack spacing={3}>
        <Typography 
          variant="h4" 
          gutterBottom 
          align="center"
        >
          Login
        </Typography>

        <TextField 
          fullWidth
          type="email"
          label="Email"
          variant="outlined"
        />

        <TextField 
          fullWidth
          type="password"
          label="Password"
          variant="outlined"
        />

        <Stack 
          direction="row" 
          spacing={2}
        >
          <Button 
            fullWidth
            variant="contained" 
            onClick={handleLogin}
          >
            Login
          </Button>

          <Button 
            fullWidth
            variant="outlined"
            color="primary"
            onClick={() => navigate('/signup')}
          >
            Sign Up
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

export default LoginPage;
