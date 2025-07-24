"use client";

import { useState, useEffect } from "react";
import * as XLSX from "xlsx"; // ✅ Excel export

type Item = {
  desc: string;
  price: number;
};

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [invoiceNumber, setInvoiceNumber] = useState<number>(1001);

  // ✅ Load saved items and invoice number from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("invoiceItems");
    if (saved) setItems(JSON.parse(saved));

    const savedInvoiceNumber = localStorage.getItem("invoiceNumber");
    if (savedInvoiceNumber) setInvoiceNumber(Number(savedInvoiceNumber));
  }, []);

  // ✅ Save items & invoice number when they change
  useEffect(() => {
    localStorage.setItem("invoiceItems", JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem("invoiceNumber", String(invoiceNumber));
  }, [invoiceNumber]);

  const addItem = () => {
    if (!desc || !price || Number(price) <= 0) return;
    setItems((prev) => [...prev, { desc, price: Number(price) }]);
    setDesc("");
    setPrice("");
  };

  const updateItem = (index: number, key: keyof Item, value: string | number) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? { ...item, [key]: key === "price" ? Number(value) : (value as string) }
          : item
      )
    );
  };

  const deleteItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const total = items.reduce((sum, item) => sum + item.price, 0);

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(items);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Invoice");
    XLSX.writeFile(wb, `Invoice_${invoiceNumber}.xlsx`);
  };

  const newInvoice = () => {
    setItems([]);
    setInvoiceNumber((prev) => prev + 1);
    localStorage.setItem("invoiceItems", JSON.stringify([]));
  };

  const today = new Date().toLocaleDateString();

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold text-blue-600 mb-2">Locksmith Invoicing</h1>
      <div className="mb-4 text-gray-700 font-semibold">
        Invoice #{invoiceNumber} – {today}
      </div>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Description"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          className="border p-2 rounded w-1/2"
        />
        <input
          type="number"
          placeholder="Price"
          value={price === "" ? "" : price}
          onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
          className="border p-2 rounded w-1/4"
        />
        <button
          onClick={addItem}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add
        </button>
      </div>

      <ul className="space-y-2 mb-4">
        {items.map((item, index) => (
          <li key={index} className="flex justify-between border-b py-1 text-gray-700">
            <input
              type="text"
              value={item.desc}
              onChange={(e) => updateItem(index, "desc", e.target.value)}
              className="border p-1 rounded w-1/2"
            />
            <input
              type="number"
              value={item.price}
              onChange={(e) =>
                updateItem(index, "price", e.target.value === "" ? 0 : Number(e.target.value))
              }
              className="border p-1 rounded w-1/4 text-right"
            />
            <button
              onClick={() => deleteItem(index)}
              className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>

      <div className="text-right font-bold text-xl mb-4">
        Total: ${total.toFixed(2)}
      </div>

      <div className="flex justify-between">
        <button
          onClick={newInvoice}
          className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
        >
          New Invoice
        </button>
        <button
          onClick={exportToExcel}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Export to Excel
        </button>
      </div>
    </div>
  );
}













