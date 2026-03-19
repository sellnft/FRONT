import { useEffect, useState } from "react";
import { getUsers, updateUserBlockStatus, updateUserRole } from "../api";
import "./AdminUsersPage.scss";

function AdminUsersPage({ currentUser, onCurrentUserChange, onLogout, onNavigate }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeUserId, setActiveUserId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    handleLoadUsers();
  }, []);

  async function handleLoadUsers() {
    setLoading(true);
    setError("");

    try {
      const data = await getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRoleChange(user, role) {
    setActiveUserId(user.id);
    setError("");

    try {
      const updatedUser = await updateUserRole(user.id, role);
      setUsers((prev) => prev.map((item) => (item.id === user.id ? updatedUser : item)));

      if (updatedUser.id === currentUser.id) {
        onCurrentUserChange(updatedUser);
        if (updatedUser.role !== "admin") {
          onNavigate("/");
        }
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setActiveUserId("");
    }
  }

  async function handleToggleBlock(user) {
    setActiveUserId(user.id);
    setError("");

    try {
      const updatedUser = await updateUserBlockStatus(user.id, !user.isBlocked);
      setUsers((prev) => prev.map((item) => (item.id === user.id ? updatedUser : item)));

      if (updatedUser.id === currentUser.id) {
        onCurrentUserChange(updatedUser);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setActiveUserId("");
    }
  }

  return (
    <main className="adminUsersPage">
      <header className="adminUsersPage__header">
        <div>
          <h1>Users Management</h1>
          <p>Admin-only table for roles and mock block controls.</p>
        </div>

        <div className="toolbar">
          <button className="btn btn--ghost" onClick={() => onNavigate("/")}>
            Back to goods
          </button>
          <button className="btn btn--ghost" onClick={handleLoadUsers} disabled={loading}>
            {loading ? "Loading..." : "Reload users"}
          </button>
          <button className="btn btn--ghost" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      {error && <div className="errorBanner">{error}</div>}

      <section className="usersTableCard">
        <table className="usersTable">
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Full name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const isBusy = activeUserId === user.id;

              return (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>
                    {user.firstName} {user.lastName}
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`tableBadge tableBadge--${user.role}`}>{user.role}</span>
                  </td>
                  <td>
                    <span className={`tableBadge ${user.isBlocked ? "tableBadge--blocked" : "tableBadge--active"}`}>
                      {user.isBlocked ? "Blocked" : "Active"}
                    </span>
                  </td>
                  <td>
                    <div className="tableActions">
                      <button
                        className="btn btn--ghost"
                        onClick={() => handleRoleChange(user, "user")}
                        disabled={isBusy || user.role === "user"}
                      >
                        Make user
                      </button>
                      <button
                        className="btn btn--ghost"
                        onClick={() => handleRoleChange(user, "seller")}
                        disabled={isBusy || user.role === "seller"}
                      >
                        Make seller
                      </button>
                      <button
                        className="btn btn--ghost"
                        onClick={() => handleRoleChange(user, "admin")}
                        disabled={isBusy || user.role === "admin"}
                      >
                        Make admin
                      </button>
                      <button
                        className={`btn ${user.isBlocked ? "btn--buy" : "btn--danger"}`}
                        onClick={() => handleToggleBlock(user)}
                        disabled={isBusy}
                      >
                        {user.isBlocked ? "Unblock" : "Block"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {!users.length && !loading && <p className="emptyState">No users found yet.</p>}
      </section>
    </main>
  );
}

export default AdminUsersPage;
