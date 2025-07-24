"use client";

import { useState, useEffect } from "react";
import * as XLSX from "xlsx";

type Item = {
  desc: string;
  price: number;
};

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [selectedTech, setSelectedTech] = useState("");
  const [selectedAccount, setSelectedAccount] = useState("");
  const [notes, setNotes] = useState("");

  // Mock technician and accounts (replace with dynamic later)
  const technicians = [
    { name: "Mark Lee (ALL)", market: "ALL" },
    { name: "John Smith (TAL)", market: "TAL" },
    { name: "Sarah Jones (JAX)", market: "JAX" },
  ];

  const accounts = [
    { name: "Core Market Auto", market: "ALL" },
    { name: "Core Market Residential", market: "ALL" },
    { name: "Core Market Commercial", market: "ALL" },
    { name: "Acme Corp", market: "TAL" },
    { name: "Beta LLC", market: "JAX" },
  ];

  // ✅ Load saved data from localStorage
  useEffect(() => {
    const savedItems = localStorage.getItem("invoiceItems");
    const savedTech = localStorage.getItem("selectedTech");
    const savedAccount = localStorage.getItem("selectedAccount");
    const savedNotes = localStorage.getItem("invoiceNotes");

    if (savedItems) setItems(JSON.parse(savedItems));
    if (savedTech) setSelectedTech(savedTech);
    if (savedAccount) setSelectedAccount(savedAccount);
    if (savedNotes) setNotes(savedNotes);
  }, []);

  // ✅ Save items, tech, account, and notes to localStorage
  useEffect(() => {
    localStorage.setItem("invoiceItems", JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem("selectedTech", selectedTech);
  }, [selectedTech]);

  useEffect(() => {
    localStorage.setItem("selectedAccount", selectedAccount);
  }, [selectedAccount]);

  useEffect(() => {
    localStorage.setItem("invoiceNotes", notes);
  }, [notes]);

  const addItem = () => {
    if (!desc || !price || Number(price) <= 0) return;
    setItems((prev) => [...prev, { desc, price: Number(price) }]);
    setDesc("");
    setPrice("");
  };

  const updateItem = (index: number, key: keyof Item, value: string | number) => {
    const updated = [...items];
    updated[index][key] = key === "price" ? Number(value) : (value as string);
    setItems(updated);
  };

  const deleteItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const total = items.reduce((sum, item) => sum + item.price, 0);

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet([
      { Technician: selectedTech, Account: selectedAccount, Notes: notes },
      ...items.map((item) => ({
        Description: item.desc,
        Price: item.price.toFixed(2),
      })),
      { Total: total.toFixed(2) },
    ]);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Invoice");
    XLSX.writeFile(wb, "invoice.xlsx");
  };

  // ✅ Filter accounts: always include "ALL" + tech's specific market
  const filteredAccounts = accounts.filter(
    (acc) =>
      acc.market === "ALL" ||
      technicians.find((t) => t.name === selectedTech)?.market === acc.market
  );

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">Locksmith Invoicing</h1>

      {/* Technician Selection */}
      <label className="font-semibold">Select Technician:</label>
      <select
        value={selectedTech}
        onChange={(e) => setSelectedTech(e.target.value)}
        className="border p-2 rounded w-full mb-4"
      >
        <option value="">-- Select Technician --</option>
        {technicians.map((tech, index) => (
          <option key={index} value={tech.name}>
            {tech.name}
          </option>
        ))}
      </select>

      {/* Account Selection */}
      <label className="font-semibold">Select Account:</label>
      <select
        value={selectedAccount}
        onChange={(e) => setSelectedAccount(e.target.value)}
        className="border p-2 rounded w-full mb-4"
      >
        <option value="">-- Select Account --</option>
        {filteredAccounts.map((acc, index) => (
          <option key={index} value={acc.name}>
            {acc.name}
          </option>
        ))}
      </select>

      {/* Notes */}
      <label className="font-semibold">Work Performed / Notes:</label>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="border p-2 rounded w-full mb-4"
        rows={3}
      />

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

      {/* Item List */}
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

      {/* Total */}
      <div className="text-right font-bold text-xl mb-4">Total: ${total.toFixed(2)}</div>

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
















