import { Button, Container, Typography } from "@mui/material";
import LayoutDefault from "./LayoutDefault";
import { Link } from "react-router";

const NotAdmin = (e: any) => {
  return (
    <LayoutDefault>
    <Container>
      <Typography variant="h3">Permission Denied</Typography>
      <Typography>The page or API you have just accessed requires admin privilege.</Typography>
      <Button component={Link} to='/login'>Login as admin</Button>
    </Container>
    </LayoutDefault>
  );
};

export default NotAdmin;
