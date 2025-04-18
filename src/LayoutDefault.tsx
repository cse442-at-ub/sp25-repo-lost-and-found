import React, { Fragment } from 'react';
import { Route } from 'react-router';
import ResponsiveAppBarBad from './components/ResponsiveAppBar';
import { Box } from '@mui/material';

const LayoutDefault = (props: any) => (
  <>
    <Box sx={{minHeight: '100vh', display: 'flex', flexDirection: 'column'}}>
      <ResponsiveAppBarBad />
      {props.children}
    </Box>
  </>
);

export default LayoutDefault;