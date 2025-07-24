"use client";

import { useState, useEffect } from "react";
import * as XLSX from "xlsx";

// ✅ Simulated techs (Phase 2 will replace this with your XLS)
const techs = [
  { name: "John Doe", market: "JAX" },
  { name: "Jane Smith", market: "TPA" },
  { name: "Mark Lee", market: "ALL" }
];

// ✅ Pulled from your CSV (simplified here but real names/billing rules included)
const accounts = [
  { name: "Core Market Auto", rules: "Standard auto billing rules", market: "All" },
  { name: "Core Market Commercial", rules: "Commercial lock billing rules", market: "All" },
  { name: "Samspal Account A", rules: "Bill per door - parts not included", market: "JAX" },
  { name: "Samspal Account B", rules: "Flat rate - $75 first hour", market: "TPA" }
];

type Item = {
  desc: string;
  price: number;
};

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [notes, setNotes] = useState("");
  const [selectedTech, setSelectedTech] = useState("");
  const [selectedAccount, setSelectedAccount] = useState("");

  // ✅ Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("invoiceData");
    if (saved) {
      const data = JSON.parse(saved);
      setItems(data.items || []);
      setNotes(data.notes || "");
      setSelectedTech(data.tech || "");
      setSelectedAccount(data.account || "");
    }
  }, []);

  // ✅ Save to localStorage on every change
  useEffect(() => {
    localStorage.setItem(
      "invoiceData",
      JSON.stringify({
        items,
        notes,
        tech: selectedTech,
        account: selectedAccount
      })
    );
  }, [items, notes, selectedTech, selectedAccount]);

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
      ...items.map((i) => ({ Description: i.desc, Price: i.price })),
      { Description: "Total", Price: total }
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Invoice");
    XLSX.writeFile(wb, "invoice.xlsx");
  };

  // ✅ Filter accounts based on selected tech's market
  const filteredAccounts = (() => {
    if (!selectedTech) return [];
    const techMarket = techs.find((t) => t.name === selectedTech)?.market;
    return accounts.filter(
      (a) => a.market === "All" || a.market === techMarket
    );
  })();

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">Locksmith Invoicing</h1>

      {/* ✅ Tech Dropdown */}
      <div className="mb-4">
        <label className="font-semibold">Select Technician:</label>
        <select
          value={selectedTech}
          onChange={(e) => setSelectedTech(e.target.value)}
          className="border p-2 rounded w-full"
        >
          <option value="">-- Select Tech --</option>
          {techs.map((t, i) => (
            <option key={i} value={t.name}>
              {t.name} ({t.market})
            </option>
          ))}
        </select>
      </div>

      {/* ✅ Account Dropdown */}
      <div className="mb-4">
        <label className="font-semibold">Select Account:</label>
        <select
          value={selectedAccount}
          onChange={(e) => setSelectedAccount(e.target.value)}
          className="border p-2 rounded w-full"
          disabled={!selectedTech}
        >
          <option value="">-- Select Account --</option>
          {filteredAccounts.map((a, i) => (
            <option key={i} value={a.name}>
              {a.name}
            </option>
          ))}
        </select>
      </div>

      {/* ✅ Notes Field */}
      <div className="mb-4">
        <label className="font-semibold">Work Performed / Notes:</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="border p-2 rounded w-full"
          rows={3}
        />
      </div>

      {/* ✅ Line Items */}
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

      <button
        onClick={exportToExcel}
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        Export to Excel
      </button>
    </div>
  );
}















