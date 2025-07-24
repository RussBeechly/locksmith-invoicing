"use client";

import { useState, useEffect } from "react";
import * as XLSX from "xlsx"; // ✅ XLSX for Excel export

type Item = {
  desc: string;
  price: number;
};

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [notes, setNotes] = useState("");
  const [tech, setTech] = useState("");
  const [account, setAccount] = useState("");

  // ✅ Load saved data from localStorage
  useEffect(() => {
    const savedItems = localStorage.getItem("invoiceItems");
    const savedNotes = localStorage.getItem("invoiceNotes");
    const savedTech = localStorage.getItem("selectedTech");
    const savedAccount = localStorage.getItem("selectedAccount");

    if (savedItems) setItems(JSON.parse(savedItems));
    if (savedNotes) setNotes(savedNotes);
    if (savedTech) setTech(savedTech);
    if (savedAccount) setAccount(savedAccount);
  }, []);

  // ✅ Save data to localStorage
  useEffect(() => {
    localStorage.setItem("invoiceItems", JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem("invoiceNotes", notes);
  }, [notes]);

  useEffect(() => {
    localStorage.setItem("selectedTech", tech);
  }, [tech]);

  useEffect(() => {
    localStorage.setItem("selectedAccount", account);
  }, [account]);

  const addItem = () => {
    if (!desc || !price || Number(price) <= 0) return;
    setItems((prev) => [...prev, { desc, price: Number(price) }]);
    setDesc("");
    setPrice("");
  };

  // ✅ Option 2 fix — strict type-safe updating
  const updateItem = <K extends keyof Item>(
    index: number,
    key: K,
    value: Item[K]
  ) => {
    const updated = [...items];
    updated[index][key] = value;
    setItems(updated);
  };

  const deleteItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const total = items.reduce((sum, item) => sum + item.price, 0);

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet([
      { Technician: tech, Account: account, Notes: notes, Total: total },
      {},
      ...items.map((item) => ({
        Description: item.desc,
        Price: item.price.toFixed(2),
      })),
    ]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Invoice");
    XLSX.writeFile(workbook, "invoice.xlsx");
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">Locksmith Invoicing</h1>

      {/* Technician Dropdown */}
      <label className="font-semibold">Select Technician:</label>
      <select
        value={tech}
        onChange={(e) => setTech(e.target.value)}
        className="border p-2 rounded w-full mb-4"
      >
        <option value="">-- Select Technician --</option>
        <option value="Mark Lee (ALL)">Mark Lee (ALL)</option>
        <option value="John Smith">John Smith</option>
        {/* ✅ We’ll replace this with dynamic techs later */}
      </select>

      {/* Account Dropdown */}
      <label className="font-semibold">Select Account:</label>
      <select
        value={account}
        onChange={(e) => setAccount(e.target.value)}
        className="border p-2 rounded w-full mb-4"
      >
        <option value="">-- Select Account --</option>
        <option value="Core Market Auto">Core Market Auto</option>
        <option value="Core Market Residential">Core Market Residential</option>
        <option value="Core Market Commercial">Core Market Commercial</option>
        {/* ✅ Will dynamically populate from CSV later */}
      </select>

      {/* Notes */}
      <label className="font-semibold">Work Performed / Notes:</label>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="border p-2 rounded w-full mb-4"
        rows={3}
      />

      {/* Add Item */}
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
          <li key={index} className="flex justify-between gap-2">
            <input
              type="text"
              value={item.desc}
              onChange={(e) =>
                updateItem(index, "desc", e.target.value as Item["desc"])
              }
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

















