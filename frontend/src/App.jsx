
import { useEffect, useMemo, useState } from "react";
import { customerApi } from "./services/api";
import CreditManager from "./CreditManager";
import "./App.css";

export default function App() {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadCustomers() {
    setLoading(true);
    setError("");

    try {
      const data = await customerApi.getAll();
      setCustomers(data);
    } catch (err) {
      setError(err.message || "Could not load customers.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return customers;

    return customers.filter((customer) =>
      [customer.name, customer.phone, customer.address].some((value) =>
        (value || "").toLowerCase().includes(term)
      )
    );
  }, [customers, search]);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function resetForm() {
    setForm({ name: "", phone: "", address: "" });
    setEditingId(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError("Please enter the customer's name.");
      return;
    }

    setSaving(true);

    try {
      const customer = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
      };

      if (editingId !== null) {
        await customerApi.update(editingId, customer);
        setSuccess("Customer updated successfully.");
      } else {
        await customerApi.create(customer);
        setSuccess("Customer added successfully.");
      }

      resetForm();
      await loadCustomers();
    } catch (err) {
      setError(err.message || "Unable to save customer.");
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(customer) {
    setForm({
      name: customer.name || "",
      phone: customer.phone || "",
      address: customer.address || "",
    });

    setEditingId(customer.id);
    setError("");
    setSuccess("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(customer) {
    if (!window.confirm(`Delete customer "${customer.name}"?`)) return;

    setError("");
    setSuccess("");

    try {
      await customerApi.remove(customer.id);

      setCustomers((previous) =>
        previous.filter((item) => item.id !== customer.id)
      );

      if (editingId === customer.id) resetForm();

      setSuccess("Customer deleted successfully.");
    } catch (err) {
      setError(err.message || "Unable to delete customer.");
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">₹</div>
          <div>
            <h2>CreditBook</h2>
            <span>MANAGEMENT SYSTEM</span>
          </div>
        </div>

        <p className="nav-heading">WORKSPACE</p>
        <div className="nav-item active">▦ &nbsp; Dashboard</div>
        <div className="nav-item">♙ &nbsp; Customers</div>
        <div className="nav-item">₹ &nbsp; Credit & Payments</div>

        <div className="sidebar-bottom">
          <div className="profile-avatar">CB</div>
          <div>
            <strong>Credit Book</strong>
            <small>Administrator</small>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">WORKSPACE / CUSTOMERS</p>
            <h1>Customer Management</h1>
            <p className="subtitle">
              Manage your customers and their contact details.
            </p>
          </div>

          <div className="today-badge">
            ● &nbsp; Customer directory
          </div>
        </header>

        <section className="stats-grid">
          <div className="stat-card">
            <span className="stat-icon purple">♙</span>
            <p>Total customers</p>
            <h2>{customers.length}</h2>
            <small>Registered customers</small>
          </div>

          <div className="stat-card">
            <span className="stat-icon green">✓</span>
            <p>Database status</p>
            <h2 className="status-text">
              {error && customers.length === 0 ? "Check" : "Ready"}
            </h2>
            <small>Spring Boot connection</small>
          </div>

          <div className="stat-card">
            <span className="stat-icon orange">⌕</span>
            <p>Search results</p>
            <h2>{filteredCustomers.length}</h2>
            <small>Customers matching your search</small>
          </div>
        </section>

        {error && <div className="alert error-alert">{error}</div>}
        {success && <div className="alert success-alert">{success}</div>}

        <section className="content-grid">
          <div className="panel form-panel">
            <div className="panel-heading">
              <div>
                <span className="section-label">CUSTOMER DETAILS</span>
                <h2>
                  {editingId !== null ? "Edit customer" : "Add customer"}
                </h2>
              </div>
              <span className="heading-icon">＋</span>
            </div>

            <form onSubmit={handleSubmit}>
              <label htmlFor="name">Full name *</label>
              <input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter customer name"
                maxLength={100}
                required
              />

              <label htmlFor="phone">Phone number</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
                maxLength={20}
              />

              <label htmlFor="address">Address</label>
              <textarea
                id="address"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Enter customer address"
                maxLength={255}
                rows={3}
              />

              <button
                className="primary-button"
                type="submit"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingId !== null
                    ? "Save changes"
                    : "+ Add customer"}
              </button>

              {editingId !== null && (
                <button
                  className="secondary-button"
                  type="button"
                  onClick={resetForm}
                >
                  Cancel editing
                </button>
              )}
            </form>

            <p className="form-note">* Required field</p>
          </div>

          <div className="panel customers-panel">
            <div className="panel-heading list-heading">
              <div>
                <span className="section-label">YOUR DIRECTORY</span>
                <h2>All customers</h2>
              </div>
              <span className="count-badge">
                {customers.length} total
              </span>
            </div>

            <div className="search-box">
              <span>⌕</span>
              <input
                aria-label="Search customers"
                placeholder="Search by name, phone or address..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            {loading ? (
              <div className="empty-state">
                <p>Loading customers...</p>
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">♙</div>
                <h3>
                  {search ? "No matching customers" : "No customers yet"}
                </h3>
                <p>
                  {search
                    ? "Try a different search term."
                    : "Add your first customer using the form."}
                </p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Phone</th>
                      <th>Address</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredCustomers.map((customer) => (
                      <tr key={customer.id}>
                        <td>
                          <div className="customer-cell">
                            <span className="customer-avatar">
                              {(customer.name || "?")
                                .charAt(0)
                                .toUpperCase()}
                            </span>
                            <div>
                              <strong>{customer.name}</strong>
                              <small>ID #{customer.id}</small>
                            </div>
                          </div>
                        </td>

                        <td>{customer.phone || "—"}</td>
                        <td className="address-cell">
                          {customer.address || "—"}
                        </td>

                        <td>
                          <div className="action-buttons">
                            <button
                              className="edit-button"
                              onClick={() => handleEdit(customer)}
                              type="button"
                            >
                              Edit
                            </button>

                            <button
                              className="delete-button"
                              onClick={() => handleDelete(customer)}
                              type="button"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="panel-footer">
              Showing {filteredCustomers.length} of {customers.length} customers

              <button
                className="refresh-button"
                type="button"
                onClick={loadCustomers}
                disabled={loading}
              >
                ↻ Refresh
              </button>
            </div>
          </div>
        </section>

        {/* Credit and payment management belongs in the main content area */}
        <CreditManager />

        <footer className="page-footer">
          CreditBook · Customer management · Spring Boot + React + MySQL
        </footer>
      </main>
    </div>
  );
}
