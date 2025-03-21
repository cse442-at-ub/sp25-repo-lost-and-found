import { useEffect } from "react";
import { Container, Typography, MenuList, MenuItem, ListItemText } from "@mui/material";
import LayoutDefault from "./LayoutDefault";
import { Link, useNavigate } from "react-router";

const AdminConsole = (e: any) => {

  const navigate = useNavigate();

  useEffect(() => {
    fetch('./Backend/validateAdmin.php')
    .then((response) => {
      if (!response.ok) navigate('/not-admin');
    })
  }, []);

  return (
    <LayoutDefault>
    <Container>
      <Typography variant="h3">Admin Console</Typography>
      <MenuList>
        <MenuItem component={Link} to="/admin-claim">
          <ListItemText>Admin Claim</ListItemText>
        </MenuItem>
        <MenuItem component={Link} to="/admin-match">
          <ListItemText>Admin Match</ListItemText>
        </MenuItem>
        <MenuItem component={Link} to="/view-messages">
          <ListItemText>View Messages</ListItemText>
        </MenuItem>
      </MenuList>
    </Container>
    </LayoutDefault>
  );
};

export default AdminConsole;
