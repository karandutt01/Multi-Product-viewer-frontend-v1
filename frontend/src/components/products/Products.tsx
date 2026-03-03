import { AxiosError } from 'axios';
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById } from 'service/authService';
import { IProductResponse } from 'types/IProductResponse';
import { parsedError } from 'util/errorHandler';

function Products() {

  const { id } = useParams<{id:string}>()
  const navigate = useNavigate()
  const [product, setProduct] = useState<IProductResponse | null>(null);
  const [apiError, setApiError] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    if (id) {
      fetchProductDetails(id);
    }
  },[id])

  async function fetchProductDetails(id:string){
    try {
      const response = await getProductById(id);
      setProduct(response.data || null);

    } catch (error) {

      setApiError(undefined);
      const parsed = parsedError(error);
      if(parsed.message){
        setApiError(parsed.message)
      }
      
    }
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  if(isLoading) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <div className="mt-2">Loading product details...</div>
        </div>
      </div>
    );
  }

  if(error) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger" role="alert">
          <div className="d-flex align-items-center">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            <span>{error}</span>
          </div>
          <button 
            className="btn btn-outline-danger btn-sm mt-2" 
            onClick={() => fetchProductDetails(id!)}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center">
          <h4 className="text-muted">Product not found</h4>
          <button className="btn btn-primary mt-3" onClick={handleBackToDashboard}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex align-items-center mb-4">
            <button 
              className="btn btn-outline-light me-3" 
              onClick={handleBackToDashboard}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Back to Dashboard
            </button>
            <h1 className="h3 mb-0">Product Details</h1>
          </div>

          <div className="row">
            <div className="col-md-6">
              {product.imageUrl && (
                <div className="card">
                  <img 
                    src={product.imageUrl} 
                    className="card-img-top" 
                    alt={product.title}
                    style={{ height: '400px', objectFit: 'cover' }}
                  />
                </div>
              )}
            </div>
            
            <div className="col-md-6">
              <div className="card h-100">
                <div className="card-body">
                  <div className="mb-3">
                    <h5>Product Title</h5>
                    <h2 className="card-title">{product.title}</h2>
                  </div>

                   <div className="mb-3">
                    <h5>Product price</h5>
                    <h3 className="text-primary mb-3">${product.price}</h3>
                  </div>
                  
                  <div className="mb-4">
                    <h5>Description</h5>
                    <p className="text-muted">{product.productDesc}</p>
                  </div>

                  <div className="mb-3">
                    <small className="text-muted">
                      Product ID: {product.id}
                    </small>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Products