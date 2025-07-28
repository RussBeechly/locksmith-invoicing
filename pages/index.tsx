import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { downloadExcel } from "../utils/exportUtils";

interface Item {
  description: string;
  price: number;
}

export default function Home() {
  const [technician, setTechnician] = useState("");
  const [account, setAccount] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  const addItem = () => {
    if (!description || !price) return;
    setItems([...items, { description, price: parseFloat(price) }]);
    setDescription("");
    setPrice("");
  };

  const deleteItem = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
  };

  const total = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">Locksmith Invoicing</h1>

      <label className="font-semibold">Select Technician:</label>
      <Input
        placeholder="Technician name"
        value={technician}
        onChange={(e) => setTechnician(e.target.value)}
        className="mb-2"
      />

      <label className="font-semibold">Select Account:</label>
      <Input
        placeholder="Account name"
        value={account}
        onChange={(e) => setAccount(e.target.value)}
        className="mb-2"
      />

      <label className="font-semibold">Work Performed / Notes:</label>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="w-full h-24 p-2 border rounded mb-4"
      />

      <div className="flex space-x-2 mb-4">
        <Input
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Input
          placeholder="Price"
          value={price}
          type="number"
          onChange={(e) => setPrice(e.target.value)}
        />
        <Button onClick={addItem}>Add</Button>
      </div>

      {items.map((item, index) => (
        <div key={index} className="flex space-x-2 items-center mb-2">
          <Input
            value={item.description}
            onChange={(e) => {
              const updated = [...items];
              updated[index].description = e.target.value;
              setItems(updated);
            }}
          />
          <Input
            type="number"
            value={item.price}
            onChange={(e) => {
              const updated = [...items];
              updated[index].price = parseFloat(e.target.value);
              setItems(updated);
            }}
          />
          <Button variant="destructive" onClick={() => deleteItem(index)}>
            Delete
          </Button>
        </div>
      ))}

      <p className="text-xl font-bold mt-4">Total: ${total.toFixed(2)}</p>

      <Button className="mt-4" onClick={() => downloadExcel(technician, account, notes, items)}>
        Export to Excel
      </Button>
    </div>
  );
}





















