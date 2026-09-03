import React, { useEffect, useRef, useState } from "react";
import { PaymentRow } from '@/app/lib/types';
import { formatDateToLocalNew } from "@/app/lib/utils";
import { Button } from "../button";

const paymentType = ["Bank", "Cash", "Check", "Gpay", "PhonePay"]
const paymentTo = ["Prakash", "Govinth", "Sekar"]

interface PaymentProps {
  invoiceAmount: any,
  billType: string,
  invPayment: any,
  setInvPayments: React.Dispatch<React.SetStateAction<PaymentRow[]>>;
}

export default function PaymentForm({ invoiceAmount, billType, invPayment, setInvPayments }: PaymentProps) {

  const [selectedPayment, setSelectedPayment] = useState<PaymentRow[]>([
    { pId: 0, date: "date", amount: "", type: billType === "gst" ? "Bank" : "Gpay", to: "Prakash" },
  ]);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    if (!invPayment?.length) return;
    initialized.current = true;

    const formPayments: PaymentRow[] = invPayment.map((row: any, rowIndex: number) => ({
      pId: rowIndex,
      date: formatDateToLocalNew(row.Date),
      amount: row.Amount,
      type: row.Type,
      to: row.ReceivedBy
    }));
    setSelectedPayment(formPayments);
  }, [invPayment?.length])

  const handleChange = (
    pId: number,
    field: keyof PaymentRow,
    value: string | number
  ) => {
    setSelectedPayment((prev) =>
      prev.map((row) =>
        row.pId === pId ? { ...row, [field]: value } : row
      )
    );
  };

  const addPayment = (e: React.MouseEvent<HTMLButtonElement>, rowIndex: number) => {
    e.preventDefault();
    setSelectedPayment((prev) => [
      ...prev,
      { pId: rowIndex, date: "date", amount: "", type: "Gpay", to: "Prakash" },
    ]);
  };

  const removePayment = (rowIndex: number) => {
    let payments = selectedPayment.filter((row) => row.pId !== rowIndex);
    let withUpdatedId: any = []
    payments.forEach((row, index) => {
      row.pId = index
      withUpdatedId.push(row)
    })
    setSelectedPayment(withUpdatedId);
  };

  useEffect(() => {
    setInvPayments(selectedPayment);
  }, [selectedPayment, setInvPayments]);


  const totalAmount = selectedPayment?.length && selectedPayment.reduce(
    (sum, row) => sum + Number(row.amount),
    0
  );

  return (
    <div className="p-4 border rounded-lg max-w-3xl mt-4">
      <h2 className="text-xl font-bold mb-4">Add Payment</h2>

      <div className="space-y-4 mb-4">
        {selectedPayment && selectedPayment.map((row, rowIndex: number) => (
          <div
            key={row.pId}
            className="flex flex-col md:flex-row gap-3 md:items-center border border-slate-200 md:border-none p-4 md:p-0 rounded-xl md:rounded-none bg-white md:bg-transparent shadow-xs md:shadow-none"
          >
            {/* Mobile Header */}
            <div className="flex justify-between items-center md:hidden border-b border-slate-100 pb-2 mb-1">
              <span className="font-bold text-sm text-indigo-600">Payment #{rowIndex + 1}</span>
              <button
                type="button"
                onClick={() => removePayment(rowIndex)}
                className="text-red-500 text-xs font-semibold hover:text-red-700 transition-colors"
              >
                Remove
              </button>
            </div>

            {/* Desktop Index */}
            <p className="w-8 hidden md:block text-slate-500 font-semibold">{rowIndex + 1}</p>

            {/* Fields Grid/Flex Wrapper */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:flex md:flex-row gap-3 items-end md:items-center w-full">
              {/* Date */}
              <div className="w-full md:w-auto flex flex-col">
                <span className="md:hidden text-xs font-bold text-slate-500 mb-1">Payment Date</span>
                <input
                  type="date"
                  value={row.date || ""}
                  onChange={(e) =>
                    handleChange(rowIndex, "date", e.target.value)
                  }
                  className="border border-gray-300 p-2 rounded-lg text-sm bg-white w-full"
                  placeholder="Date"
                />
              </div>

              {/* Amount */}
              <div className="w-full md:w-auto flex flex-col">
                <span className="md:hidden text-xs font-bold text-slate-500 mb-1">Amount</span>
                <input
                  type="text"
                  value={row.amount || ""}
                  onChange={(e) =>
                    handleChange(rowIndex, "amount", e.target.value)
                  }
                  className="border border-gray-300 p-2 rounded-lg text-sm bg-white w-full"
                  placeholder="Amount"
                />
              </div>

              {/* Payment Type */}
              <div className="w-full md:w-auto flex flex-col">
                <span className="md:hidden text-xs font-bold text-slate-500 mb-1">Payment Type</span>
                <select
                  value={row.type}
                  onChange={(e) => handleChange(rowIndex, "type", e.target.value)}
                  className="border border-gray-300 p-2 rounded-lg text-sm bg-white w-full"
                >
                  <option value="">Select Type</option>
                  {paymentType?.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment To */}
              <div className="w-full md:w-auto flex flex-col">
                <span className="md:hidden text-xs font-bold text-slate-500 mb-1">Payment To</span>
                <select
                  value={row.to}
                  onChange={(e) => handleChange(rowIndex, "to", e.target.value)}
                  className="border border-gray-300 p-2 rounded-lg text-sm bg-white w-full"
                >
                  <option value="">Payment To</option>
                  {paymentTo?.map((row) => (
                    <option key={row} value={row}>
                      {row}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Desktop Remove Button */}
            <div className="hidden md:block">
              <button
                type='button'
                onClick={() => removePayment(rowIndex)}
                className="text-red-500 text-sm hover:text-red-700 font-semibold underline transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Payment Button */}
      <div className="flex flex-wrap gap-4 justify-between items-center mt-6">
        <Button type="button" color={'blue'} onClick={(e) => addPayment(e, selectedPayment?.length)}>+ Add Payment</Button>
        {/* Total info */}
        <div className="border border-gray-300 rounded-lg bg-gray-100 p-2 flex gap-4">
          <div className="font-bold text-base md:text-lg text-indigo-700">
            Paid: ₹{totalAmount?.toFixed(2)}
          </div>
          <div className="font-bold text-base md:text-lg text-red-600">
            Balance: ₹{(parseFloat(String(invoiceAmount)) - totalAmount)?.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
}
