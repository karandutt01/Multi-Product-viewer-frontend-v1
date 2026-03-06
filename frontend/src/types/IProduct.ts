export interface IProduct {
  title:string,
  description:string,
  price:string,
  file:File[]
}

export interface IProductResponse {
  id: string,
  title: string,
  price: string,
  productDesc: string,
  imageUrl:string
}

export interface ProductImageProps {
  imageUrl?: string;
  title: string;
  className?: string;
}

export interface ProductsListProps {
  products: IProductResponse[];
  onProductClick: (product: IProductResponse) => void;
  onProductKeyDown: (event: React.KeyboardEvent, product: IProductResponse) => void;
  onAddProduct: () => void;
}

export interface ProductCardProps {
  product: IProductResponse;
  onClick?: (product: IProductResponse) => void;
  onKeyDown?: (event: React.KeyboardEvent, product: IProductResponse) => void;
}

export interface IProductDetailsInfoProps {
  product: IProductResponse;
  className?: string;
}