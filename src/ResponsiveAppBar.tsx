import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import AdbIcon from '@mui/icons-material/Adb';
import { useNavigate } from 'react-router';
import { useCookies } from 'react-cookie';
import NotificationIcon from './NotificationIcon';
import { useAuth } from './AuthContext';

const pages = ['Home', 'Report Lost Item', 'Report Found Item', 'About Us', 'Settings', 'Contact Us'];

function ResponsiveAppBar() {
  const navigate = useNavigate();
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
  const [cookies] = useCookies(['is_admin', 'session_id']);
  const { isAuthenticated, isAdmin, logout } = useAuth();

  // For debugging admin status
  React.useEffect(() => {
    console.log("Auth state in NavBar:", { isAuthenticated, isAdmin, cookieAdmin: cookies.is_admin });
  }, [isAuthenticated, isAdmin, cookies.is_admin]);

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const redirectToPage = (page: string) => {
    var pageName = page.toLowerCase();
    //@ts-ignore
    pageName = pageName.replaceAll(' ', '-');

    if(pageName === "home") {
      navigate("/");
      return;
    }

    navigate("/" + pageName);
  };

  const handleLogout = async () => {
    handleCloseUserMenu();
    await logout();
    // Force a full page reload to reset the UI state completely
    window.location.reload();
  };

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <AdbIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            Lost and Found
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{ display: { xs: 'block', md: 'none' } }}
            >
              {pages.map((page) => (
                <MenuItem key={page} onClick={() => {redirectToPage(page)}}>
                  <Typography sx={{ textAlign: 'center' }}>{page}</Typography>
                </MenuItem>
              ))}
              {
                isAuthenticated && (
                <MenuItem key='User Dashboard' onClick={() => {navigate('/user-dashboard')}}>
                  <Typography sx={{ textAlign: 'center' }}>User Dashboard</Typography>
                </MenuItem>
                )
              }
              {
                isAdmin && (
                <MenuItem key='Admin Console' onClick={() => {navigate('/admin-console')}}>
                  <Typography sx={{ textAlign: 'center' }}>Admin Console</Typography>
                </MenuItem>
                )
              }
            </Menu>
          </Box>
          <AdbIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
          <Typography
            variant="h5"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            LOGO
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) => (
              <Button
                key={page}
                onClick={() => {redirectToPage(page)}}
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                {page}
              </Button>
            ))}
            {
              isAuthenticated && (
              <Button
                key="User Dashboard"
                onClick={() => {navigate('/user-dashboard')}}
                sx={{ my: 2, color: 'white', display: 'block' }}
              >User Dashboard</Button>
              )
            }
            {
              isAdmin && (
              <Button
                key="Admin Console"
                onClick={() => {navigate('/admin-console')}}
                sx={{ my: 2, color: 'white', display: 'block' }}
              >Admin Console</Button>
              )
            }
          </Box>
          
          {/* Notification icon */}
          {isAuthenticated && (
            <Box sx={{ mr: 2 }}>
              <NotificationIcon />
            </Box>
          )}

          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar alt="Remy Sharp" src="/static/images/avatar/2.jpg" />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {isAuthenticated ? (
                <MenuItem onClick={handleLogout}>
                  <Typography sx={{ textAlign: 'center' }}>Logout</Typography>
                </MenuItem>
              ) : (
                <MenuItem onClick={() => navigate('/login')}>
                  <Typography sx={{ textAlign: 'center' }}>Login</Typography>
                </MenuItem>
              )}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default ResponsiveAppBar;