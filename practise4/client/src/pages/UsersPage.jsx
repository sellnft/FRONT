import { useEffect, useMemo, useState } from "react";
import { createGood, deleteGood, getGoods, updateGood } from "../api";
import UserModal from "../components/UserModal";
import UsersList from "../components/UsersList";
import "./UsersPage.scss";

function UsersPage({ currentUser, onLogout, onNavigate }) {
  const [goods, setGoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedGood, setSelectedGood] = useState(null);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const isAdmin = currentUser?.role === "admin";
  const canManageGoods = currentUser?.role === "admin" || currentUser?.role === "seller";

  useEffect(() => {
    handleLoadGoods();
  }, []);

  const filteredGoods = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return goods;

    return goods.filter((good) => {
      return [good.name, good.category, good.description, good.id]
        .join(" ")
        .toLowerCase()
        .includes(normalized);
    });
  }, [goods, query]);

  async function handleLoadGoods() {
    setLoading(true);
    setError("");

    try {
      const data = await getGoods();
      setGoods(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setModalMode("create");
    setSelectedGood(null);
    setIsModalOpen(true);
  }

  function openEditModal(good) {
    setModalMode("edit");
    setSelectedGood(good);
    setIsModalOpen(true);
  }

  function closeModal() {
    if (saving) return;
    setIsModalOpen(false);
    setSelectedGood(null);
  }

  async function handleSubmitModal(payload) {
    setSaving(true);
    setError("");

    try {
      if (modalMode === "edit" && selectedGood) {
        await updateGood(selectedGood.id, payload);
      } else {
        await createGood(payload);
      }

      setIsModalOpen(false);
      setSelectedGood(null);
      await handleLoadGoods();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteGood(id) {
    const confirmed = window.confirm("Delete this item?");
    if (!confirmed) return;

    setError("");

    try {
      await deleteGood(id);
      await handleLoadGoods();
    } catch (e) {
      setError(e.message);
    }
  }

  function handleBuyGood(good) {
    if (Number(good.stock) <= 0) {
      setError("This item is out of stock.");
      return;
    }

    window.alert(`Purchase request sent for "${good.name}"`);
  }

  return (
    <main className="usersPage">
      <header className="usersPage__header">
        <div className="usersPage__hero">
          <h1>BMW Parts Store</h1>
          <p>{canManageGoods ? "Goods management panel" : "Customer catalog"}</p>
          <div className="usersPage__session">
            <span className={`roleBadge roleBadge--${currentUser?.role}`}>{currentUser?.role}</span>
            <span>
              {currentUser?.firstName} {currentUser?.lastName}
            </span>
            <span>{currentUser?.email}</span>
          </div>
        </div>

        <div className="toolbar">
          <button className="btn btn--ghost" onClick={handleLoadGoods} disabled={loading}>
            {loading ? "Loading..." : "Reload goods"}
          </button>
          <button className="btn btn--ghost" onClick={onLogout}>
            Logout
          </button>
          {isAdmin && (
            <button className="btn btn--ghost" onClick={() => onNavigate("/admin/users")}>
              Users
            </button>
          )}
          {canManageGoods && (
            <button className="btn" onClick={openCreateModal}>
              Add good
            </button>
          )}
        </div>
      </header>

      <section className="usersPage__filters">
        <input
          type="text"
          placeholder="Search by id, name, category, description"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </section>

      {error && <div className="errorBanner">{error}</div>}

      <UsersList
        goods={filteredGoods}
        canManageGoods={canManageGoods}
        onBuy={handleBuyGood}
        onEdit={openEditModal}
        onDelete={handleDeleteGood}
      />

      {canManageGoods && (
        <UserModal
          isOpen={isModalOpen}
          mode={modalMode}
          initialData={selectedGood}
          onClose={closeModal}
          onSubmit={handleSubmitModal}
          saving={saving}
        />
      )}
    </main>
  );
}

export default UsersPage;
