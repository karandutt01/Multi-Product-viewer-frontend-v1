import React from 'react';
import type { ProductImageProps } from '../../../types/IProduct';
import '../../shared/ProductImage/ProductImage.scss'

const ProductImage: React.FC<ProductImageProps> = ({ 
  imageUrl, 
  title, 
  className = "card-img-top imgWidthHeight" 
}) => {
  if (!imageUrl) {
    return (
      <div className={`${className} d-flex align-items-center justify-content-center bg-light`}>
        <i className="bi bi-image text-muted"></i>
      </div>
    );
  }

  return (
    <img 
      src={imageUrl} 
      className={`${className} productImageCover`}
      alt={title}
      loading="lazy"

    />
  );
};

export default ProductImage;