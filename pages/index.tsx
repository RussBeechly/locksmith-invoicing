"use client";

import { useState, useEffect } from "react";

type Item = {
  id: number;
  desc: string;
  price: number;
};

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Load items from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("invoiceItems");
    if (saved) {
      setItems(JSON.parse(saved));
    }
  }, []);

  // Save items to localStorage
  useEffect(() => {
    localStorage.setItem("invoiceItems", JSON.stringify(items));
  }, [items]);

  const addItem = () => {
    if (!desc || price <= 0) return;

    if (editingId !== null) {
      // Editing existing item
      setItems((prev) =>
        prev.map((item) =>
          item.id === editingId ? { ...item, desc, price } : item
        )
      );
      setEditingId(null);
    } else {
      // Adding new item
      const newItem: Item = {
        id: Date.now(),
        desc,
        price,
      };
      setItems((prev) => [...prev, newItem]);
    }

    setDesc("");
    setPrice(0);
  };

  const deleteItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const startEdit = (item: Item) => {
    setEditingId(item.id);
    setDesc(item.desc);
    setPrice(item.price);
  };

  const total = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">
        Locksmith Invoicing with Tailwind!
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
          onChange={(e) => setPrice(Number(e.target.value) || 0)}
          className="border p-2 rounded w-1/4"
        />
        <button
          onClick={addItem}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {editingId !== null ? "Update" : "Add"}
        </button>
      </div>

      <ul className="space-y-2 mb-4">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex justify-between border-b py-1 text-gray-700"
          >
            <div>
              <span className="font-medium">{item.desc}</span> - $
              {item.price.toFixed(2)}
            </div>
            <div className="space-x-2">
              <button
                onClick={() => startEdit(item)}
                className="text-sm text-blue-500 hover:underline"
              >
                Edit
              </button>
              <button
                onClick={() => deleteItem(item.id)}
                className="text-sm text-red-500 hover:underline"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="text-right font-bold text-xl">
        Total: ${total.toFixed(2)}
      </div>
    </div>
  );
}








