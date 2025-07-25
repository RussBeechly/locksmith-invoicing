"use client";

import { useState, useEffect } from "react";
import * as XLSX from "xlsx";

// ✅ Techs & Location IDs (from your XLS file)
const TECHS = [
  { name: "John Doe", techId: "3401", locationId: "TPA" },
  { name: "Jane Smith", techId: "3502", locationId: "ORL" },
  { name: "Mike Lee", techId: "3603", locationId: "JAX" }
];

// ✅ Accounts & Rules (CSV data already loaded previously)
const ACCOUNTS = [
  { name: "Core Market Automotive", rules: "Standard Auto billing", location: "all" },
  { name: "Core Market Residential", rules: "Standard Res billing", location: "all" },
  { name: "Core Market Commercial", rules: "Standard Comm billing", location: "all" },
  { name: "Acme Corp", rules: "Net 30, parts markup 20%", location: "TPA" },
];

type Item = { desc: string; price: number };

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [selectedTech, setSelectedTech] = useState("");
  const [selectedAccount, setSelectedAccount] = useState("");
  const [notes, setNotes] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");

  // ✅ Load saved items & tech selection
  useEffect(() => {
    const saved = localStorage.getItem("invoiceItems");
    if (saved) setItems(JSON.parse(saved));

    const savedTech = localStorage.getItem("selectedTech");
    if (savedTech) setSelectedTech(savedTech);

    const savedAccount = localStorage.getItem("selectedAccount");
    if (savedAccount) setSelectedAccount(savedAccount);

    const savedNotes = localStorage.getItem("invoiceNotes");
    if (savedNotes) setNotes(savedNotes);
  }, []);

  // ✅ Save on every change
  useEffect(() => {
    localStorage.setItem("invoiceItems", JSON.stringify(items));
    localStorage.setItem("selectedTech", selectedTech);
    localStorage.setItem("selectedAccount", selectedAccount);
    localStorage.setItem("invoiceNotes", notes);
  }, [items, selectedTech, selectedAccount, notes]);

  // ✅ Auto-generate Invoice Number when tech changes
  useEffect(() => {
    if (!selectedTech) return;
    const techData = TECHS.find((t) => t.name === selectedTech);
    if (!techData) return;

    const seqKey = `seq_${techData.locationId}_${techData.techId}`;
    let seq = parseInt(localStorage.getItem(seqKey) || "0", 10) + 1;
    localStorage.setItem(seqKey, seq.toString());

    const techLast2 = techData.techId.slice(-2);
    const paddedSeq = seq.toString().padStart(4, "0");
    setInvoiceNumber(`${techData.locationId}${techLast2}${paddedSeq}`);
  }, [selectedTech]);

  const addItem = () => {
    if (!desc || !price || Number(price) <= 0) return;
    setItems((prev) => [...prev, { desc, price: Number(price) }]);
    setDesc("");
    setPrice("");
  };

  const updateItem = (index: number, key: keyof Item, value: string | number) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [key]: key === "price" ? Number(value) : (value as string),
      };
      return updated;
    });
  };

  const deleteItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const total = items.reduce((sum, item) => sum + item.price, 0);

  const exportToExcel = () => {
    const wsData = [
      ["Invoice Number", invoiceNumber],
      ["Tech", selectedTech],
      ["Account", selectedAccount],
      ["Notes", notes],
      [],
      ["Description", "Price"],
      ...items.map((i) => [i.desc, i.price]),
      [],
      ["Total", total]
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Invoice");
    XLSX.writeFile(wb, `${invoiceNumber || "invoice"}.xlsx`);
  };

  const handleAccountChange = (accountName: string) => {
    setSelectedAccount(accountName);
    const acc = ACCOUNTS.find((a) => a.name === accountName);
    if (acc?.rules) alert(`Billing Rules: ${acc.rules}`);
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">Locksmith Invoicing</h1>

      {/* ✅ Tech & Invoice Display */}
      <div className="flex gap-2 mb-4">
        <select
          value={selectedTech}
          onChange={(e) => setSelectedTech(e.target.value)}
          className="border p-2 rounded w-1/2"
        >
          <option value="">Select Tech</option>
          {TECHS.map((tech) => (
            <option key={tech.techId} value={tech.name}>
              {tech.name}
            </option>
          ))}
        </select>
        {invoiceNumber && (
          <div className="font-bold text-lg bg-gray-100 p-2 rounded">
            Invoice #: {invoiceNumber}
          </div>
        )}
      </div>

      {/* ✅ Account Selection */}
      <div className="mb-4">
        <select
          value={selectedAccount}
          onChange={(e) => handleAccountChange(e.target.value)}
          className="border p-2 rounded w-full"
        >
          <option value="">Select Account</option>
          {ACCOUNTS.filter(
            (acc) =>
              acc.location === "all" ||
              TECHS.find((t) => t.name === selectedTech)?.locationId === acc.location
          ).map((acc) => (
            <option key={acc.name} value={acc.name}>
              {acc.name}
            </option>
          ))}
        </select>
      </div>

      {/* ✅ Add Items */}
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

      {/* ✅ Items List */}
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

      {/* ✅ Notes */}
      <textarea
        placeholder="Work performed / notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="border p-2 rounded w-full mb-4"
      />

      {/* ✅ Total & Export */}
      <div className="text-right font-bold text-xl mb-4">Total: ${total.toFixed(2)}</div>
      <button
        onClick={exportToExcel}
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        Export to Excel
      </button>
    </div>
  );
}


















