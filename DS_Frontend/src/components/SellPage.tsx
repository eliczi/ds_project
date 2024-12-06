import { Box, TextField, Button, Typography } from '@mui/material';

function SellPage() {
  return (
    <Box p={2}>
      <Typography variant="h4" gutterBottom>
        Sell an Item
      </Typography>
      <TextField label="Item Name" fullWidth margin="normal" />
      <TextField label="Description" fullWidth margin="normal" />
      <TextField label="Location/Pickup" fullWidth margin="normal" />
      <TextField label="Monthly Payment" fullWidth margin="normal" />
      <TextField label="Category" fullWidth margin="normal" />
      <TextField label="Image URL" fullWidth margin="normal" />
      <Button variant="contained" color="primary">
        Post
      </Button>
    </Box>
  );
}

export default SellPage;
