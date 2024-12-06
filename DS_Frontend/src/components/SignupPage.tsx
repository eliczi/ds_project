import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography } from '@mui/material';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

function SignupPage() {
  const navigate = useNavigate();
  const auth = getAuth();
  const firestore = getFirestore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ethereumAddress, setEthereumAddress] = useState('');
  const [error, setError] = useState('');

  const handleSignup = async () => {
    // Basic validation
    if (!email || !password || !ethereumAddress) {
      setError('Please fill in all fields');
      return;
    }

    try {
      // Create user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Store additional user info in Firestore
      await setDoc(doc(firestore, 'users', user.uid), {
        email: email,
        ethereumAddress: ethereumAddress,
        createdAt: new Date()
      });

      // Navigate to home page after successful signup
      navigate('/home');
    } catch (error: any) {
      setError(error.message);
      console.error('Signup error:', error);
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="#f0f0f0"
      p={2}
    >
      <Typography variant="h4" gutterBottom>
        Sign Up
      </Typography>
      {error && (
        <Typography color="error" gutterBottom>
          {error}
        </Typography>
      )}
      <TextField 
        label="Email" 
        variant="outlined" 
        fullWidth 
        margin="normal"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextField 
        label="Password" 
        type="password" 
        variant="outlined" 
        fullWidth 
        margin="normal"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <TextField 
        label="Wallet/Ethereum Key" 
        variant="outlined" 
        fullWidth 
        margin="normal"
        value={ethereumAddress}
        onChange={(e) => setEthereumAddress(e.target.value)}
      />
      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={handleSignup}
      >
        Create Account
      </Button>
    </Box>
  );
}

export default SignupPage;