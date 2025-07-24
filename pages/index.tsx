"use client";

import { useState, useEffect } from "react";

// ✅ Hardcoded Techs & Markets (from your XLS)
const TECHS = [
  { name: "John Smith", market: "TPA" },
  { name: "Jane Doe", market: "BHM" },
  { name: "Alex Brown", market: "JAX" },
  // Add more as needed...
];

// ✅ Hardcoded Accounts (from your CSV)
const ACCOUNTS = [
  { name: "1 Stop Maintenance", rules: "Bill net 30, service fee waived", location: "All" },
  { name: "ABC Properties", rules: "Add $25 after hours", location: "TPA" },
  { name: "Sunrise Apartments", rules: "Must call before service", location: "BHM" },
  // Add more as needed...
];

type Item = {
  desc: string;
  price: number;
};

export default function Home() {
  const [tech, setTech] = useState<string>("");
  const [market, setMarket] = useState<string>("");
  const [account, setAccount] = useState<string>("");
  const [items, setItems] = useState<Item[]>([]);
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [po, setPO] = useState("");
  const [notes, setNotes] = useState("");

  // ✅ Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("invoiceItems");
    if (saved) {
      setItems(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("invoiceItems", JSON.stringify(items));
  }, [items]);

  const addItem = () => {
    if (!desc || !price || Number(price) <= 0) return;
    setItems((prev) => [...prev, { desc, price: Number(price) }]);
    setDesc("");
    setPrice("");
  };

  const updateItem = (index: number, key: keyof Item, value: string | number) => {
  const updated = [...items];
  (updated[index][key] as Item[keyof Item]) =
    key === "price" ? Number(value) : (value as string);
  setItems(updated);
};


  const deleteItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const total = items.reduce((sum, item) => sum + item.price, 0);

  const filteredAccounts = ACCOUNTS.filter(
    (acc) => acc.location === "All" || acc.location === market
  );

  const showRules = () => {
    const acc = ACCOUNTS.find((a) => a.name === account);
    if (acc) alert(`Billing Rules: ${acc.rules}`);
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">Locksmith Invoicing</h1>

      {/* ✅ Tech Selection */}
      <div className="mb-4">
        <label className="font-bold">Select Technician:</label>
        <select
          value={tech}
          onChange={(e) => {
            const selectedTech = TECHS.find((t) => t.name === e.target.value);
            setTech(e.target.value);
            setMarket(selectedTech ? selectedTech.market : "");
            setAccount(""); // reset account when tech changes
          }}
          className="border p-2 rounded w-full mt-1"
        >
          <option value="">-- Select Tech --</option>
          {TECHS.map((t, i) => (
            <option key={i} value={t.name}>
              {t.name} ({t.market})
            </option>
          ))}
        </select>
      </div>

      {/* ✅ Account Selection */}
      {market && (
        <div className="mb-4">
          <label className="font-bold">Select Account:</label>
          <select
            value={account}
            onChange={(e) => {
              setAccount(e.target.value);
              showRules();
            }}
            className="border p-2 rounded w-full mt-1"
          >
            <option value="">-- Select Account --</option>
            {filteredAccounts.map((acc, i) => (
              <option key={i} value={acc.name}>
                {acc.name} ({acc.location})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* ✅ PO & Notes */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="PO Number"
          value={po}
          onChange={(e) => setPO(e.target.value)}
          className="border p-2 rounded w-full mb-2"
        />
        <textarea
          placeholder="Notes (Work performed)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="border p-2 rounded w-full"
          rows={3}
        />
      </div>

      {/* ✅ Add Item Form */}
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

      {/* ✅ Item List */}
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

      {/* ✅ Total */}
      <div className="text-right font-bold text-xl mb-4">Total: ${total.toFixed(2)}</div>
    </div>
  );
}














