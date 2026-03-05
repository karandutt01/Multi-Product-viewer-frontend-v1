import { useEffect, useState } from "react";
import './dashboard.scss'
import Modal from "components/shared/Modal";
import { useForm } from "react-hook-form";
import { addProduct, productList } from "service/authService";
import toaster from "util/toaster";
import type { IProduct } from "../../types/IProduct";
import type { IProductResponse } from "../../types/IProductResponse";
import { useNavigate } from "react-router-dom";
import { DASHBOARD_CONSTANTS } from "../../constants/dashboardConstants";
import LoadingButton from "../../components/shared/LoadingButton";
import ApiError from "../../components/shared/ApiError";
import { parsedError } from "util/errorHandler";


function Dashboard() {

  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { register, formState: { errors, isSubmitting }, clearErrors, handleSubmit, setError, reset, setValue } = useForm<IProduct>()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [products, setProducts] = useState<IProductResponse[]>([])
  const [apiError, setApiError] = useState<string | undefined>(undefined);
  const [modalApiError, setModalApiError] = useState<string | undefined>(undefined);

  useEffect(() => {
    fetchProducts();
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await productList();
      setProducts(response.data?.doc || [])

    } catch (error) {
      
      setApiError(undefined);
      const parsed =  parsedError(error)
      if(parsed.message){
        setApiError(parsed.message)
      }
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
        toaster(response.status, response?.data?.message || DASHBOARD_CONSTANTS.MESSAGES.SUCCESS.PRODUCT_ADDED)
        handleCloseModal()
        fetchProducts();
      }

    } catch (error) {
      setApiError(undefined);
      setModalApiError(undefined);
      const parsed =  parsedError(error)
     // CHANGE: Handle field-specific errors from server
      if (parsed?.fieldErrors) {
        Object.entries(parsed.fieldErrors).forEach(([field, message]) => {
          setError(field as keyof IProduct, {
            type: 'server',
            message,
          });
        });
      }

      // CHANGE: Set error for modal context instead of page context
      if(parsed.message){
        setModalApiError(parsed.message)
      }

      if(parsed.message){
        setApiError(parsed.message)
      }
    }
  }

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    clearErrors('file');
    
    if (file) {
      // Validate file type
      if (!DASHBOARD_CONSTANTS.CONFIG.FILE_UPLOAD.ALLOWED_TYPES.includes(file.type)) {
        event.target.value = '';
        setValue('file', [] as unknown as File[]);
        setSelectedFile(null);
        setError('file', {
          message: DASHBOARD_CONSTANTS.MESSAGES.ERROR.INVALID_FILE_TYPE
        })
        return
      }

      // Validate file size (5MB limit)
      if (file.size > DASHBOARD_CONSTANTS.CONFIG.FILE_UPLOAD.MAX_SIZE) {
        event.target.value = '';
        setValue('file', [] as unknown as File[]);
        setSelectedFile(null);
        setError('file', {
          message: DASHBOARD_CONSTANTS.MESSAGES.ERROR.FILE_SIZE_LIMIT
        })
        return
      }

      setSelectedFile(file)
    }
  }

  function handleModal() {
   setIsModalOpen(true)
  }

  function handleCloseModal(){
    setIsModalOpen(false)
    setModalApiError(undefined);
    reset();
  }

  const onProductClick = (product: IProductResponse) => {
    navigate(`${DASHBOARD_CONSTANTS.ROUTES.PRODUCTS}/${product.id}`);
  }

  const handleProductKeyDown = (event: React.KeyboardEvent, product: IProductResponse) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onProductClick(product);
    }
  }



  const renderEmptyState = () => (
    <div className="text-center py-5">
      <div className="mb-4">
        <i className="bi bi-box-seam display-1 text-muted"></i>
      </div>
      <h4 className="text-muted mb-3">{DASHBOARD_CONSTANTS.MESSAGES.EMPTY_STATE.TITLE}</h4>
      <p className="text-muted mb-4">
        {DASHBOARD_CONSTANTS.MESSAGES.EMPTY_STATE.DESCRIPTION}
      </p>
      <button
        className="btn btn-primary btn-lg"
        onClick={handleModal}
      >
        <i className="bi bi-plus-circle me-2"></i>
        {DASHBOARD_CONSTANTS.LABELS.ADD_YOUR_FIRST_PRODUCT}
      </button>
    </div>
  );


  const renderProductsList = () => (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h4 mb-0">{DASHBOARD_CONSTANTS.LABELS.YOUR_PRODUCTS} ({products.length})</h2>
        <button
          className="btn btn-primary"
          onClick={handleModal}
        >
          <i className="bi bi-plus-circle me-2"></i>
          {DASHBOARD_CONSTANTS.LABELS.ADD_PRODUCT}
        </button>
      </div>

      <div className="row">
        {products?.map((product:IProductResponse) => (
          <div key={product.id} className="col-12 col-md-6 col-lg-4 mb-4">
            <div className="card h-100 shadow-sm" 
                onClick={() => onProductClick(product)}
                onKeyDown={(event) => handleProductKeyDown(event, product)}
                tabIndex={0}
                role="button"
                aria-label={`View details for ${product.title}`}
              >
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
              <h1 className="h3 mb-0">{DASHBOARD_CONSTANTS.LABELS.TITLE}</h1>
            </div>

            {
              products.length === 0 ? renderEmptyState() : renderProductsList()
            }

            <div className='mb-3'>
              <ApiError message={modalApiError}/>
            </div>
              
            <div className='mb-3'>
+              <ApiError message={apiError} />
+            </div>

            <Modal isOpen={isModalOpen} onHide={handleCloseModal}>
              <Modal.Header>
                {DASHBOARD_CONSTANTS.LABELS.ADD_PRODUCT}
              </Modal.Header>

              <Modal.Body>
                <form onSubmit={handleSubmit(addProductHandler)}>
                  <div className="p-3 dark-card">
                    <div>
                      <div className="mb-3">
                        <label htmlFor={DASHBOARD_CONSTANTS.FORM_FIELDS.title.id} className="form-label">{DASHBOARD_CONSTANTS.LABELS.PRODUCT_TITLE}</label>
                        <input
                          placeholder={DASHBOARD_CONSTANTS.PLACEHOLDERS.PRODUCT_TITLE}
                          className="form-control"
                          id={DASHBOARD_CONSTANTS.FORM_FIELDS.title.id}
                          {
                          ...register('title', DASHBOARD_CONSTANTS.VALIDATION.TITLE)
                          } />
                        {errors.title && <div className='text-danger'>{errors.title.message}</div>}
                      </div>

                       <div className="mb-3">
                        <label htmlFor={DASHBOARD_CONSTANTS.FORM_FIELDS.price.id} className="form-label">Price</label>
                        <input
                          placeholder={DASHBOARD_CONSTANTS.PLACEHOLDERS.PRICE}
                          className="form-control"
                          id={DASHBOARD_CONSTANTS.FORM_FIELDS.price.id}
                          {
                          ...register('price', DASHBOARD_CONSTANTS.VALIDATION.PRICE)
                          } />
                        {errors.price && <div className='text-danger'>{errors.price.message}</div>}
                      </div>

                      <div className="mb-3">
                        <label htmlFor={DASHBOARD_CONSTANTS.FORM_FIELDS.description.id} className="form-label">Product Description</label>
                        <input
                          placeholder={DASHBOARD_CONSTANTS.PLACEHOLDERS.DESCRIPTION}
                          className="form-control"
                          id={DASHBOARD_CONSTANTS.FORM_FIELDS.description.id}
                          {
                          ...register('description', DASHBOARD_CONSTANTS.VALIDATION.DESCRIPTION)
                          } />
                        {errors.description && <div className='text-danger'>{errors.description.message}</div>}
                      </div>

                      <div className="mb-3">
                        <label htmlFor={DASHBOARD_CONSTANTS.FORM_FIELDS.file.id} className="form-label">Upload file</label>
                        <input
                          type="file"
                          placeholder={DASHBOARD_CONSTANTS.PLACEHOLDERS.FILE}
                          className="form-control"
                          id={DASHBOARD_CONSTANTS.FORM_FIELDS.file.id}
                          {
                          ...register('file', {
                            ...DASHBOARD_CONSTANTS.VALIDATION.FILE,
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
                <LoadingButton
                  isLoading={isSubmitting}
                  className="btn btn-dark"
                  onClick={handleSubmit(addProductHandler)}
                >
                {DASHBOARD_CONSTANTS.LABELS.ADD_BUTTON}
                </LoadingButton>

                 <LoadingButton
                  isLoading={false}
                  className="btn btn-secondary"
                  onClick={handleCloseModal}
                >
                  {DASHBOARD_CONSTANTS.LABELS.CANCEL_BUTTON}
                </LoadingButton>
               
              </Modal.Footer>
            </Modal>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard