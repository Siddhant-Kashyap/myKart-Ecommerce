import {
  AddOutlined,
  RemoveOutlined,
  ShoppingCart,
  ShoppingCartOutlined
  
} from "@mui/icons-material";
import { Button, IconButton, Stack,Typography } from "@mui/material";
import { Box } from "@mui/system";
import React from "react";
import { useHistory } from "react-router-dom";
import "./Cart.css";


export const generateCartItemsFrom = (cartData, productsData) => {
  if(!cartData) return ;
  const nextCart = cartData.map((item) => (
    {...item,
    ...productsData.find((product)=>item.productId === product._id)}
    ))
  return nextCart
};


export const getTotalCartValue = (items = []) => {
  if(!items.length) return 0
  const total = items
    .map(item => item.cost * item.qty)
    .reduce((total,n)=>total + n)
  return total
};



export const getTotalItems = (items = []) => {
  if(!items.length) return null;
  const totalItems = items
    .map(item => item.qty)
    .reduce((total,n)=>total + n)
  return totalItems

};



const ItemQuantity = ({
  value,
  handleAdd,
  handleDelete,
}) => {
  
  return (
    <Stack direction="row" alignItems="center">
      <IconButton size="small" color="primary" onClick={handleDelete}>
        <RemoveOutlined />
      </IconButton>
      <Box padding="0.5rem" data-testid="item-qty">
        {value}
      </Box>
      <IconButton size="small" color="primary" onClick={handleAdd}>
        <AddOutlined />
      </IconButton>
    </Stack>
  );
};


const Cart = ({
  isReadOnly,
  products,
  items = [],
  handleQuantity
}) => {
  const token = localStorage.getItem("token");
  const history = useHistory();
  if (!items.length) {
    return (
      <Box className="cart empty">
        <ShoppingCartOutlined className="empty-cart-icon" />
        <Box color="#aaa" textAlign="center">
          Cart is empty. Add more items to the cart to checkout.
        </Box>
      </Box>
    );
  }

  return (
    <>
    <Box className = "container-cart">
      <Box className="cart">
        {/* TODO: CRIO_TASK_MODULE_CART - Display view for each cart item with non-zero quantity */}
        {items.map(item => 
        
        <Box key = {item.productId}>
          {item.qty > 0 ?
          <Box display="flex" alignItems="flex-start" padding="1rem" >
              <Box className="image-container">
                  <img
                      // Add product image
                      src= {item.image}
                      // Add product name as alt text
                      alt={item.name}
                      width="100%"
                      height="100%"
                  />
              </Box>
              <Box
                  display="flex"
                  flexDirection="column"
                  justifyContent="space-between"
                  height="6rem"
                  paddingX="1rem"
              >
                  <Box fontSize="0.8rem">{item.name}</Box>
                  <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                  >
                  {!isReadOnly ? 
                    <ItemQuantity
                    // Add required props by checking implementation
                    value = {item.qty} 
                    handleAdd = {async()=> 
                      await handleQuantity(
                        token,
                        item.productId,
                        items,
                        item.qty + 1,
                        true)}
                    handleDelete = {async()=> 
                      await handleQuantity(
                        token,
                        item.productId,
                        items,
                        item.qty - 1,
                        true)}
                      /> : 
                      <Box>Qty: {item.qty}</Box>}
                
                  <Box padding="0.5rem" fontWeight="700">
                      ${item.cost}
                  </Box>
                  </Box>
              </Box>
          </Box>:null }
        
        </Box>  
        )}
        
        <Box
          padding="1rem"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box color="#3C3C3C" alignSelf="center">
            Order total
          </Box>
          <Box
            color="#3C3C3C"
            fontWeight="700"
            fontSize="1.5rem"
            alignSelf="center"
            data-testid="cart-total"
          >
            ${getTotalCartValue(items)}
          </Box>
        </Box>
        
        {!isReadOnly ? 
        <Box display="flex" justifyContent="flex-end" className="cart-footer">
          
          <Button
          color="primary"
          variant="contained"
          startIcon={<ShoppingCart />}
          className="checkout-btn"
          onClick = {()=>history.push("/checkout")}
        >
          Checkout
        </Button> 
        </Box>: null }
      </Box>
      {isReadOnly ? 
        <Box className = "cart">
              <>
                <Typography padding="1rem" variant="h6">Order Details</Typography>
                <Box
                  padding="0.5rem 1rem"
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center">
                  <Box color="#3C3C3C" alignSelf="center">
                    Products
                  </Box>
                  <Box
                    color="#3C3C3C"
                    alignSelf="center"
                    data-testid="cart-total"
                   >
                    {getTotalItems(items)}
                  </Box>
                </Box>
                <Box
                  padding="0.5rem 1rem"
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center">
                  <Box color="#3C3C3C" alignSelf="center">
                    Subtotal
                  </Box>
                  <Box
                    color="#3C3C3C"
                    alignSelf="center"
                    data-testid="cart-total"
                   >
                    ${getTotalCartValue(items)}
                  </Box>
                </Box>
                <Box
                  padding="0.5rem 1rem"
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center">
                  <Box color="#3C3C3C" alignSelf="center">
                    Shipping Charges
                  </Box>
                  <Box
                    color="#3C3C3C"
                    alignSelf="center"
                    data-testid="cart-total"
                   >
                    $0
                  </Box>
                </Box>
                <Box
                  padding="0.5rem 1rem"
                  display="flex"
                  fontWeight= "700"
                  justifyContent="space-between"
                  alignItems="center">
                  <Box color="#3C3C3C" alignSelf="center">
                    Total
                  </Box>
                  <Box
                    color="#3C3C3C"
                    alignSelf="center"
                    data-testid="cart-total"
                    fontWeight= "700"
                   >
                    ${getTotalCartValue(items)}
                  </Box>
                </Box>
              </>
        </Box>:null}
      </Box>
    </>
  );
};

export default Cart;
