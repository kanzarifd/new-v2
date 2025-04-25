import React from 'react';
const ForgotPassword = React.lazy(() => import('../pages/ForgotPassword'));

const forgotPasswordRoute = {
  path: '/forgot-password',
  element: <ForgotPassword />,
};

export default forgotPasswordRoute;
