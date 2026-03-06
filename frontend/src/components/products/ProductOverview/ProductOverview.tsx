import { AxiosError } from 'axios';
import { PRODUCTS_CONSTANTS } from 'constants/productsConstants';
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById } from 'service/authService';
import type { IProductResponse } from '../../../types/IProduct';
import { parsedError } from 'util/errorHandler';
import ProductCard from '../ProductCard/ProductCard';
import ProductDetailsInfo from '../ProductDetailsInfo/ProductDetailsInfo';


function ProductOverview() {

  const { id } = useParams<{id:string}>()
  const navigate = useNavigate()
  const [product, setProduct] = useState<IProductResponse | null>(null);
  const [apiError, setApiError] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
   if (!id) {
      setProduct(null);
      setError(null);
      setIsLoading(false);
      return;
    }
    fetchProductDetails(id);
  },[id])

  async function fetchProductDetails(id:string){
    try {

      setIsLoading(true);
      setError(null);
      const response = await getProductById(id);
      setProduct(response.data || null);
      setIsLoading(false);

    } catch (error) {
      setIsLoading(false);
      setApiError(undefined);
      const parsed = parsedError(error);
      if(parsed && parsed.message){
        setApiError(parsed.message)
        setError(parsed.message);
      }
      
    }
  }

  const handleBackToDashboard = () => {
    navigate(PRODUCTS_CONSTANTS.ROUTES.DASHBOARD);
  }

  if(isLoading) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">{PRODUCTS_CONSTANTS.ACCESSIBILITY.LOADING_STATUS}</span>
          </div>
          <div className="mt-2">{PRODUCTS_CONSTANTS.MESSAGES.LOADING}</div>
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
            {PRODUCTS_CONSTANTS.MESSAGES.TRY_AGAIN}
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center">
          <h4 className="text-muted">{PRODUCTS_CONSTANTS.MESSAGES.PRODUCT_NOT_FOUND}</h4>
          <button className="btn btn-primary mt-3" onClick={handleBackToDashboard}>
            {PRODUCTS_CONSTANTS.LABELS.BACK_TO_DASHBOARD}
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
              {PRODUCTS_CONSTANTS.LABELS.BACK_TO_DASHBOARD}
            </button>
          </div>
          <div>
            <h1 className="h3 mb-3">{PRODUCTS_CONSTANTS.LABELS.PRODUCT_DETAILS}</h1>
          </div>

          <div className="row g-4">
            <div className="col-md-6 producDetailsWidth">
              <ProductCard product={product} />
            </div>
            
            <ProductDetailsInfo product={product} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductOverview