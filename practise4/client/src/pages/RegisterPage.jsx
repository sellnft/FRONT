import { useState } from "react";
import { registerUser } from "../api";
import "./AuthPage.scss";

function RegisterPage({ onSuccess, onNavigate }) {
  const [form, setForm] = useState({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    role: "user",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await registerUser({
        username: form.username.trim(),
        email: form.email.trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        password: form.password,
        role: form.role,
      });

      onSuccess();
    } catch (e) {
      setMessage(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="authPage">
      <section className="authShell">
        <p className="authEyebrow">BMW Parts Store</p>
        <h1>Create account</h1>
        <p className="authLead">Register first, then sign in to manage goods.</p>

        <form className="authPageForm" onSubmit={handleSubmit}>
          <input
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            required
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            name="firstName"
            placeholder="First name"
            value={form.firstName}
            onChange={handleChange}
            required
          />
          <input
            name="lastName"
            placeholder="Last name"
            value={form.lastName}
            onChange={handleChange}
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <select name="role" value={form.role} onChange={handleChange}>
            <option value="user">User</option>
            <option value="seller">Seller</option>
            <option value="admin">Admin</option>
          </select>

          <div className="authPageActions">
            <button className="btn" type="submit" disabled={loading}>
              {loading ? "Loading..." : "Register"}
            </button>
          </div>
        </form>

        {message && <div className="authPageMessage">{message}</div>}

        <p className="authPageSwitch">
          Already have an account?{" "}
          <button className="authLink" type="button" onClick={() => onNavigate("/login")}>
            Login
          </button>
        </p>
      </section>
    </main>
  );
}

export default RegisterPage;
