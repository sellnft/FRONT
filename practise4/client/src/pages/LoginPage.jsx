import { useState } from "react";
import { getCurrentUser, loginUser } from "../api";
import "./AuthPage.scss";

function LoginPage({ onSuccess, onNavigate }) {
  const [form, setForm] = useState({
    email: "",
    password: "",
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
      const data = await loginUser({
        email: form.email.trim(),
        password: form.password,
      });

      if (data?.accessToken) {
        const user = await getCurrentUser();
        onSuccess(user);
      }
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
        <h1>Login</h1>
        <p className="authLead">Use your account to access goods management.</p>

        <form className="authPageForm" onSubmit={handleSubmit}>
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
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

          <div className="authPageActions">
            <button className="btn" type="submit" disabled={loading}>
              {loading ? "Loading..." : "Login"}
            </button>
          </div>
        </form>

        {message && <div className="authPageMessage">{message}</div>}

        <p className="authPageSwitch">
          No account yet?{" "}
          <button className="authLink" type="button" onClick={() => onNavigate("/register")}>
            Create one
          </button>
        </p>
      </section>
    </main>
  );
}

export default LoginPage;
