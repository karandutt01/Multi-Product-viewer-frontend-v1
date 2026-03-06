import React from 'react';
import { PRODUCTS_CONSTANTS } from '../../../constants/productsConstants';
import type { IProductDetailsInfoProps } from '../../../types/IProduct';



const ProductDetailsInfo: React.FC<IProductDetailsInfoProps> = ({ 
  product, 
  className = "col-md-6" 
}) => {
  return (
    <div className={className}>
      <div className="card h-100">
        <div className="card-body">
          <div className="mb-3">
            <h5 className="text-muted mb-2">{PRODUCTS_CONSTANTS.LABELS.PRODUCT_TITLE}</h5>
            <h2 className="card-title">{product.title}</h2>
          </div>

          <div className="mb-3">
            <h5 className="text-muted mb-2">{PRODUCTS_CONSTANTS.LABELS.PRODUCT_PRICE}</h5>
            <h3 className="text-primary mb-3">${product.price}</h3>
          </div>
          
          <div className="mb-4">
            <h5 className="text-muted mb-2">{PRODUCTS_CONSTANTS.LABELS.DESCRIPTION}</h5>
            <p className="text-muted">{product.productDesc}</p>
          </div>

          <div className="mb-3">
            <small className="text-muted">
              {PRODUCTS_CONSTANTS.LABELS.PRODUCT_ID}: {product.id}
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsInfo;