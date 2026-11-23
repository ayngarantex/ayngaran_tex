interface MetricsCardsProps {
    totalDhotiesCount: number;
    totalCalculatedWagesSum: number;
    totalPaymentsSum: number;
    totalBalanceDue: number;
    totalAdvancePendingSum?: number;
}

export default function MetricsCards({
    totalDhotiesCount,
    totalCalculatedWagesSum,
    totalPaymentsSum,
    totalBalanceDue,
    totalAdvancePendingSum
}: MetricsCardsProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Total Dhoties Rec.</p>
                <p className="text-2xl font-extrabold text-slate-800">
                    {totalDhotiesCount.toLocaleString()} <span className="text-xs font-semibold text-slate-500">Pcs</span>
                </p>
            </div>
            <div className="rounded-2xl border border-blue-200/80 bg-gradient-to-br from-blue-50/50 to-indigo-50/80 p-4 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">Total Calculated Wages</p>
                <p className="text-2xl font-extrabold text-blue-800">
                    ₹ {totalCalculatedWagesSum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
            </div>
            <div className="rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/50 to-teal-50/80 p-5 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1">Total Paid Amount</p>
                <p className="text-2xl font-extrabold text-emerald-800">
                    ₹ {totalPaymentsSum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
            </div>
            <div
                className={`rounded-2xl border ${totalBalanceDue > 0.01
                    ? 'border-amber-200 bg-amber-50/60'
                    : totalBalanceDue < -0.01
                        ? 'border-purple-200 bg-purple-50/60'
                        : 'border-emerald-200 bg-emerald-50/60'
                    } p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between`}
            >
                <div>
                    <p className={`text-xs font-bold uppercase tracking-wider ${totalBalanceDue > 0.01 ? 'text-amber-700' : totalBalanceDue < -0.01 ? 'text-purple-700' : 'text-emerald-700'
                        } mb-1`}>
                        {totalBalanceDue < -0.01 ? 'Total Advance Pending' : 'Total Balance Due'}
                    </p>
                    <p className={`text-2xl font-extrabold ${totalBalanceDue > 0.01 ? 'text-amber-800' : totalBalanceDue < -0.01 ? 'text-purple-800' : 'text-emerald-800'
                        }`}>
                        {totalBalanceDue > 0.01
                            ? `₹ ${totalBalanceDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                            : totalBalanceDue < -0.01
                                ? `₹ ${Math.abs(totalBalanceDue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                                : 'Paid in Full'}
                    </p>
                </div>
                {totalAdvancePendingSum !== undefined && totalAdvancePendingSum > 0 && (
                    <div className="mt-2 pt-2 border-t border-amber-200/80 flex items-center justify-between text-xs">
                        <span className="font-semibold text-purple-700">Loom Advance:</span>
                        <span className="font-extrabold text-purple-900 bg-purple-100 px-2 py-0.5 rounded-md">
                            ₹ {totalAdvancePendingSum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}

