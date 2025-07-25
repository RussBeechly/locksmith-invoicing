"use client";

import { useState, useEffect } from "react";
import * as XLSX from "xlsx";

// ✅ Types
type Item = {
  desc: string;
  price: number;
};

type Invoice = {
  tech: string;
  account: string;
  po: string;
  notes: string;
  items: Item[];
  invoiceNumber: string;
  total: number;
};

export default function Home() {
  const [tech, setTech] = useState("");
  const [account, setAccount] = useState("");
  const [po, setPo] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [invoiceNumber, setInvoiceNumber] = useState("");

  // ✅ Load saved data from localStorage (migration-friendly)
  useEffect(() => {
    const saved = localStorage.getItem("currentInvoice");
    if (saved) {
      const data: Invoice = JSON.parse(saved);
      setTech(data.tech || "");
      setAccount(data.account || "");
      setPo(data.po || "");
      setNotes(data.notes || "");
      setItems(data.items || []);
      setInvoiceNumber(data.invoiceNumber || generateInvoiceNumber());
    } else {
      setInvoiceNumber(generateInvoiceNumber());
    }
  }, []);

  // ✅ Save everything to localStorage on change
  useEffect(() => {
    const total = items.reduce((sum, item) => sum + item.price, 0);
    const currentInvoice: Invoice = {
      tech,
      account,
      po,
      notes,
      items,
      invoiceNumber,
      total,
    };
    localStorage.setItem("currentInvoice", JSON.stringify(currentInvoice));
  }, [tech, account, po, notes, items, invoiceNumber]);

  // ✅ Invoice Number Generator (LocationID-Last2TechDigits-Sequence)
  function generateInvoiceNumber() {
    const locationID = "TPA"; // Placeholder, will be dynamic later
    const techID = tech ? tech.slice(-2) : "00";
    const sequence =
      JSON.parse(localStorage.getItem("allInvoices") || "[]").length + 1;
    return `${locationID}-${techID}-${sequence.toString().padStart(4, "0")}`;
  }

  const addItem = () => {
    if (!desc || !price || Number(price) <= 0) return;
    setItems((prev) => [...prev, { desc, price: Number(price) }]);
    setDesc("");
    setPrice("");
  };

  const updateItem = (
    index: number,
    key: keyof Item,
    value: string | number
  ) => {
    const updated = [...items];
    if (key === "price") {
      updated[index][key] = Number(value);
    } else {
      updated[index][key] = value as string;
    }
    setItems(updated);
  };

  const deleteItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const total = items.reduce((sum, item) => sum + item.price, 0);

  const exportToExcel = () => {
    // ✅ Save to invoice history
    const history = JSON.parse(localStorage.getItem("allInvoices") || "[]");
    history.push({
      tech,
      account,
      po,
      notes,
      items,
      invoiceNumber,
      total,
    });
    localStorage.setItem("allInvoices", JSON.stringify(history));

    // ✅ Export XLSX
    const data = [
      ["Invoice Number", invoiceNumber],
      ["Tech", tech],
      ["Account", account],
      ["PO", po],
      ["Notes", notes],
      [],
      ["Description", "Price"],
      ...items.map((i) => [i.desc, i.price]),
      [],
      ["Total", total],
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Invoice");
    XLSX.writeFile(wb, `${invoiceNumber}.xlsx`);
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">
        Locksmith Invoicing
      </h1>

      {/* Invoice Number */}
      <div className="mb-4 text-lg font-semibold">
        Invoice #: {invoiceNumber}
      </div>

      {/* Tech & Account Selection */}
      <div className="flex gap-2 mb-4">
        <select
          value={tech}
          onChange={(e) => {
            setTech(e.target.value);
            setInvoiceNumber(generateInvoiceNumber());
          }}
          className="border p-2 rounded w-1/2"
        >
          <option value="">Select Tech</option>
          <option value="JohnDoe12">John Doe</option>
          <option value="JaneSmith34">Jane Smith</option>
          {/* Replace with dynamic later */}
        </select>

        <select
          value={account}
          onChange={(e) => setAccount(e.target.value)}
          className="border p-2 rounded w-1/2"
        >
          <option value="">Select Account</option>
          <option value="Core Market Automotive">Core Market Automotive</option>
          <option value="Core Market Residential">
            Core Market Residential
          </option>
          <option value="Core Market Commercial">Core Market Commercial</option>
        </select>
      </div>

      {/* PO and Notes */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="PO Number"
          value={po}
          onChange={(e) => setPo(e.target.value)}
          className="border p-2 rounded w-full mb-2"
        />
        <textarea
          placeholder="Notes (Work performed...)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="border p-2 rounded w-full"
          rows={3}
        />
      </div>

      {/* Add Item Form */}
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
          onChange={(e) =>
            setPrice(e.target.value === "" ? "" : Number(e.target.value))
          }
          className="border p-2 rounded w-1/4"
        />
        <button
          onClick={addItem}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add
        </button>
      </div>

      {/* Item List */}
      <ul className="space-y-2 mb-4">
        {items.map((item, index) => (
          <li
            key={index}
            className="flex justify-between border-b py-1 text-gray-700"
          >
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
                updateItem(
                  index,
                  "price",
                  e.target.value === "" ? 0 : Number(e.target.value)
                )
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

      {/* Total */}
      <div className="text-right font-bold text-xl mb-4">
        Total: ${total.toFixed(2)}
      </div>

      {/* Export Button */}
      <button
        onClick={exportToExcel}
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        Export to Excel
      </button>
    </div>
  );
}



















