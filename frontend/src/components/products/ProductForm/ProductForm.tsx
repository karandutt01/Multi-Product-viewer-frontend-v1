import React from 'react';
import { DASHBOARD_CONSTANTS } from '../../../constants/dashboardConstants';
import { validateFile } from '../../../util/dashboardUtils';
import type { IProductFormProps } from '../../../types/IProductForm';

const ProductForm: React.FC<IProductFormProps> = ({
  register,
  errors,
  setValue,
  clearErrors,
  setError,
  setSelectedFile
}) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    clearErrors('file');
    
    if (file) {
      const validationError = validateFile(file);
      
      if (validationError) {
        event.target.value = '';
        setValue('file', [] as unknown as File[]);
        setSelectedFile(null);
        setError('file', {
          message: validationError
        });
        return;
      }

      setSelectedFile(file);
    }
  };

  return (
    <div className="p-3 dark-card">
      <div>
        <div className="mb-3">
          <label htmlFor={DASHBOARD_CONSTANTS.FORM_FIELDS.title.id} className="form-label">
            {DASHBOARD_CONSTANTS.LABELS.PRODUCT_TITLE}
          </label>
          <input
            placeholder={DASHBOARD_CONSTANTS.PLACEHOLDERS.PRODUCT_TITLE}
            className="form-control"
            id={DASHBOARD_CONSTANTS.FORM_FIELDS.title.id}
            {...register('title', DASHBOARD_CONSTANTS.VALIDATION.TITLE)}
          />
          {errors.title && <div className='text-danger'>{errors.title.message}</div>}
        </div>

        <div className="mb-3">
          <label htmlFor={DASHBOARD_CONSTANTS.FORM_FIELDS.price.id} className="form-label">
            {DASHBOARD_CONSTANTS.LABELS.PRICE}
          </label>
          <input
            placeholder={DASHBOARD_CONSTANTS.PLACEHOLDERS.PRICE}
            className="form-control"
            id={DASHBOARD_CONSTANTS.FORM_FIELDS.price.id}
            {...register('price', DASHBOARD_CONSTANTS.VALIDATION.PRICE)}
          />
          {errors.price && <div className='text-danger'>{errors.price.message}</div>}
        </div>

        <div className="mb-3">
          <label htmlFor={DASHBOARD_CONSTANTS.FORM_FIELDS.description.id} className="form-label">
            {DASHBOARD_CONSTANTS.LABELS.PRODUCT_DESCRIPTION}
          </label>
          <input
            placeholder={DASHBOARD_CONSTANTS.PLACEHOLDERS.DESCRIPTION}
            className="form-control"
            id={DASHBOARD_CONSTANTS.FORM_FIELDS.description.id}
            {...register('description', DASHBOARD_CONSTANTS.VALIDATION.DESCRIPTION)}
          />
          {errors.description && <div className='text-danger'>{errors.description.message}</div>}
        </div>

        <div className="mb-3">
          <label htmlFor={DASHBOARD_CONSTANTS.FORM_FIELDS.file.id} className="form-label">
            {DASHBOARD_CONSTANTS.LABELS.UPLOAD_FILE}
          </label>
          <input
            type="file"
            placeholder={DASHBOARD_CONSTANTS.PLACEHOLDERS.FILE}
            className="form-control"
            id={DASHBOARD_CONSTANTS.FORM_FIELDS.file.id}
            {...register('file', {
              ...DASHBOARD_CONSTANTS.VALIDATION.FILE,
              onChange: handleFileChange
            })}
          />
          {errors.file && <div className='text-danger'>{errors.file.message}</div>}
        </div>
      </div>
    </div>
  );
};

export default ProductForm;