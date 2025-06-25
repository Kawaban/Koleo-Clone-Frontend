import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './LoginPage.css';

import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";

const LoginPage = () => {
  const { loginWithRedirect, isAuthenticated } = useAuth0();

  useEffect(() => {
    if (!isAuthenticated) {
      loginWithRedirect();
    }
  }, [isAuthenticated, loginWithRedirect]);

  return <p>Redirecting to login...</p>;
};

export default LoginPage;