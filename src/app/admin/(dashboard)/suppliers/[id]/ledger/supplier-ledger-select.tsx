'use client'
import SearchDropdown from '@/app/ui/search-dropdown';
import { useRouter, useSearchParams } from 'next/navigation';

interface SupplierLedgerSelectProps {
    suppliers: any[];
    currentSupplierId: number;
    currentSupplierName: string;
}

export default function SupplierLedgerSelect({ suppliers, currentSupplierId, currentSupplierName }: SupplierLedgerSelectProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const items = suppliers.map((s) => ({
        id: s.SupplierId,
        label: s.Name
    }));

    return (
        <div className="w-64">
            <SearchDropdown
                items={items}
                placeholder="Search Supplier..."
                value={currentSupplierName}
                hideLabel={true}
                onSelect={(item) => {
                    if (item) {
                        const params = new URLSearchParams(searchParams.toString());
                        router.push(`/admin/suppliers/${item.id}/ledger?${params.toString()}`);
                    }
                }}
            />
        </div>
    );
}
