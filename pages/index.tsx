"use client";

import { useState, useEffect } from "react";
import * as XLSX from "xlsx";

// ✅ Define Types
type Item = {
  desc: string;
  price: number;
};

type Account = {
  name: string;
  rules: string;
  market: string;
};

type Tech = {
  name: string;
  market: string;
  id: string;
};

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [notes, setNotes] = useState("");

  const [techs, setTechs] = useState<Tech[]>([]);
  const [selectedTech, setSelectedTech] = useState<Tech | null>(null);

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  // ✅ Load techs & accounts from JSON we generated
  useEffect(() => {
    fetch("/techs.json")
      .then((res) => res.json())
      .then((data) => setTechs(data));

    fetch("/accounts.json")
      .then((res) => res.json())
      .then((data) => setAccounts(data));
  }, []);

  // ✅ Load saved invoice from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("invoiceData");
    if (saved) {
      const parsed = JSON.parse(saved);
      setItems(parsed.items || []);
      setNotes(parsed.notes || "");
      setSelectedTech(parsed.selectedTech || null);
      setSelectedAccount(parsed.selectedAccount || null);
    }
  }, []);

  // ✅ Save invoice to localStorage
  useEffect(() => {
    localStorage.setItem(
      "invoiceData",
      JSON.stringify({ items, notes, selectedTech, selectedAccount })
    );
  }, [items, notes, selectedTech, selectedAccount]);

  // ✅ Filter accounts when tech changes
  useEffect(() => {
    if (selectedTech) {
      const filtered = accounts.filter(
        (acc) =>
          acc.market === "all" || acc.market === selectedTech.market
      );
      setFilteredAccounts(filtered);
    }
  }, [selectedTech, accounts]);

  // ✅ Add Item
  const addItem = () => {
    if (!desc || !price || Number(price) <= 0) return;
    setItems((prev) => [...prev, { desc, price: Number(price) }]);
    setDesc("");
    setPrice("");
  };

  // ✅ Update Item
  const updateItem = (
    index: number,
    key: keyof Item,
    value: string | number
  ) => {
    const updated: Item[] = [...items];
    updated[index] = {
      ...updated[index],
      [key]: key === "price" ? Number(value) : (value as string),
    };
    setItems(updated);
  };

  // ✅ Delete Item
  const deleteItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // ✅ Total
  const total = items.reduce((sum, item) => sum + item.price, 0);

  // ✅ Invoice Number Generation
  const generateInvoiceNumber = () => {
    if (!selectedTech) return "Select a tech first";
    const techSuffix = selectedTech.id.slice(-2);
    const marketID = selectedTech.market;
    const sequence = localStorage.getItem("invoiceSequence") || "1";
    const newSeq = String(Number(sequence)).padStart(5, "0");
    localStorage.setItem("invoiceSequence", String(Number(sequence) + 1));
    return `${marketID}-${techSuffix}-${newSeq}`;
  };

  const invoiceNumber = generateInvoiceNumber();

  // ✅ Export to Excel
  const exportToExcel = () => {
    const wsData = [
      ["Invoice Number", invoiceNumber],
      ["Tech", selectedTech?.name || ""],
      ["Account", selectedAccount?.name || ""],
      [],
      ["Description", "Price"],
      ...items.map((item) => [item.desc, item.price]),
      [],
      ["Notes", notes],
      ["Total", total.toFixed(2)],
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Invoice");
    XLSX.writeFile(wb, `invoice_${invoiceNumber}.xlsx`);
  };

  // ✅ Show Rules Popup
  const handleAccountChange = (accName: string) => {
    const acc = accounts.find((a) => a.name === accName) || null;
    setSelectedAccount(acc);
    if (acc?.rules) alert(`Billing Rules:\n${acc.rules}`);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">
        Locksmith Invoicing
      </h1>

      {/* Invoice Number Display */}
      <div className="text-lg font-semibold mb-4">
        Invoice #: {invoiceNumber}
      </div>

      {/* Tech Dropdown */}
      <select
        value={selectedTech?.name || ""}
        onChange={(e) => {
          const tech = techs.find((t) => t.name === e.target.value) || null;
          setSelectedTech(tech);
        }}
        className="border p-2 rounded w-full mb-4"
      >
        <option value="">Select Technician</option>
        {techs.map((tech, i) => (
          <option key={i} value={tech.name}>
            {tech.name} ({tech.market})
          </option>
        ))}
      </select>

      {/* Account Dropdown */}
      {selectedTech && (
        <select
          value={selectedAccount?.name || ""}
          onChange={(e) => handleAccountChange(e.target.value)}
          className="border p-2 rounded w-full mb-4"
        >
          <option value="">Select Account</option>
          {filteredAccounts.map((acc, i) => (
            <option key={i} value={acc.name}>
              {acc.name}
            </option>
          ))}
        </select>
      )}

      {/* Items */}
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

      {/* Notes */}
      <textarea
        placeholder="Work performed / Notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="border p-2 rounded w-full mb-4"
      />

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



















