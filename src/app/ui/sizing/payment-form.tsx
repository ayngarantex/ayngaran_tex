import React, { useEffect, useState } from "react";
import { PaymentRow } from '@/app/lib/types';
import { formatDateToLocalNew } from "@/app/lib/utils";
import { Button } from "../button";

const paymentType = ["Bank", "Cash", "Check", "Gpay", "PhonePay"]

interface PaymentProps {
  invPayment: any,
  setInvPayments: React.Dispatch<React.SetStateAction<PaymentRow[]>>;
  invoiceAmount: any;
}

export default function PaymentForm({ invPayment, setInvPayments, invoiceAmount }: PaymentProps) {

  const [selectedPayment, setSelectedPayment] = useState<PaymentRow[]>([
    { pId: 0, date: "date", amount: "", type: "Bank", to: "" },
  ]);

  useEffect(() => {
    let formPayments = []
    let pId = 0
    invPayment.forEach((row: any, rowIndex: number) => {
      formPayments.push(
        {
          pId: rowIndex,
          date: formatDateToLocalNew(row.Date),
          amount: row.Amount,
          type: row.Type,
          to: row.ReceivedBy
        }
      )
      pId = rowIndex + 1
    });
    formPayments.push({ pId: pId, date: "date", amount: "", type: "Bank", to: "" },)
    setSelectedPayment(formPayments)
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
      { pId: rowIndex, date: "date", amount: "", type: "Bank", to: "" },
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
    <div className="p-4 border rounded-lg max-w-4xl mt-4">
      <h2 className="text-xl font-bold mb-4">Add Payment</h2>

      {selectedPayment.map((row, rowIndex: number) => (
        <div
          key={row.date}
          className="flex gap-3 items-center mb-2"
        >
          <p className="w-16">{rowIndex + 1}</p>

          <input
            type="date"
            value={row.date || ""}
            onChange={(e) =>
              handleChange(rowIndex, "date", e.target.value)
            }
            className="border p-2 rounded"
            placeholder="Date"
          />

          {/* Price */}
          <input
            type="text"
            value={row.amount || ""}
            onChange={(e) =>
              handleChange(rowIndex, "amount", e.target.value)
            }
            className="border p-2 rounded"
            placeholder="Amount"
          />

          {/* payment type Select */}
          <select
            value={row.type}
            onChange={(e) => handleChange(rowIndex, "type", e.target.value)}
            className="border p-2 rounded col-span-1"
          >
            <option value="">Select Type</option>
            {paymentType?.map((type) => (
              <option
                key={type}
                value={type}
              >
                {type}
              </option>
            ))}
          </select>

          {/* paymentent To */}

          <input
            type="text"
            value={row.to || ""}
            onChange={(e) =>
              handleChange(rowIndex, "to", e.target.value)
            }
            className="border p-2 rounded"
            placeholder="Payment To"
          />

          {/* Remove Button */}
          <button
            type='button'
            onClick={() => removePayment(rowIndex)}
            className="text-red-500 text-sm underline"
          >
            Remove
          </button>
        </div>
      ))}

      {/* Add Product Button */}
      <div className="flex justify-between">
        <Button type="button" color={'blue'} onClick={(e) => addPayment(e, selectedPayment?.length)}>+ Add Payment</Button>
        {/* Total */}
        <div className="mt-4 font-bold text-lg">
          Total: ₹{totalAmount?.toFixed(2)}
        </div>
        <div className="mt-4 font-bold text-lg text-red-600">
          Balance: ₹{(parseFloat(String(invoiceAmount || "0")) - totalAmount)?.toFixed(2)}
        </div>
      </div>
    </div>
  );
}
