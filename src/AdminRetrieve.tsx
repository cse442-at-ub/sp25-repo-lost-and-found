import React, { useEffect, useState } from "react";
import LayoutDefault from "./LayoutDefault";
import {
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

// Mock data for demonstration
const mockRetrievals = [
  {
    id: 1,
    item_name: "Laptop",
    image: "laptop.jpg",
    description: "Dell XPS 13",
    location_found: "Capen Library",
    retrieved_by: "Dinal",
    retrieval_location: "Capen Library Front Desk",
    retrieval_date: "2024-04-15",
  },
  {
    id: 2,
    item_name: "Water Bottle",
    image: "bottle.jpg",
    description: "Hydro Flask 32oz",
    location_found: "Student Union",
    retrieved_by: "Dinal",
    retrieval_location: "Capen Library Front Desk",
    retrieval_date: "2024-04-16",
  },
];

function AdminRetrieve() {
  const [retrievals, setRetrievals] = useState(mockRetrievals);

  return (
    <LayoutDefault>
      <Typography variant="h4" gutterBottom style={{ padding: 20 }}>
        Items Waiting for Retrieval
      </Typography>
      
      <TableContainer component={Paper} style={{ margin: 20 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Item</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Found Location</TableCell>
              <TableCell>Retrieved By</TableCell>
              <TableCell>Retrieval Location</TableCell>
              <TableCell>Retrieval Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {retrievals.map((retrieval) => (
              <TableRow key={retrieval.id}>
                <TableCell>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <CardMedia
                      component="img"
                      src={retrieval.image}
                      alt={retrieval.item_name}
                      style={{ width: 50, height: 50, marginRight: 10 }}
                    />
                    {retrieval.item_name}
                  </div>
                </TableCell>
                <TableCell>{retrieval.description}</TableCell>
                <TableCell>{retrieval.location_found}</TableCell>
                <TableCell>{retrieval.retrieved_by}</TableCell>
                <TableCell>{retrieval.retrieval_location}</TableCell>
                <TableCell>{retrieval.retrieval_date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </LayoutDefault>
  );
}

export default AdminRetrieve;