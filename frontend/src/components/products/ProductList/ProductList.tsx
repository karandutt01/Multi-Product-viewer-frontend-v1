import React from 'react';
import ProductCard from '../ProductCard/ProductCard';
import type { IProductResponse } from '../../../types/IProduct';
import { DASHBOARD_CONSTANTS } from '../../../constants/dashboardConstants';
import type { ProductsListProps } from '../../../types/IProduct';



const ProductsList: React.FC<ProductsListProps> = ({
  products,
  onProductClick,
  onProductKeyDown,
  onAddProduct
}) => {
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h4 mb-0">{DASHBOARD_CONSTANTS.LABELS.YOUR_PRODUCTS} ({products.length})</h2>
        <button
          className="btn btn-primary"
          onClick={onAddProduct}
        >
          <i className="bi bi-plus-circle me-2"></i>
          {DASHBOARD_CONSTANTS.LABELS.ADD_PRODUCT}
        </button>
      </div>

      <div className="row">
        {products?.map((product: IProductResponse) => (
          <div key={product.id} className="col-12 col-md-6 col-lg-4 mb-4">
            <ProductCard
              key={product.id}
              product={product}
              onClick={onProductClick}
              onKeyDown={onProductKeyDown}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductsList;