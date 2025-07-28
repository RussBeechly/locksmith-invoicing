"use client";

import { useState, useEffect } from "react";
import * as XLSX from "xlsx";

type Item = {
  desc: string;
  price: number;
};

type Invoice = {
  invoiceNumber: string;
  tech: string;
  account: string;
  notes: string;
  items: Item[];
  total: number;
};

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [tech, setTech] = useState("");
  const [account, setAccount] = useState("");
  const [notes, setNotes] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [allInvoices, setAllInvoices] = useState<Invoice[]>([]);

  // Load data from localStorage on first load
  useEffect(() => {
    const savedItems = localStorage.getItem("invoiceItems");
    const savedTech = localStorage.getItem("selectedTech");
    const savedAccount = localStorage.getItem("selectedAccount");
    const savedNotes = localStorage.getItem("invoiceNotes");
    const savedInvoices = localStorage.getItem("allInvoices");

    if (savedItems) setItems(JSON.parse(savedItems));
    if (savedTech) setTech(savedTech);
    if (savedAccount) setAccount(savedAccount);
    if (savedNotes) setNotes(savedNotes);
    if (savedInvoices) setAllInvoices(JSON.parse(savedInvoices));
  }, []);

  // Save data to localStorage whenever something changes
  useEffect(() => {
    localStorage.setItem("invoiceItems", JSON.stringify(items));
    localStorage.setItem("selectedTech", tech);
    localStorage.setItem("selectedAccount", account);
    localStorage.setItem("invoiceNotes", notes);
    localStorage.setItem("allInvoices", JSON.stringify(allInvoices));
  }, [items, tech, account, notes, allInvoices]);

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

  // Generate invoice number
  const generateInvoiceNumber = () => {
    const today = new Date();
    const datePart = today.toISOString().slice(2, 10).replace(/-/g, ""); // YYMMDD
    const sequence = (allInvoices.length + 1).toString().padStart(4, "0");
    return `INV-${datePart}-${sequence}`;
  };

  const exportToExcel = () => {
    if (!tech || !account || items.length === 0) {
      alert("Please fill Tech, Account, and add at least one item before exporting.");
      return;
    }

    const newInvoiceNumber = invoiceNumber || generateInvoiceNumber();
    setInvoiceNumber(newInvoiceNumber);

    const wsData = [
      ["Invoice Number", newInvoiceNumber],
      ["Technician", tech],
      ["Account", account],
      ["Notes", notes],
      [],
      ["Description", "Price"],
      ...items.map((item) => [item.desc, item.price.toFixed(2)]),
      [],
      ["Total", total.toFixed(2)],
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Invoice");
    XLSX.writeFile(wb, `${newInvoiceNumber}.xlsx`);

    const newInvoice: Invoice = {
      invoiceNumber: newInvoiceNumber,
      tech,
      account,
      notes,
      items,
      total,
    };

    setAllInvoices((prev) => [...prev, newInvoice]);

    alert(`Invoice ${newInvoiceNumber} exported successfully!`);
  };

  const loadInvoice = (invoice: Invoice) => {
    setInvoiceNumber(invoice.invoiceNumber);
    setTech(invoice.tech);
    setAccount(invoice.account);
    setNotes(invoice.notes);
    setItems(invoice.items);
  };

  const deleteInvoice = (invoiceNumber: string) => {
    if (!confirm(`Delete invoice ${invoiceNumber}?`)) return;
    setAllInvoices(allInvoices.filter((inv) => inv.invoiceNumber !== invoiceNumber));
  };

  const clearAllInvoices = () => {
    if (!confirm("Are you sure you want to clear all past invoices?")) return;
    setAllInvoices([]);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">Locksmith Invoicing</h1>

      {/* Invoice Info */}
      <div className="mb-4 text-gray-700 font-semibold">
        Invoice #: {invoiceNumber || "Will generate on export"}
      </div>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Technician"
          value={tech}
          onChange={(e) => setTech(e.target.value)}
          className="border p-2 rounded w-1/2"
        />
        <input
          type="text"
          placeholder="Account"
          value={account}
          onChange={(e) => setAccount(e.target.value)}
          className="border p-2 rounded w-1/2"
        />
      </div>

      <textarea
        placeholder="Notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="border p-2 rounded w-full mb-4"
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

      {/* Total and Export */}
      <div className="text-right font-bold text-xl mb-4">Total: ${total.toFixed(2)}</div>
      <button
        onClick={exportToExcel}
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mb-6"
      >
        Export to Excel
      </button>

      {/* Past Invoices Viewer */}
      <h2 className="text-2xl font-bold mb-2">Past Invoices</h2>
      {allInvoices.length === 0 ? (
        <p className="text-gray-500">No past invoices yet.</p>
      ) : (
        <>
          <table className="w-full border text-sm text-left mb-2">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2 border">Invoice #</th>
                <th className="p-2 border">Tech</th>
                <th className="p-2 border">Account</th>
                <th className="p-2 border">Total</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {allInvoices.map((inv, idx) => (
                <tr key={idx} className="border-b">
                  <td className="p-2 border">{inv.invoiceNumber}</td>
                  <td className="p-2 border">{inv.tech}</td>
                  <td className="p-2 border">{inv.account}</td>
                  <td className="p-2 border">${inv.total.toFixed(2)}</td>
                  <td className="p-2 border">
                    <button
                      onClick={() => loadInvoice(inv)}
                      className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 mr-2"
                    >
                      View
                    </button>
                    <button
                      onClick={() => deleteInvoice(inv.invoiceNumber)}
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            onClick={clearAllInvoices}
            className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700"
          >
            Clear All
          </button>
        </>
      )}
    </div>
  );
}



















