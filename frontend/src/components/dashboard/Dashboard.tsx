import { useState } from "react";
import './dashboard.scss'
import Modal from "components/shared/Modal";
import { useForm } from "react-hook-form";
import { addProduct } from "service/authService";

function Dashboard() {

  const [isModalOpen, setIsModalOpen] = useState(false)
  const { register, formState: { errors }, handleSubmit, setError, reset } = useForm()



  const addProductHandler = async () => {

  }

  function handleModal() {
   setIsModalOpen(true)
  }

  function handleCloseModal(){
    setIsModalOpen(false)
    reset();
  }


  return (
    <div>
      <div className="container-fluid py-4">
        <div className="row">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1 className="h3 mb-0">Dashboard</h1>
            </div>

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

            <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
              <Modal.Header>
                Add product
              </Modal.Header>

              <Modal.Body>
                <form>
                  <div className="p-3 dark-card">
                    <div>
                      <div className="mb-3">
                        <label htmlFor="productForm" className="form-label">Title</label>
                        <input
                          placeholder='Enter product title'
                          className="form-control"
                          id="productForm"
                          {
                          ...register('title', {
                            required: "Title is required",
                            minLength: {
                              value: 50,
                              message: "Title must be less than or equal to 50 characters"
                            }
                          })
                          } />
                        {/* {errors.title && <div className='text-danger'>{errors.title.message}</div>} */}
                      </div>
                    </div>
                  </div>
                </form>
              </Modal.Body>

              <Modal.Footer>
                <button className="btn btn-dark" onClick={handleSubmit(addProductHandler)}>Add</button>
                <button className="btn btn-light">Cancel</button>
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