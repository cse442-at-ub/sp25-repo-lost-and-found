import { useEffect, useState } from "react";
import LayoutDefault from "./LayoutDefault";
import { Box, Card, CardActions, CardContent, CardMedia, Container, IconButton, List, ListItem, ListItemIcon, ListItemText, Typography } from "@mui/material";
import { Cancel, CheckCircle, Delete, Edit, Pending } from "@mui/icons-material";
import { useNavigate } from "react-router";


function UserDashboard() {
  const [founds,setFounds] = useState([]);
  const [losts,setLosts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('./Backend/getAllMyFound.php')
    .then((response) => {
      if (response.ok) return response.json();
      else navigate('/login');
    })
    .then((json) => {
      setFounds(json);
    });
    fetch('./Backend/getAllMyLost.php')
    .then((response) => {
      if (response.ok) return response.json();
      else navigate('/login');
    })
    .then((json) => {
      setLosts(json);
    });
  }, []);

  return (
    <LayoutDefault>
      <Container>
        <Typography variant="h3">User Dashboard</Typography>
        <Typography variant="h4">Founds</Typography>
        <Box sx={{width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(240px, 100%), 1fr))', gap:1}}>
          {founds.map((found) => (
            <Card sx={{minHeight: '200px'}}>
              <CardMedia component="img" image={"Backend/" + found.image} sx={{minHeight: '100px', minWidth: '100px'}}/>
              <CardContent>
                <Typography variant="h5">{found.name}</Typography>
                <Typography variant="body1">Found at {found.location}</Typography>
                <Typography variant="body1">{found.description}</Typography>
                <List>
                  {
                    found.match_id &&
                    <ListItem>
                      <ListItemIcon><CheckCircle sx={{color: '#00c853'}}/></ListItemIcon>
                      <ListItemText>Matched</ListItemText>
                    </ListItem>
                  }
                  {
                    found.claim_id === null?
                      <ListItem>
                        <ListItemIcon><Pending/></ListItemIcon>
                        <ListItemText>To be claimed</ListItemText>
                      </ListItem>
                    : <ListItem>
                        <ListItemIcon><CheckCircle sx={{color: '#00c853'}}/></ListItemIcon>
                        <ListItemText>Claimed</ListItemText>
                      </ListItem>
                  }
                  {
                    found.claim_id === null || found.approved === null?
                      <ListItem>
                        <ListItemIcon><Pending/></ListItemIcon>
                        <ListItemText>To be approved</ListItemText>
                      </ListItem>
                    : (found.approved?
                      <ListItem>
                        <ListItemIcon><CheckCircle sx={{color: '#00c853'}}/></ListItemIcon>
                        <ListItemText>Approved</ListItemText>
                      </ListItem>
                    : <ListItem>
                        <ListItemIcon><Cancel sx={{color: '#ff5252'}}/></ListItemIcon>
                        <ListItemText>Rejected</ListItemText>
                      </ListItem>
                    )
                  }
                </List>
              </CardContent>
              <CardActions>
                <IconButton><Edit/></IconButton>
                <IconButton><Delete/></IconButton>
              </CardActions>
            </Card>
          ))}
        </Box>

        <Typography variant="h4">Losts</Typography>
        <Box sx={{width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(240px, 100%), 1fr))', gap:1}}>
          {losts.map((lost) => (
            <Card sx={{height: '100%'}}>
              <CardMedia component="img" image={"Backend/" + lost.image} sx={{minHeight: '100px', minWidth: '100px'}}/>
              <CardContent>
                <Typography variant="h5">{lost.name}</Typography>
                <Typography variant="body1">Last seen at {lost.location}</Typography>
                <Typography variant="body1">{lost.description}</Typography>
                <List>
                  {
                    lost.match_id === null?
                      <ListItem>
                        <ListItemIcon><Pending/></ListItemIcon>
                        <ListItemText>To be matched</ListItemText>
                      </ListItem>
                    : <>
                      <ListItem>
                        <ListItemIcon><CheckCircle sx={{color: '#00c853'}}/></ListItemIcon>
                        <ListItemText>Matched</ListItemText>
                      </ListItem>
                      </>
                  }
                  {
                    lost.match_id === null || lost.claim_id === null?
                      <ListItem>
                        <ListItemIcon><Pending/></ListItemIcon>
                        <ListItemText>To be claimed</ListItemText>
                      </ListItem>
                    : <>
                      <ListItem>
                        <ListItemIcon><CheckCircle sx={{color: '#00c853'}}/></ListItemIcon>
                        <ListItemText>Claimed</ListItemText>
                      </ListItem>
                      </>
                  }
                  {
                    lost.match_id === null || lost.claim_id === null || lost.approved === null?
                      <ListItem>
                        <ListItemIcon><Pending/></ListItemIcon>
                        <ListItemText>To be approved</ListItemText>
                      </ListItem>
                    : (lost.approved?
                      <ListItem>
                        <ListItemIcon><CheckCircle sx={{color: '#00c853'}}/></ListItemIcon>
                        <ListItemText>Approved</ListItemText>
                      </ListItem>
                    : <ListItem>
                        <ListItemIcon><Cancel sx={{color: '#ff5252'}}/></ListItemIcon>
                        <ListItemText>Rejected</ListItemText>
                      </ListItem>
                    )
                  }
                </List>
              </CardContent>
              <CardActions sx={{marginTop: 'auto'}}>
                <IconButton><Edit/></IconButton>
                <IconButton><Delete/></IconButton>
              </CardActions>
            </Card>
          ))}
        </Box>
      </Container>
    </LayoutDefault>
  )
}

export default UserDashboard;
