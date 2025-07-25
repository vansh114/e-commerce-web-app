import { useState } from "react";
import productContext from "./productContext";

const ProductState = (props) => {

  const [allProducts, setAllProducts] = useState([]);
  const [product, setProduct] = useState({});
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async (search, page = 1, limit = 20, category, sort, minPrice, maxPrice) => {
    try {
      setLoading(true);
      let query = `?page=${page}&limit=${limit}`;
      if (search) query += `&search=${encodeURIComponent(search)}`;
      if (category) query += `&category=${encodeURIComponent(category)}`;
      if (sort) query += `&sort=${encodeURIComponent(sort)}`;
      if (minPrice) query += `&minPrice=${minPrice}`;
      if (maxPrice) query += `&maxPrice=${maxPrice}`;

      const response = await fetch(`/api/products${query}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      setAllProducts(data.products);
      setTotal(data.total);
      setPage(data.page);
      setPages(data.pages);
    } catch (err) {
      console.error("API fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (title, description, price, category) => {
    const response = await fetch(`/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'auth-token': localStorage.getItem('token')
      },
      body: JSON.stringify({ title, description, price, category })
    });
    const newProduct = await response.json();
    console.log("Adding a new product:", newProduct);
    setAllProducts(allProducts.concat(newProduct));
  };
 
  const deleteProduct = async (id) => {
    console.log("Deleting the product with id", id);
    const response = await fetch(`/api/products/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'auth-token': localStorage.getItem('token')
      }
    });
    const json = await response.json();
    console.log("Delete response:", json);
    const newProducts = allProducts.filter((product) => product._id !== id);
    setAllProducts(newProducts);
  };

  const editProduct = async (id, title, description, price, category) => {
    const response = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'auth-token': localStorage.getItem('token')
      },
      body: JSON.stringify({ title, description, price, category })
    });
    const json = await response.json();
    console.log("Edit response:", json);

    let newProducts = [...allProducts];
    for (let i = 0; i < newProducts.length; i++) {
      if (newProducts[i]._id === id) {
        newProducts[i].title = title;
        newProducts[i].description = description;
        newProducts[i].price = price;
        newProducts[i].category = category;
        break;
      }
    }
    setAllProducts(newProducts);
  };

  const fetchProduct = async (id) => {
    if (id) {
      try {
        setLoading(true);
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();
        setProduct(data.data);
      }
      catch (err) {
        console.error("Failed to fetch product:", err);
      }
      finally {
        setLoading(false);
      }
    }
  };

  return (
    <productContext.Provider value={{
      product,
      setProduct,
      allProducts,
      addProduct,
      fetchProducts,
      fetchProduct,
      deleteProduct,
      editProduct,
      loading,
      setLoading
    }}>
      {props.children}
    </productContext.Provider>
  );
};

export default ProductState;