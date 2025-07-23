import { useState } from "react";

type Item = {
  desc: string;
  price: number;
};

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState<number>(0);

  const addItem = () => {
    if (!desc || price <= 0) return;
    const newItem: Item = { desc, price };
    setItems((prev) => [...prev, newItem]);
    setDesc("");
    setPrice(0);
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
          value={price || ""}
          onChange={(e) => setPrice(parseFloat(e.target.value))}
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
            <span>{item.desc}</span>
            <span>${item.price.toFixed(2)}</span>
          </li>
        ))}
      </ul>

      <div className="text-right font-bold text-xl">
        Total: ${total.toFixed(2)}
      </div>
    </div>
  );
}



