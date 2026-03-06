import React from 'react';
import { DASHBOARD_CONSTANTS } from '../../../constants/dashboardConstants';
import type { EmptyStateProps } from '../../../types/EmptyState';


const EmptyState: React.FC<EmptyStateProps> = ({ onAddProduct }) => {
  return (
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
        onClick={onAddProduct}
      >
        <i className="bi bi-plus-circle me-2"></i>
        {DASHBOARD_CONSTANTS.LABELS.ADD_YOUR_FIRST_PRODUCT}
      </button>
    </div>
  );
};

export default EmptyState;