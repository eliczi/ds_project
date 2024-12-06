import { useLocation } from 'react-router-dom';
import { Box, Typography, TextField, Button } from '@mui/material';

function RentPage() {
  const location = useLocation();
  const item = location.state?.item;

  return (
    <Box p={2}>
      {item ? (
        <>
          <Typography variant="h4" gutterBottom>
            Rent {item.name}
          </Typography>
          <Typography variant="body1" gutterBottom>
            Category: {item.category}
          </Typography>
          <Typography variant="body1" gutterBottom>
            Seller: {item.seller}
          </Typography>
          <Typography variant="body1" gutterBottom>
            Price: {item.price}
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            {item.description}
          </Typography>
          <form>
            <TextField label="Your Name" fullWidth margin="normal" />
            <TextField label="Contact Information" fullWidth margin="normal" />
            <TextField label="Rental Duration (in months)" fullWidth margin="normal" />
            <Button variant="contained" color="primary">
              Submit Request
            </Button>
          </form>
        </>
      ) : (
        <Typography variant="h6" color="error">
          No item selected for rent.
        </Typography>
      )}
    </Box>
  );
}

export default RentPage;
