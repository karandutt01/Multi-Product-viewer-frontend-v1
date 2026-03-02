import { useEffect, useEffectEvent, useState } from "react";
import './dashboard.scss'
import Modal from "components/shared/Modal";
import { useForm } from "react-hook-form";
import { addProduct, productList } from "service/authService";
import toaster from "util/toaster";
import { AxiosError } from "axios";
import { IProduct } from "../../types/IProduct";
import { IProductResponse } from "../../types/IProductResponse";
import { useNavigate } from "react-router-dom";

function Dashboard() {

  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { register, formState: { errors }, handleSubmit, setError, reset } = useForm<IProduct>()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [products, setProducts] = useState<IProductResponse[]>([])
  const [productsError, setProductsError] = useState<string | null>(null)

  useEffect(() => {
    fetchProducts();
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await productList();
      setProducts(response.data?.doc || [])

    } catch (error) {
      const errorMessage = error instanceof AxiosError 
        ? error.response?.data?.message || error.message 
        : 'Failed to fetch products';
      setProductsError(errorMessage);

    }
  }

  const addProductHandler = async (formData:IProduct) => {
    try {
      
      const uploadData = new FormData()
      
      uploadData.append('title', formData.title)
      uploadData.append('price', formData.price)
      uploadData.append('productDesc', formData.description)
      
      if (formData.file && formData.file.length > 0) {
        uploadData.append('image', formData.file[0])
      }

      const response = await addProduct(uploadData)
      if (response && response.data) {
        toaster(response.status, response?.data?.message || "Product Added Successfully")
        handleCloseModal()
        fetchProducts();
      }

    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : error instanceof AxiosError 
          ? (error as AxiosError).message 
          : 'An unexpected error occurred';

      setError('root', {
        message: typeof errorMessage === 'string' ? errorMessage : 'An unexpected error occurred'
      })
    }
  }

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        setError('file', {
          message: 'Please select a valid image file (JPEG, PNG, GIF, WebP)'
        })
        return
      }

      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024 // 5MB in bytes
      if (file.size > maxSize) {
        setError('file', {
          message: 'File size must be less than 5MB'
        })
        return
      }

      setSelectedFile(file)
      
      // Create preview for images
      // const reader = new FileReader()
      // reader.onload = (e) => {
      //   setFilePreview(e.target?.result as string)
      // }
      // reader.readAsDataURL(file)
    }
  }

  function handleModal() {
   setIsModalOpen(true)
  }

  function handleCloseModal(){
    setIsModalOpen(false)
    reset();
  }

  const onProductClick = (product: IProductResponse) => {
    console.log('prodyucts', product)
    navigate(`/products/${product.id}`);
  }


  const renderEmptyState = () => (
    <div className="text-center py-5">
      <div className="mb-4">
        <i className="bi bi-box-seam display-1 text-muted"></i>
      </div>
      <h4 className="text-muted mb-3">Start building your product catalog</h4>
      <p className="text-muted mb-4">
        {`You haven't added any products yet. Create your first product to get started.`}
      </p>
      <button
        className="btn btn-primary btn-lg"
        onClick={handleModal}
      >
        <i className="bi bi-plus-circle me-2"></i>
        Add Your First Product
      </button>
    </div>
  );


  const renderProductsList = () => (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h4 mb-0">Your Products ({products.length})</h2>
        <button
          className="btn btn-primary"
          onClick={handleModal}
        >
          <i className="bi bi-plus-circle me-2"></i>
          Add Product
        </button>
      </div>

      <div className="row">
        {products?.map((product:IProductResponse) => (
          <div key={product.id} className="col-12 col-md-6 col-lg-4 mb-4">
            <div className="card h-100 shadow-sm" onClick={() => onProductClick(product)}>
              {product.imageUrl && (
                <img 
                  src={product.imageUrl} 
                  className="card-img-top imgWidthHeight" 
                  alt={product.title}
                />
              )}
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{product.title}</h5>
                <p className="card-text text-muted flex-grow-1">{product.productDesc}</p>
                <div className="mt-auto">
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="h5 mb-0 text-primary">${product.price}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (



    <div>
      <div className="container-fluid py-4">
        <div className="row">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1 className="h3 mb-0">Dashboard</h1>
            </div>

            {
              products.length === 0 ? renderEmptyState() : renderProductsList()
            }

            <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
              <Modal.Header>
                Add product
              </Modal.Header>

              <Modal.Body>
                <form>
                  <div className="p-3 dark-card">
                    <div>
                      <div className="mb-3">
                        <label htmlFor="productForm" className="form-label">Product Title</label>
                        <input
                          placeholder='Enter product title'
                          className="form-control"
                          id="productForm"
                          {
                          ...register('title', {
                            required: "Title is required",
                          })
                          } />
                        {errors.title && <div className='text-danger'>{errors.title.message}</div>}
                      </div>

                       <div className="mb-3">
                        <label htmlFor="productForm" className="form-label">Price</label>
                        <input
                          placeholder='Enter price'
                          className="form-control"
                          id="productForm"
                          {
                          ...register('price', {
                            required: "Price is required",
                          })
                          } />
                        {errors.price && <div className='text-danger'>{errors.price.message}</div>}
                      </div>

                      <div className="mb-3">
                        <label htmlFor="productForm" className="form-label">Product Description</label>
                        <input
                          placeholder='Enter product description'
                          className="form-control"
                          id="productForm"
                          {
                          ...register('description', {
                            required: "Description is required",
                          })
                          } />
                        {errors.description && <div className='text-danger'>{errors.description.message}</div>}
                      </div>

                      <div className="mb-3">
                        <label htmlFor="productForm" className="form-label">Upload file</label>
                        <input
                          type="file"
                          placeholder='Browse file'
                          className="form-control"
                          id="productForm"
                          {
                          ...register('file', {
                            required: "File is required",
                            onChange: handleFileChange
                          })
                          } />
                        {errors.file && <div className='text-danger'>{errors.file.message}</div>}
                      </div>
                    </div>
                    
                  </div>
                </form>
              </Modal.Body>

              <Modal.Footer>
                <button className="btn btn-dark" onClick={handleSubmit(addProductHandler)}>Add</button>
                <button className="btn btn-light" onClick={handleCloseModal}>Cancel</button>
              </Modal.Footer>
            </Modal>
          </div>
        </div>
      </div>
      {/* <SharedOffCanvas /> */}
    </div>
  )
}

export default Dashboard