import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { downloadExcel } from "../utils/exportUtils";
import { technicians, accounts } from "../data/mockData"; // Will be replaced by actual imports

interface Item {
  description: string;
  quantity: number;
  price: number;
}

export default function Home() {
  const [tech, setTech] = useState("");
  const [account, setAccount] = useState("");
  const [invoiceNum, setInvoiceNum] = useState("");
  const [po, setPo] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<Item[]>([{ description: "", quantity: 1, price: 0 }]);
  const [rules, setRules] = useState("");

  useEffect(() => {
    const storedTech = localStorage.getItem("selectedTech");
    const storedAccount = localStorage.getItem("selectedAccount");
    const storedNotes = localStorage.getItem("invoiceNotes");
    const storedPo = localStorage.getItem("po");
    const storedInvoice = localStorage.getItem("invoiceNum");

    if (storedTech) setTech(storedTech);
    if (storedAccount) setAccount(storedAccount);
    if (storedNotes) setNotes(storedNotes);
    if (storedPo) setPo(storedPo);
    if (storedInvoice) setInvoiceNum(storedInvoice);
  }, []);

  useEffect(() => {
    localStorage.setItem("selectedTech", tech);
    localStorage.setItem("selectedAccount", account);
    localStorage.setItem("invoiceNotes", notes);
    localStorage.setItem("po", po);
    localStorage.setItem("invoiceNum", invoiceNum);
  }, [tech, account, notes, po, invoiceNum]);

  useEffect(() => {
    const selected = accounts.find(a => a.name === account);
    if (selected && selected.rules) {
      setRules(selected.rules);
      alert(`Billing Rules: ${selected.rules}`);
    } else {
      setRules("");
    }
  }, [account]);

  const updateItem = (index: number, key: keyof Item, value: string | number) => {
    const updated = [...items];
    updated[index][key] = key === "price" || key === "quantity" ? Number(value) : String(value);
    setItems(updated);
  };

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, price: 0 }]);
  };

  const removeItem = (index: number) => {
    const updated = [...items];
    updated.splice(index, 1);
    setItems(updated);
  };

  const handleExport = () => {
    downloadExcel({ tech, account, invoiceNum, po, notes, items });
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Locksmith Invoice</h1>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label>Technician</label>
          <select
            className="w-full border p-2"
            value={tech}
            onChange={(e) => setTech(e.target.value)}
          >
            <option value="">Select Technician</option>
            {technicians.map((t) => (
              <option key={t.id} value={t.name}>{t.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Account</label>
          <select
            className="w-full border p-2"
            value={account}
            onChange={(e) => setAccount(e.target.value)}
          >
            <option value="">Select Account</option>
            {accounts.map((a) => (
              <option key={a.name} value={a.name}>{a.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Invoice #</label>
          <Input value={invoiceNum} onChange={(e) => setInvoiceNum(e.target.value)} />
        </div>
        <div>
          <label>PO #</label>
          <Input value={po} onChange={(e) => setPo(e.target.value)} />
        </div>
      </div>

      <div>
        <label>Line Items</label>
        {items.map((item, idx) => (
          <div key={idx} className="grid grid-cols-3 gap-2 mb-2">
            <Input
              placeholder="Description"
              value={item.description}
              onChange={(e) => updateItem(idx, "description", e.target.value)}
            />
            <Input
              placeholder="Qty"
              type="number"
              value={item.quantity}
              onChange={(e) => updateItem(idx, "quantity", e.target.value)}
            />
            <Input
              placeholder="Price"
              type="number"
              value={item.price}
              onChange={(e) => updateItem(idx, "price", e.target.value)}
            />
            <Button onClick={() => removeItem(idx)}>Remove</Button>
          </div>
        ))}
        <Button onClick={addItem}>Add Item</Button>
      </div>

      <div>
        <label>Notes</label>
        <textarea
          className="w-full border p-2"
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <Button className="bg-green-600 text-white" onClick={handleExport}>Export to Excel</Button>
    </div>
  );
}




















