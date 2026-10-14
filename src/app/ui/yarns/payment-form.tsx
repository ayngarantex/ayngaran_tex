import React, { useEffect, useState } from "react";
import { PaymentRow } from '@/app/lib/types';
import { formatDateToLocal } from "@/app/lib/utils";
import { Button } from "../button";

const paymentType = ["Bank", "Cash", "Check", "Gpay", "PhonePay"]

interface PaymentProps {
  yrnPayment: any,
  invoiceAmount: any,
  setYrnPayments: React.Dispatch<React.SetStateAction<PaymentRow[]>>;
}

const getTodayDateStr = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function PaymentForm({ yrnPayment, invoiceAmount, setYrnPayments }: PaymentProps) {

  const [selectedPayment, setSelectedPayment] = useState<PaymentRow[]>([
    { pId: 0, date: "date", amount: "", type: "Bank", to: "" },
  ]);

  useEffect(() => {
    let formPayments = []
    let pId = 0
    if (yrnPayment?.length) {
      yrnPayment.forEach((row: any, rowIndex: number) => {
        formPayments.push(
          {
            pId: rowIndex,
            date: formatDateToLocal(row.Date),
            amount: row.Amount,
            type: row.Type,
            to: row.ReceivedBy
          }
        )
        pId = rowIndex + 1
      });
    }
    formPayments.push({ pId: pId, date: "date", amount: "", type: "Bank", to: "" })
    setSelectedPayment(formPayments)
  }, [yrnPayment?.length])

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

  const fillFullBalance = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const todayStr = getTodayDateStr();
    const invAmtNum = Number(invoiceAmount || 0);

    setSelectedPayment((prev) => {
      if (!prev || prev.length === 0) {
        return [{ pId: 0, date: todayStr, amount: invAmtNum > 0 ? invAmtNum.toFixed(2) : "", type: "Bank", to: "" }];
      }
      const updated = [...prev];
      const lastIdx = updated.length - 1;
      const otherPaid = updated.slice(0, lastIdx).reduce((sum, r) => sum + Number(r.amount || 0), 0);
      const rem = Math.max(0, invAmtNum - otherPaid);
      updated[lastIdx] = {
        ...updated[lastIdx],
        date: todayStr,
        amount: rem > 0 ? rem.toFixed(2) : String(invAmtNum || "")
      };
      return updated;
    });
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
    setYrnPayments(selectedPayment);
  }, [selectedPayment, setYrnPayments]);


  const totalAmount = selectedPayment?.length && selectedPayment.reduce(
    (sum, row) => sum + Number(row.amount),
    0
  );

  return (
    <div className="p-4 border rounded-lg max-w-4xl mt-4">
      <h2 className="text-xl font-bold mb-4">Add Payment</h2>

      {selectedPayment.map((row, rowIndex: number) => (
        <div
          key={row.pId ?? rowIndex}
          className="flex gap-3 items-center mb-2"
        >
          <p className="w-16">{rowIndex + 1}</p>

          <input
            type="date"
            value={row.date && row.date !== "date" ? row.date : ""}
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

      {/* Add Payment & Fill Today & Full Balance */}
      <div className="flex flex-wrap gap-4 justify-between items-center mt-4">
        <div className="flex gap-2 items-center">
          <Button type="button" color={'blue'} onClick={(e) => addPayment(e, selectedPayment?.length)}>+ Add Payment</Button>
          <button
            type="button"
            onClick={fillFullBalance}
            className="px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded-lg transition-colors cursor-pointer"
          >
            Fill Today & Full Balance
          </button>
        </div>
        {/* Total */}
        <div className="font-bold text-lg">
          Total: ₹{totalAmount?.toFixed(2)}
        </div>
        <div className="font-bold text-lg text-red-600">
          Balance: ₹{(parseFloat(String(invoiceAmount)) - totalAmount)?.toFixed(2)}
        </div>
      </div>
    </div>
  );
}
