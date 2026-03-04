import { useEffect, useState } from "react";

const initialForm = {
  name: "",
  category: "",
  description: "",
  price: "",
  stock: "",
};

function UserModal({ isOpen, mode, initialData, onClose, onSubmit, saving }) {
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        category: initialData.category || "",
        description: initialData.description || "",
        price: String(initialData.price ?? ""),
        stock: String(initialData.stock ?? ""),
      });
    } else {
      setForm(initialForm);
    }
  }, [initialData, isOpen]);

  if (!isOpen) {
    return null;
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit({
      name: form.name.trim(),
      category: form.category.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      stock: Number(form.stock),
    });
  }

  return (
    <div className="modalBackdrop" onClick={onClose}>
      <div className="modalCard" onClick={(e) => e.stopPropagation()}>
        <h2>{mode === "edit" ? "Edit good" : "Create good"}</h2>

        <form className="modalForm" onSubmit={handleSubmit}>
          <label>
            Название
            <input name="name" value={form.name} onChange={handleChange} required />
          </label>

          <label>
            Категория
            <input
              name="category"
              value={form.category}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Описание
            <textarea
              rows="3"
              name="description"
              value={form.description}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Цена
            <input
              type="number"
              min="0"
              step="1"
              name="price"
              value={form.price}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Количество
            <input
              type="number"
              min="0"
              step="1"
              name="stock"
              value={form.stock}
              onChange={handleChange}
              required
            />
          </label>

          <div className="modalActions">
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              Отмена
            </button>
            <button type="submit" className="btn" disabled={saving}>
              {saving ? "Сохранение..." : mode === "edit" ? "Сохранить" : "Создать"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserModal;
