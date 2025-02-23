import React, { Fragment } from 'react';
import { Route } from 'react-router';
import ResponsiveAppBar from './components/ResponsiveAppBar';
import { Box } from '@mui/material';

const LayoutDefault = (props: any) => (
  <>
    <Box sx={{minHeight: '100vh', display: 'flex', flexDirection: 'column'}}>
      <ResponsiveAppBar />
      {props.children}
    </Box>
  </>
);

export default LayoutDefault;