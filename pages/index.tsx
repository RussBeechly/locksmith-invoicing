"use client";
import { useState, useEffect } from "react";

type Item = {
  desc: string;
  price: number;
};

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState<number>(0);

  // Load from localStorage on first render
  useEffect(() => {
    const storedItems = localStorage.getItem("invoiceItems");
    if (storedItems) {
      setItems(JSON.parse(storedItems));
    }
  }, []);

  // Save to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem("invoiceItems", JSON.stringify(items));
  }, [items]);

  const addItem = () => {
    if (!desc || price <= 0) return;
    const newItem: Item = { desc, price };
    setItems((prev) => [...prev, newItem]);
    setDesc("");
    setPrice(0);
  };

  const deleteItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, key: "desc" | "price", value: string) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? { ...item, [key]: key === "price" ? parseFloat(value) || 0 : value }
          : item
      )
    );
  };

  const total = items.reduce((sum, item) => sum + item.price, 0);

  // CSV Export
  const exportToCSV = () => {
    const csvRows = [
      ["Description", "Price"],
      ...items.map((item) => [item.desc, item.price.toFixed(2)]),
      ["Total", total.toFixed(2)],
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      csvRows.map((row) => row.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "invoice.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">
        Locksmith Invoicing
      </h1>

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
          value={price === 0 ? "" : price}
          onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
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
            className="flex justify-between items-center border-b py-1"
          >
            <input
              type="text"
              value={item.desc}
              onChange={(e) => updateItem(index, "desc", e.target.value)}
              className="border p-1 rounded w-1/2"
            />
            <input
              type="number"
              value={item.price === 0 ? "" : item.price}
              onChange={(e) => updateItem(index, "price", e.target.value)}
              className="border p-1 rounded w-1/4 text-right"
            />
            <button
              onClick={() => deleteItem(index)}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
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
        onClick={exportToCSV}
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        Export to CSV
      </button>
    </div>
  );
}










