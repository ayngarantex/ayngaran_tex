import React from "react";
import { Button } from "../button";

const paymentType = ["Bank", "Cash", "Check", "Gpay", "PhonePay"];

export interface PurchasePaymentRow {
  pId: number;
  date: string;
  amount: string;
  type: string;
  to: string;
}

interface PaymentProps {
  paymentsList: PurchasePaymentRow[];
  invoiceAmount: number;
  setPaymentsList: React.Dispatch<React.SetStateAction<PurchasePaymentRow[]>>;
}

export default function PaymentForm({ paymentsList, invoiceAmount, setPaymentsList }: PaymentProps) {
  const handleChange = (
    pId: number,
    field: keyof PurchasePaymentRow,
    value: string | number
  ) => {
    setPaymentsList((prev) =>
      prev.map((row) =>
        row.pId === pId ? { ...row, [field]: value } : row
      )
    );
  };

  const addPayment = (e: React.MouseEvent<HTMLButtonElement>, rowIndex: number) => {
    e.preventDefault();
    setPaymentsList((prev) => [
      ...prev,
      { pId: rowIndex, date: "date", amount: "", type: "Bank", to: "" },
    ]);
  };

  const removePayment = (rowIndex: number) => {
    setPaymentsList((prev) => {
      const payments = prev.filter((row) => row.pId !== rowIndex);
      return payments.map((row, index) => ({
        ...row,
        pId: index,
      }));
    });
  };

  const totalAmount = paymentsList?.length
    ? paymentsList.reduce((sum, row) => sum + (parseFloat(row.amount) || 0), 0)
    : 0;

  return (
    <div className="p-4 border rounded-lg max-w-4xl mt-4">
      <h2 className="text-xl font-bold mb-4">Add Payment</h2>

      {paymentsList.map((row, rowIndex: number) => (
        <div
          key={`pay_${rowIndex}`}
          className="flex gap-3 items-center mb-2"
        >
          <p className="w-16">{rowIndex + 1}</p>

          {/* Date */}
          <input
            type="date"
            value={row.date === "date" ? "" : row.date}
            onChange={(e) => handleChange(rowIndex, "date", e.target.value)}
            className="border p-2 rounded"
          />

          {/* Amount */}
          <input
            type="text"
            value={row.amount || ""}
            onChange={(e) => handleChange(rowIndex, "amount", e.target.value)}
            className="border p-2 rounded"
            placeholder="Amount"
          />

          {/* Payment Type */}
          <select
            value={row.type}
            onChange={(e) => handleChange(rowIndex, "type", e.target.value)}
            className="border p-2 rounded col-span-1"
          >
            <option value="">Select Type</option>
            {paymentType.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          {/* Paid To */}
          <input
            type="text"
            value={row.to || ""}
            onChange={(e) => handleChange(rowIndex, "to", e.target.value)}
            className="border p-2 rounded"
            placeholder="Payment To"
          />

          {/* Remove Button */}
          <button
            type="button"
            onClick={() => removePayment(rowIndex)}
            className="text-red-500 text-sm underline"
          >
            Remove
          </button>
        </div>
      ))}

      {/* Add payment buttons / totals */}
      <div className="flex justify-between">
        <Button
          type="button"
          color={'blue'}
          onClick={(e) => addPayment(e, paymentsList?.length)}
        >
          + Add Payment
        </Button>

        <div className="mt-4 font-bold text-lg">
          Total: ₹{totalAmount?.toFixed(2)}
        </div>
        <div className="mt-4 font-bold text-lg text-red-600">
          Balance: ₹{(invoiceAmount - totalAmount)?.toFixed(2)}
        </div>
      </div>
    </div>
  );
}
