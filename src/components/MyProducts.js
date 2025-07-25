import React, { useContext, useEffect, useState } from 'react';
import Spinner from './Spinner';
import { useNavigate } from "react-router-dom";
import { Modal, Button } from 'react-bootstrap';
import alertContext from '../context/alert/alertContext';

const MyProducts = () => {
    const { showAlert } = useContext(alertContext);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editFields, setEditFields] = useState({});
    const [updateLoading, setUpdateLoading] = useState(false);
    const [updateError, setUpdateError] = useState(null);
    const navigate = useNavigate();
    const [addFields, setAddFields] = useState({
        title: "",
        price: "",
        description: "",
        category: "",
        image: "",
        stock: ""
    });
    const [addLoading, setAddLoading] = useState(false);
    const [addError, setAddError] = useState(null);
    const [addSuccess, setAddSuccess] = useState(null);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => {
        const fetchMyProducts = async () => {
            try {
                const res = await fetch('/api/products/my', {
                    headers: {
                        'auth-token': localStorage.getItem('token')
                    }
                });
                const data = await res.json();
                if (data.success) {
                    const sortedProducts = data.data.sort((a, b) =>
                        new Date(b.createdAt) - new Date(a.createdAt)
                    );
                    setProducts(sortedProducts);
                } else {
                    setError(data.error || "Failed to fetch products.");
                }
            }
            catch (err) {
                console.error("Error fetching your products:", err.message);
                setError("Something went wrong. Please try again later.");
            }
            finally {
                setLoading(false);
            }
        };

        fetchMyProducts();
    }, []);

    const handleEditClick = (product) => {
        setEditingId(product._id);
        setEditFields({
            title: product.title,
            price: product.price,
            description: product.description,
            category: product.category,
            image: product.image,
            stock: product.stock
        });
        setUpdateError(null);
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditFields(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleUpdate = async (id) => {
        setUpdateLoading(true);
        setUpdateError(null);
        try {
            const res = await fetch(`/api/products/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "auth-token": localStorage.getItem("token")
                },
                body: JSON.stringify(editFields)
            });
            const data = await res.json();
            if (data.success) {
                setProducts(products.map(p => p._id === id ? data.data : p));
                setEditingId(null);
                showAlert("Product updated successfully!", "success");
            } else {
                setUpdateError(data.error || "Failed to update product.");
                showAlert(data.error || "Failed to update product.", "danger");
            }
        } catch (err) {
            setUpdateError("Something went wrong. Please try again.");
            showAlert("Something went wrong. Please try again.", "danger");
        } finally {
            setUpdateLoading(false);
        }
    };

    const handleAddChange = (e) => {
        const { name, value } = e.target;
        setAddFields(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        setAddLoading(true);
        setAddError(null);
        setAddSuccess(null);
        try {
            const res = await fetch('/api/products', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "auth-token": localStorage.getItem("token")
                },
                body: JSON.stringify({
                    ...addFields,
                    price: Number(addFields.price),
                    stock: Number(addFields.stock)
                })
            });
            const data = await res.json();
            if (data.success) {
                setProducts([data.data, ...products]);
                setAddSuccess("Product added successfully!");
                setAddFields({
                    title: "",
                    price: "",
                    description: "",
                    category: "",
                    image: "",
                    stock: ""
                });
            } else if (data.errors && Array.isArray(data.errors)) {
                setAddError(data.errors.map(e => e.msg).join(", "));
            } else {
                setAddError(data.error || "Failed to add product.");
            }
        } catch (err) {
            setAddError("Something went wrong. Please try again.");
        } finally {
            setAddLoading(false);
        }
    };

    const handleDeleteClick = (product) => {
        setProductToDelete(product);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!productToDelete) return;
        setDeleteLoading(true);
        try {
            const res = await fetch(`/api/products/${productToDelete._id}`, {
                method: "DELETE",
                headers: {
                    'auth-token': localStorage.getItem('token')
                }
            });
            const data = await res.json();
            if (data.success) {
                setProducts(products.filter(p => p._id !== productToDelete._id));
                setShowDeleteModal(false);
                setProductToDelete(null);
                showAlert("Product deleted successfully!", "success");
            } else {
                setError(data.error || "Failed to delete product.");
                showAlert(data.error || "Failed to delete product.", "danger");
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
            showAlert("Something went wrong. Please try again.", "danger");
        } finally {
            setDeleteLoading(false);
        }
    };

    if (loading) {
        return <Spinner />;
    }

    if (error) {
        return <div className="alert alert-danger">{error}</div>;
    }

    return (
        <div className="container mt-4">
            <h2 className="mb-4 fw-bold">My Products</h2>
            {/* Add Product Form */}
            <div className="card mb-4 shadow-lg rounded-4 border-0 p-4">
                <h3 className="mb-3">Add New Product</h3>
                <form onSubmit={handleAddProduct}>
                    <div className="row">
                        <div className="col-md-6 mb-2">
                            <input
                                type="text"
                                name="title"
                                value={addFields.title}
                                onChange={handleAddChange}
                                className="form-control rounded-pill shadow-sm"
                                placeholder="Title"
                                required
                                minLength={3}
                            />
                        </div>
                        <div className="col-md-3 mb-2">
                            <input
                                type="number"
                                name="price"
                                value={addFields.price}
                                onChange={handleAddChange}
                                className="form-control rounded-pill shadow-sm"
                                placeholder="Price"
                                required
                                min={0}
                                step="0.01"
                            />
                        </div>
                        <div className="col-md-3 mb-2">
                            <input
                                type="number"
                                name="stock"
                                value={addFields.stock}
                                onChange={handleAddChange}
                                className="form-control rounded-pill shadow-sm"
                                placeholder="Stock"
                                required
                                min={0}
                            />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-4 mb-2">
                            <input
                                type="text"
                                name="category"
                                value={addFields.category}
                                onChange={handleAddChange}
                                className="form-control rounded-pill shadow-sm"
                                placeholder="Category"
                                required
                            />
                        </div>
                        <div className="col-md-8 mb-2">
                            <input
                                type="text"
                                name="image"
                                value={addFields.image}
                                onChange={handleAddChange}
                                className="form-control rounded-pill shadow-sm"
                                placeholder="Image URL"
                                required
                            />
                        </div>
                    </div>
                    <div className="mb-2">
                        <textarea
                            name="description"
                            value={addFields.description}
                            onChange={handleAddChange}
                            className="form-control rounded-4 shadow-sm"
                            placeholder="Description"
                            required
                            minLength={10}
                        />
                    </div>
                    {addError && <div className="alert alert-danger">{addError}</div>}
                    {addSuccess && <div className="alert alert-success">{addSuccess}</div>}
                    <button
                        type="submit"
                        className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm"
                        disabled={addLoading}
                    >
                        {addLoading ? "Adding..." : "Add Product"}
                    </button>
                </form>
            </div>
            {products.length === 0 ? (
                <div className="alert alert-info text-center fs-5 my-5 rounded-3 shadow-sm">
                    No products found.
                </div>
            ) : (
                <div className="col">
                    {products.map(product => (
                        <div key={product._id} className="row-md-6 mb-4 d-flex">
                            <div
                                className="card w-100 shadow-lg rounded-4 border-0"
                                style={{
                                    minWidth: "100%",
                                    maxWidth: "100%"
                                }}
                            >
                                <div className="row g-0 align-items-center h-100 p-3">
                                    <div className="col-md-4 d-flex justify-content-center align-items-center
                                    ">
                                        <img
                                            src={product.image}
                                            className="img-fluid rounded-4 shadow-sm bg-light"
                                            alt={product.title}
                                            style={{ maxHeight: "210px", objectFit: "contain" }}
                                        />
                                    </div>
                                    <div className="col-md-8 h-100">
                                        <div className="card-body d-flex flex-column justify-content-between">
                                            <div>
                                                {editingId === product._id ? (
                                                    <>
                                                        <input
                                                            type="text"
                                                            name="title"
                                                            value={editFields.title}
                                                            onChange={handleEditChange}
                                                            className="form-control mb-2 rounded-pill shadow-sm"
                                                            placeholder="Title"
                                                        />
                                                        <input
                                                            type="number"
                                                            name="price"
                                                            value={editFields.price}
                                                            onChange={handleEditChange}
                                                            className="form-control mb-2 rounded-pill shadow-sm"
                                                            placeholder="Price"
                                                        />
                                                        <input
                                                            type="text"
                                                            name="category"
                                                            value={editFields.category}
                                                            onChange={handleEditChange}
                                                            className="form-control mb-2 rounded-pill shadow-sm"
                                                            placeholder="Category"
                                                        />
                                                        <input
                                                            type="text"
                                                            name="image"
                                                            value={editFields.image}
                                                            onChange={handleEditChange}
                                                            className="form-control mb-2 rounded-pill shadow-sm"
                                                            placeholder="Image URL"
                                                        />
                                                        <input
                                                            type="number"
                                                            name="stock"
                                                            value={editFields.stock}
                                                            onChange={handleEditChange}
                                                            className="form-control mb-2 rounded-pill shadow-sm"
                                                            placeholder="Stock"
                                                        />
                                                        <textarea
                                                            name="description"
                                                            value={editFields.description}
                                                            onChange={handleEditChange}
                                                            className="form-control mb-2 rounded-4 shadow-sm"
                                                            placeholder="Description"
                                                        />
                                                        {updateError && <div className="alert alert-danger">{updateError}</div>}
                                                        <div className='mt-3'>
                                                            <button
                                                                className="btn btn-success me-2 rounded-pill px-4 shadow-sm"
                                                                onClick={() => handleUpdate(product._id)}
                                                                disabled={updateLoading}
                                                            >
                                                                {updateLoading ? "Updating..." : "Save"}
                                                            </button>
                                                            <button
                                                                className="btn btn-secondary rounded-pill px-4 shadow-sm"
                                                                onClick={() => setEditingId(null)}
                                                                disabled={updateLoading}
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <h5 className="card-title text-primary fw-bold">{product.title}</h5>
                                                        <p className="card-text text-success fw-semibold">${product.price}</p>
                                                        <p className="card-text">{product.description}</p>
                                                    </>
                                                )}
                                            </div>
                                            <div className='mt-2'>
                                                {editingId !== product._id && (
                                                    <button
                                                        className="btn btn-outline-warning mt-2 align-self-start me-2 rounded-pill px-3 shadow-sm"
                                                        onClick={() => handleEditClick(product)}
                                                    >
                                                        Update Product
                                                    </button>
                                                )}
                                                {editingId !== product._id && (
                                                    <button
                                                        className="btn btn-outline-primary mt-2 align-self-start me-2 rounded-pill px-3 shadow-sm"
                                                        onClick={() => navigate(`/product/${product._id}`)}
                                                    >
                                                        View Product
                                                    </button>
                                                )}
                                                {editingId !== product._id && (
                                                    <button
                                                        className="btn btn-outline-danger mt-2 align-self-start rounded-pill px-3 shadow-sm"
                                                        onClick={() => handleDeleteClick(product)}
                                                    >
                                                        Delete Product
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {productToDelete && (
                        <>
                            <p>Are you sure you want to delete this product?</p>
                            <div className="alert alert-warning">
                                <strong>Product:</strong> {productToDelete.title}<br />
                                <strong>Price:</strong> ${productToDelete.price}<br />
                                <strong>Category:</strong> {productToDelete.category}
                            </div>
                            <p className="text-danger mb-0">This action cannot be undone.</p>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Cancel
                    </Button>
                    <Button
                        variant="danger"
                        onClick={confirmDelete}
                        disabled={deleteLoading}
                    >
                        {deleteLoading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Deleting...
                            </>
                        ) : 'Delete Product'}
                    </Button>
                </Modal.Footer>
            </Modal>

            {products.length === 0 ? (
                <div className="alert alert-info text-center fs-5 my-5 rounded-3 shadow-sm">
                    No products found.
                </div>
            ) : (
                <div className="col">
                    {products.map(product => (
                        <div key={product._id} className="row-md-6 mb-4 d-flex">
                            <div
                                className="card w-100 shadow-lg rounded-4 border-0"
                                style={{
                                    minWidth: "100%",
                                    maxWidth: "100%"
                                }}
                            >
                                <div className="row g-0 align-items-center h-100 p-3">
                                    <div className="col-md-4 d-flex justify-content-center align-items-center
                                    ">
                                        <img
                                            src={product.image}
                                            className="img-fluid rounded-4 shadow-sm bg-light"
                                            alt={product.title}
                                            style={{ maxHeight: "210px", objectFit: "contain" }}
                                        />
                                    </div>
                                    <div className="col-md-8 h-100">
                                        <div className="card-body d-flex flex-column justify-content-between">
                                            <div>
                                                {editingId === product._id ? (
                                                    <>
                                                        <input
                                                            type="text"
                                                            name="title"
                                                            value={editFields.title}
                                                            onChange={handleEditChange}
                                                            className="form-control mb-2 rounded-pill shadow-sm"
                                                            placeholder="Title"
                                                        />
                                                        <input
                                                            type="number"
                                                            name="price"
                                                            value={editFields.price}
                                                            onChange={handleEditChange}
                                                            className="form-control mb-2 rounded-pill shadow-sm"
                                                            placeholder="Price"
                                                        />
                                                        <input
                                                            type="text"
                                                            name="category"
                                                            value={editFields.category}
                                                            onChange={handleEditChange}
                                                            className="form-control mb-2 rounded-pill shadow-sm"
                                                            placeholder="Category"
                                                        />
                                                        <input
                                                            type="text"
                                                            name="image"
                                                            value={editFields.image}
                                                            onChange={handleEditChange}
                                                            className="form-control mb-2 rounded-pill shadow-sm"
                                                            placeholder="Image URL"
                                                        />
                                                        <input
                                                            type="number"
                                                            name="stock"
                                                            value={editFields.stock}
                                                            onChange={handleEditChange}
                                                            className="form-control mb-2 rounded-pill shadow-sm"
                                                            placeholder="Stock"
                                                        />
                                                        <textarea
                                                            name="description"
                                                            value={editFields.description}
                                                            onChange={handleEditChange}
                                                            className="form-control mb-2 rounded-4 shadow-sm"
                                                            placeholder="Description"
                                                        />
                                                        {updateError && <div className="alert alert-danger">{updateError}</div>}
                                                        <div className='mt-3'>
                                                            <button
                                                                className="btn btn-success me-2 rounded-pill px-4 shadow-sm"
                                                                onClick={() => handleUpdate(product._id)}
                                                                disabled={updateLoading}
                                                            >
                                                                {updateLoading ? "Updating..." : "Save"}
                                                            </button>
                                                            <button
                                                                className="btn btn-secondary rounded-pill px-4 shadow-sm"
                                                                onClick={() => setEditingId(null)}
                                                                disabled={updateLoading}
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <h5 className="card-title text-primary fw-bold">{product.title}</h5>
                                                        <p className="card-text text-success fw-semibold">${product.price}</p>
                                                        <p className="card-text">{product.description}</p>
                                                    </>
                                                )}
                                            </div>
                                            <div className='mt-2'>
                                                {editingId !== product._id && (
                                                    <button
                                                        className="btn btn-outline-warning mt-2 align-self-start me-2 rounded-pill px-3 shadow-sm"
                                                        onClick={() => handleEditClick(product)}
                                                    >
                                                        Update Product
                                                    </button>
                                                )}
                                                {editingId !== product._id && (
                                                    <button
                                                        className="btn btn-outline-primary mt-2 align-self-start me-2 rounded-pill px-3 shadow-sm"
                                                        onClick={() => navigate(`/product/${product._id}`)}
                                                    >
                                                        View Product
                                                    </button>
                                                )}
                                                {editingId !== product._id && (
                                                    <button
                                                        className="btn btn-outline-danger mt-2 align-self-start rounded-pill px-3 shadow-sm"
                                                        onClick={() => handleDeleteClick(product)}
                                                    >
                                                        Delete Product
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyProducts;