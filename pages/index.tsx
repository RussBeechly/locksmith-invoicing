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

  const t









