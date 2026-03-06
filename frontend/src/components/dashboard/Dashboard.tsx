import { useEffect, useState } from "react";
import './dashboard.scss'
import { useForm } from "react-hook-form";
import type { IProduct, IProductResponse } from "../../types/IProduct";
import { useNavigate } from "react-router-dom";
import { addProductUtils, fetchProductsUtil } from "../../util/dashboardUtils";
import { parsedError } from "../../util/errorHandler";
import { DASHBOARD_CONSTANTS } from "../../constants/dashboardConstants";
import Modal from "components/shared/Modal";
import LoadingButton from "../../components/shared/LoadingButton";
import ApiError from "../../components/shared/ApiError";
import ProductForm from "../products/ProductForm/ProductForm";
import ProductsList from "../products/ProductList/ProductList";
import EmptyState from "../shared/EmptyState/EmptyState";


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
      const productData = await fetchProductsUtil();
      setProducts(productData);
      setApiError(undefined);
    } catch (error) {
      setApiError(error instanceof Error ? error.message : DASHBOARD_CONSTANTS.MESSAGES.ERROR.FETCH_PRODUCTS);
    }
  };

  const addProductHandler = async (formData:IProduct) => {
    try {
      await addProductUtils(formData);
      handleCloseModal();
      fetchProducts();
    } catch (error) {
      setApiError(undefined);
      setModalApiError(undefined);
      const parsed = parsedError(error);
      
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
      if (parsed.message) {
        setModalApiError(parsed.message);
      }
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


  return (

   <div>
      <div className="container-fluid py-4">
        <div className="row">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1 className="h3 mb-0">{DASHBOARD_CONSTANTS.LABELS.TITLE}</h1>
            </div>

            {products.length === 0 ? (
              <EmptyState onAddProduct={handleModal} />
            ) : (
              <ProductsList
                products={products}
                onProductClick={onProductClick}
                onProductKeyDown={handleProductKeyDown}
                onAddProduct={handleModal}
              />
            )}

            <div className='mb-3'>
              <ApiError message={modalApiError}/>
            </div>
              
            <div className='mb-3'>
              <ApiError message={apiError} />
            </div>

            <Modal isOpen={isModalOpen} onHide={handleCloseModal}>
              <Modal.Header>
                {DASHBOARD_CONSTANTS.LABELS.ADD_PRODUCT}
              </Modal.Header>

              <Modal.Body>
                <form onSubmit={handleSubmit(addProductHandler)}>
                  <ProductForm
                    register={register}
                    errors={errors}
                    setValue={setValue}
                    clearErrors={clearErrors}
                    setError={setError}
                    setSelectedFile={setSelectedFile}
                  />
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