'use client';

import StockEntryModal from '@/app/ui/products/StockEntryModal';

interface StockEditModalProps {
  product: {
    Id: string;
    Name: string;
    HSNCode?: string | null;
  };
  entry: {
    Id: string;
    ProductId: number;
    Quantity: number;
    EntryDate: string;
    Notes: string | null;
  };
  onSuccess?: (updatedEntry: any) => void;
}

export default function StockEditModal({ product, entry, onSuccess }: StockEditModalProps) {
  return (
    <StockEntryModal
      mode="edit"
      product={product}
      entry={entry}
      onSuccess={onSuccess}
    />
  );
}
