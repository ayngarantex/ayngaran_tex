'use client';

import StockEntryModal from '@/app/ui/products/StockEntryModal';

interface StockCreateModalProps {
  product: {
    Id: string;
    Name: string;
    HSNCode?: string | null;
  };
  buttonClassName?: string;
  buttonLabel?: string;
  showIcon?: boolean;
  onSuccess?: () => void;
}

export default function StockCreateModal({
  product,
  buttonClassName,
  buttonLabel,
  showIcon = true,
  onSuccess,
}: StockCreateModalProps) {
  return (
    <StockEntryModal
      mode="create"
      product={product}
      buttonClassName={buttonClassName}
      buttonLabel={buttonLabel}
      showIcon={showIcon}
      onSuccess={onSuccess}
    />
  );
}
