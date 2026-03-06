import React from 'react';
import ProductImage from '../../shared/ProductImage/ProductImage';
import type { ProductCardProps } from '../../../types/IProduct';
import './ProductCard.scss'


const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onClick, 
  onKeyDown 
}) => {

  const handleClick = () => {
    if (onClick) {
      onClick(product);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (onKeyDown) {
      onKeyDown(event, product);
    }
  };


  return (
      <div 
        className="card h-100 shadow-sm product-card" 
        onClick={onClick ? handleClick : undefined}
        onKeyDown={onKeyDown ? handleKeyDown : undefined}
        tabIndex={onClick ? 0 : undefined}
        role={onClick ? "button" : undefined}
        aria-label={`View details for ${product.title}`}
      >
        <div className="product-image-container">
          <ProductImage 
            imageUrl={product.imageUrl} 
            title={product.title}
            className="product-image"
          />
        </div>
        <div className="card-body d-flex flex-column p-3">
          <h5 className="card-title">{product.title}</h5>
          <p className="card-text text-muted flex-grow-1 product-description">{product.productDesc}</p>
          <div className="mt-auto">
            <div className="d-flex justify-content-between align-items-center">
              <span className="h5 mb-0 text-primary">${product.price}</span>
            </div>
          </div>
        </div>
      </div>
  );
};

export default ProductCard;