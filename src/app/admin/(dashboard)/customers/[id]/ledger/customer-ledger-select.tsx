'use client'
import SearchDropdown from '@/app/ui/search-dropdown';
import { useRouter, useSearchParams } from 'next/navigation';

interface CustomerLedgerSelectProps {
    customers: any[];
    currentCustomerId: number;
    currentCustomerName: string;
}

export default function CustomerLedgerSelect({ customers, currentCustomerId, currentCustomerName }: CustomerLedgerSelectProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const items = customers.map((c) => ({
        id: c.CustomerId,
        label: c.CustomerName
    }));

    return (
        <div className="w-64">
            <SearchDropdown
                items={items}
                placeholder="Search Customer..."
                value={currentCustomerName}
                hideLabel={true}
                onSelect={(item) => {
                    if (item) {
                        const params = new URLSearchParams(searchParams.toString());
                        router.push(`/admin/customers/${item.id}/ledger?${params.toString()}`);
                    }
                }}
            />
        </div>
    );
}
