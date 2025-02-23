import { React } from "react";
import { AppBar, Toolbar, Button, Typography } from "@mui/material";

function HeaderLink(props) {
  return (
    <Typography component="div" sx={{flexGrow: 1}}>{props.name}</Typography>
  );
}

function Header() {
  const names = ["Home", "Report Lost Item", "Report Found Item",
      "About Us", "Settings", "Admin Claim", "Admin Match", "Contact Us"];
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography component="div">Lost and Found</Typography>
        {names.map(name => <HeaderLink name={name}/>)}
      </Toolbar>
    </AppBar>
  );
}

export default Header;
