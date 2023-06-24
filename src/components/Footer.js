import { Box } from "@mui/system";
import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <Box className="footer">
      <Box>
        <img src="logodark.png" alt="myKart-icon"></img>
      </Box>
      <p className="footer-text">
        MyKart is your one stop solution to the buy the latest trending items
        with India's Fastest Delivery to your doorstep
      </p>
    </Box>
  );
};

export default Footer;
