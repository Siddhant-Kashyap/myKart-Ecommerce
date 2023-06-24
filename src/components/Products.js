import { Search, SentimentDissatisfied} from "@mui/icons-material";
import {
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import "./Products.css";
import ProductCard from "./ProductCard"
import Cart from "./Cart"

import generateCartItemsFrom from "./Cart"

// Definition of Data Structures used
/**
 * @typedef {Object} Product - Data on product available to buy
 * 
 * @property {string} name - The name or title of the product


/**
 * @typedef {Object} CartItem -  - Data on product added to cart
 * 
 * @property {string} name - The name or title of the product in cart
 * @property {string} qty - The quantity of product added to cart
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
 * @property {string} _id - Unique ID for the product
 */


const Products = () => {
  const token = localStorage.getItem("token");
  const { enqueueSnackbar } = useSnackbar();
  const [products, setProducts] = useState([]);
  const [searchProducts, setSearchProducts] = useState([]);
  const [waiting, setWaiting] = useState(false);
  const [searchKey,setSearchKey] = useState("");
  const [productFound, setProductFound] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [productsCart,setProductsCart] = useState([])

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Fetch products data and store it
  /**
   * Make API call to get the products list and store it to display the products
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on all available products
   *
   * API endpoint - "GET /products"
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "name": "iPhone XR",
   *          "category": "Phones",
   *          "cost": 100,
   *          "rating": 4,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "v4sLtEcMpzabRyfx"
   *      },
   *      {
   *          "name": "Basketball",
   *          "category": "Sports",
   *          "cost": 100,
   *          "rating": 5,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "upLK9JbQ4rMhTwt4"
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 500
   * {
   *      "success": false,
   *      "message": "Something went wrong. Check the backend console for more details"
   * }
   */
  const performAPICall = async (search) => {
    try{
      setWaiting(true)
      const response = search ? 
        await axios.get(`${config.endpoint}/products/search?value=${search}`) :
        await axios.get(`${config.endpoint}/products`)
      const data = response.data
      setWaiting(false)
      setProductFound(true)
      console.log("Perform API call")
      if(!search) setSearchProducts(data)
      search ? setSearchProducts(data) : setProducts(data)
    }
    catch(e){
      if(e.response && e.response.status === 400){
        return enqueueSnackbar(e.response.data.message,{
          variant: 'error'
        });
      }
      else{
        setWaiting(false)
        setProductFound(false)
      }
    }
  };

  const generateCartItemsFrom = (cartData, productsData) => {
    if(!cartData) return ;
    const nextCart = cartData.map((item) => (
      {...item,
      ...productsData.find((product)=>item.productId === product._id)}
      ))
    return nextCart
  };


  useEffect(() => {
    fetchCart(token)
      .then((cartData) => generateCartItemsFrom(cartData,products))
      .then((cartItems) => {
        setProductsCart(cartItems)});  
  },[products])

  useEffect(() => {
    performAPICall();
    checkLoggedIn();
  },[])


  useEffect(() => {
    performAPICall(searchKey);
  },[searchKey])

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Implement search logic
  /**
   * Definition for search handler
   * This is the function that is called on adding new search keys
   *
   * @param {string} text
   *    Text user types in the search bar. To filter the displayed products based on this text.
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on filtered set of products
   *
   * API endpoint - "GET /products/search?value=<search-query>"
   *
   */
  const performSearch = async (text) => {
    performAPICall(searchKey)
  };

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Optimise API calls with debounce search implementation
  /**
   * Definition for debounce handler
   * With debounce, this is the function to be called whenever the user types text in the searchbar field
   *
   * @param {{ target: { value: string } }} event
   *    JS event object emitted from the search input field
   *
   * @param {NodeJS.Timeout} debounceTimeout
   *    Timer id set for the previous debounce call
   *
   */
  const debounceSearch = (event, debounceTimeout) => {
    //Update searchKey if no typing during 1s 
    setTimeout(() => setSearchKey(event.target.value),500)
  };

  const checkLoggedIn = () => {
    if(localStorage.getItem("token")) setIsLoggedIn(true)
  }

  const fetchCart = async(token) => {
    if(!token) return;
    try{
      const response = await axios.get(`${config.endpoint}/cart`,{
        headers:{
          Authorization : `Bearer ${token}`        }
      })
      return response.data
    }
    catch(e){
        enqueueSnackbar('Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON',{
          variant: 'error'
        });
        return null
      }
  }

  const isItemCart = (productsCart,productId)=>{
    return productsCart.findIndex((item)=>item.productId === productId) !== -1
  }

  const addToCart = async(token,productId,productsCart,quantity,addquantity) => {
    if(!token){
      enqueueSnackbar('Please log in to add item to cart',{variant: 'warning'})
      return;
    }
    if(!addquantity && isItemCart(productsCart,productId)){
      enqueueSnackbar('Item already in cart. Use the cart sidebar to update quantity or remove item.',
      {variant: 'warning'})
      return;
    }
    try{
      const response = await axios.post(`${config.endpoint}/cart`,
      {productId,qty:quantity},
      {headers:{Authorization : `Bearer ${token}`}}
      )
      const cartItems = generateCartItemsFrom(response.data,products)
      setProductsCart(cartItems)
    }
    catch(e){
        enqueueSnackbar('Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON',{
          variant: 'error'
        });
        return null
      }
  }
  

  return (
    <div>
      <Header 
      children =  {
        <TextField
          className="search-desktop"
          size="small"
          style ={{width: '30%'}}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Search color="primary" />
              </InputAdornment>
            ),
          }}
          placeholder="Search for items/categories"
          name="search"
          onChange = {debounceSearch}
        />
      }
      >
        {/* TODO: CRIO_TASK_MODULE_PRODUCTS - Display search bar in the header for Products page */}

      </Header>

      {/* Search view for mobiles */}
      <TextField
        className="search-mobile"
        size="small"
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Search color="primary" />
            </InputAdornment>
          ),
        }}
        placeholder="Search for items/categories"
        name="search"
        onChange = {debounceSearch}
      />
       <Grid container>

        <Grid item xs md>

          <Grid item className="product-grid">
            <Box className="hero">
              <p className="hero-heading">
               
              </p>
            </Box>
          </Grid>
         
          <Grid 
              container spacing = {2} 
              mt={2} 
              mb={2} 
              display = "flex" alignItems = "center" justifyContent = "center">
              {
              waiting ? 
                <Box className = "loading">
                    <CircularProgress /> 
                    <p>Loading Products...</p>
                </Box> : productFound ?
                        searchProducts.map(product => (
                            <Grid item xs = {12} sm={6} md={4} lg={3} xl = {2} key ={product._id} sx={{ Width: '100%' }}
                            display = "flex" alignItems = "center" justifyContent = "center">
                              <ProductCard 
                                product = {product}
                                handleAddToCart = {()=>addToCart(token,product._id,productsCart,1)}
                                />
                            </Grid> 
                        )) :
                        <Box className = "loading">
                          <SentimentDissatisfied color = "action" /> 
                          <p>No products found...</p>
                        </Box>        
              }
            </Grid>

       </Grid>

       {isLoggedIn ? (
         <Grid item xs={12} md={3} bgcolor = "#E9F5E1">
           <Cart products = {products} items = {productsCart} handleQuantity = {addToCart}  />
         </Grid>
       ) : null}
       
      </Grid>
      <Footer />
    </div>
  );
};

export default Products;
