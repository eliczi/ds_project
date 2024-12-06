import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { collection, getDocs } from "firebase/firestore";
import db from '../assets/configurations';
import { useEffect, useState } from 'react';

interface Item {
  id: string;
  name: string;
  category: string;
  seller: string;
  price: string;
  description: string;
}

interface User {
  id: string;
  email: string;
  ethereumAddress: string;
}

function HomePage() {
  const navigate = useNavigate();

  const [items, setItems] = useState<Item[]>([]);
  const [user, setUser] = useState<User | null>(null)
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "items"));
        const itemsArray = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<Item, "id">), // Type assertion to match the Item structure
        }));
        setItems(itemsArray);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };
    const fetchUser = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const users = querySnapshot.docs[0].data() as User
        setUser(users)
        console.log(user)
      }
      catch (error) {
        console.error("Error fetching items:", error);
      }
    }
    fetchItems();
    fetchUser();
  }, []);

  return (
    <Box p={2}>
       
      <Stack spacing={2} justifyContent="flex-end" 
  alignItems="flex-start" >
        <Typography variant='h2' gutterBottom>
          Peer - Peer Rental MarketPlace
        </Typography>
        <Button
          size="small"
          color="primary"
          variant="contained"
          onClick={() => navigate(`/sell`)}
          sx={{marginLeft:'100%'}}
        >
          Sell
        </Button>
        <Typography variant="h4" gutterBottom>
          Available Right Now:
        </Typography>
        {items.map((item) => (
        // <Accordion key={item.id}>
        //   <AccordionSummary
        //     expandIcon={<ExpandMoreIcon />}
        //     aria-controls={`panel-${item.id}-content`}
        //     id={`panel-${item.id}-header`}
        //   >
        //     <Typography variant="h6">{item.name}</Typography>
        //   </AccordionSummary>
        //   <AccordionDetails>
        //     <Typography variant="body2" color="textSecondary" gutterBottom>
        //       Category: {item.category}
        //     </Typography>
        //     <Typography variant="body2" color="textSecondary" gutterBottom>
        //       Seller: {item.seller}
        //     </Typography>
        //     <Typography variant="body2" color="textSecondary" gutterBottom>
        //       Price: {item.price}
        //     </Typography>
        //     <Typography variant="body2" gutterBottom>
        //       {item.description}
        //     </Typography>
        //     <Button
        //       size="small"
        //       color="primary"
        //       variant="contained"
        //       onClick={() => navigate(`/rent`, { state: { item } })}
        //     >
        //       Rent This
        //     </Button>
        //   </AccordionDetails>
        // </Accordion>
        <Accordion key={item.id}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`panel-${item.id}-content`}
            id={`panel-${item.id}-header`}
          >
            <Typography variant="h6">{item.name}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Category: {item.category}
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Seller: {item.seller}
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Price: {item.price}
            </Typography>
            <Typography variant="body2" gutterBottom>
              {item.description}
            </Typography>
            <Button
              size="small"
              color="primary"
              variant="contained"
              onClick={() => navigate(`/rent`, { state: { item } })}
            >
              Rent This
            </Button>
          </AccordionDetails>
        </Accordion>
        ))}
        
      </Stack>

      

      
    </Box>
    
  );
}

export default HomePage;
