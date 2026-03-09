import { useMemo, useState } from "react";
import {
  createGood,
  deleteGood,
  getGoods,
  loginUser,
  registerUser,
  updateGood,
} from "../api";
import UserModal from "../components/UserModal";
import UsersList from "../components/UsersList";
import "./UsersPage.scss";

function UsersPage() {
  const [goods, setGoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedGood, setSelectedGood] = useState(null);
  const [saving, setSaving] = useState(false);

  const [query, setQuery] = useState("");

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState("");

  const [registerForm, setRegisterForm] = useState({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    password: "",
  });

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

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
    if (!isAuthorized) {
      setAuthMessage("Please login first");
      return;
    }

    setModalMode("create");
    setSelectedGood(null);
    setIsModalOpen(true);
  }

  function openEditModal(good) {
    if (!isAuthorized) {
      setAuthMessage("Please login first");
      return;
    }

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
    if (!isAuthorized) {
      setAuthMessage("Please login first");
      return;
    }

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

  function onRegisterChange(event) {
    const { name, value } = event.target;
    setRegisterForm((prev) => ({ ...prev, [name]: value }));
  }

  function onLoginChange(event) {
    const { name, value } = event.target;
    setLoginForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleRegister(event) {
    event.preventDefault();
    setAuthMessage("");
    setAuthLoading(true);

    try {
      await registerUser({
        username: registerForm.username.trim(),
        email: registerForm.email.trim(),
        firstName: registerForm.firstName.trim(),
        lastName: registerForm.lastName.trim(),
        password: registerForm.password,
      });

      setAuthMessage("Registration successful");
      setRegisterForm({
        username: "",
        email: "",
        firstName: "",
        lastName: "",
        password: "",
      });
    } catch (e) {
      setAuthMessage(e.message);
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleLogin(event) {
    event.preventDefault();
    setAuthMessage("");
    setAuthLoading(true);

    try {
      const data = await loginUser({
        email: loginForm.email.trim(),
        password: loginForm.password,
      });

      if (data?.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
        setIsAuthorized(true);
        setAuthMessage("Login successful");
        await handleLoadGoods();
      }
    } catch (e) {
      setAuthMessage(e.message);
    } finally {
      setAuthLoading(false);
    }
  }

  return (
    <main className="usersPage">
      <header className="usersPage__header">
        <div>
          <h1>BMW Parts Store</h1>
          <p>Goods + Auth panel</p>
        </div>

        <div className="toolbar">
          <button className="btn btn--ghost" onClick={handleLoadGoods} disabled={loading}>
            {loading ? "Loading..." : "Load goods"}
          </button>
          <button className="btn" onClick={openCreateModal} disabled={!isAuthorized}>
            Add good
          </button>
        </div>
      </header>

      <section className="authSection">
        <article className="authCard">
          <h2>Register</h2>
          <form className="authForm" onSubmit={handleRegister}>
            <input
              name="username"
              placeholder="Username"
              value={registerForm.username}
              onChange={onRegisterChange}
              required
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={registerForm.email}
              onChange={onRegisterChange}
              required
            />
            <input
              name="firstName"
              placeholder="First name"
              value={registerForm.firstName}
              onChange={onRegisterChange}
              required
            />
            <input
              name="lastName"
              placeholder="Last name"
              value={registerForm.lastName}
              onChange={onRegisterChange}
              required
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={registerForm.password}
              onChange={onRegisterChange}
              required
            />
            <button className="btn" type="submit" disabled={authLoading}>
              {authLoading ? "..." : "Register"}
            </button>
          </form>
        </article>

        <article className="authCard">
          <h2>Login</h2>
          <form className="authForm" onSubmit={handleLogin}>
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={loginForm.email}
              onChange={onLoginChange}
              required
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={loginForm.password}
              onChange={onLoginChange}
              required
            />
            <button className="btn" type="submit" disabled={authLoading}>
              {authLoading ? "..." : "Login"}
            </button>
          </form>
          <p className={isAuthorized ? "authStatus authStatus--ok" : "authStatus"}>
            {isAuthorized ? "Status: authorized" : "Status: not authorized"}
          </p>
        </article>
      </section>

      {authMessage && <div className="authMessage">{authMessage}</div>}

      <section className="usersPage__filters">
        <input
          type="text"
          placeholder="Search by id, name, category, description"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </section>

      {error && <div className="errorBanner">{error}</div>}

      <UsersList goods={filteredGoods} onEdit={openEditModal} onDelete={handleDeleteGood} />

      <UserModal
        isOpen={isModalOpen}
        mode={modalMode}
        initialData={selectedGood}
        onClose={closeModal}
        onSubmit={handleSubmitModal}
        saving={saving}
      />
    </main>
  );
}

export default UsersPage;
