import React, { Fragment } from 'react';
import { Route } from 'react-router';
import ResponsiveAppBar from './components/ResponsiveAppBar';

const LayoutDefault = (props: any) => (
  <>
    <ResponsiveAppBar />
    {props.children}
  </>
);

export default LayoutDefault;