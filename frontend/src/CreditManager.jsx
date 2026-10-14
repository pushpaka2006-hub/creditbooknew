
import { useEffect, useState } from "react";
import "./CreditManager.css";
const API_URL = `${import.meta.env.VITE_API_URL}/api/customers`;

const money = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));

async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(
      body.message || body.error || `Request failed (${response.status})`
    );
  }

  return response.status === 204 ? null : response.json();
}

export default function CreditManager() {
  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState("");
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState([]);
  const [type, setType] = useState("CREDIT");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    apiRequest(API)
      .then((data) => {
        if (!active) return;
        setCustomers(data);
        if (data.length > 0) {
          setCustomerId(String(data[0].id));
        }
      })
      .catch((err) => {
        if (active) setError(`Could not load customers: ${err.message}`);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadData() {
      if (!customerId) {
        setBalance(0);
        setHistory([]);
        return;
      }

      setError("");

      try {
        const [balanceData, historyData] = await Promise.all([
          apiRequest(`${API}/${customerId}/balance`),
          apiRequest(`${API}/${customerId}/transactions`),
        ]);

        if (active) {
          setBalance(balanceData.balance);
          setHistory(historyData);
        }
      } catch (err) {
        if (active) setError(err.message);
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, [customerId]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!customerId) {
      setError("Please add and select a customer first.");
      return;
    }

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }

    setLoading(true);

    try {
      await apiRequest(`${API}/${customerId}/transactions`, {
        method: "POST",
        body: JSON.stringify({
          type,
          amount: numericAmount,
          note: note.trim(),
        }),
      });

      const [balanceData, historyData] = await Promise.all([
        apiRequest(`${API}/${customerId}/balance`),
        apiRequest(`${API}/${customerId}/transactions`),
      ]);

      setBalance(balanceData.balance);
      setHistory(historyData);
      setAmount("");
      setNote("");
      setMessage(
        type === "CREDIT"
          ? "Credit entry saved successfully."
          : "Payment recorded successfully."
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const selectedCustomer = customers.find(
    (customer) => String(customer.id) === customerId
  );

  return (
    <section className="credit-page">
      <header className="credit-heading">
        <div>
          <h2>Credit & Payments</h2>
          <p>Manage customer credit balances and payment history.</p>
        </div>
      </header>

      {error && (
        <div className="credit-alert error" role="alert">
          {error}
        </div>
      )}

      {message && (
        <div className="credit-alert success" role="status">
          {message}
        </div>
      )}

      <section className="credit-card">
        <label htmlFor="credit-customer">Select customer</label>
        <select
          id="credit-customer"
          value={customerId}
          onChange={(event) => {
            setCustomerId(event.target.value);
            setMessage("");
            setError("");
          }}
        >
          <option value="">Choose a customer</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.name} — #{customer.id}
            </option>
          ))}
        </select>

        {customers.length === 0 && (
          <p className="empty-history">
            No customers found. Add a customer in your existing dashboard first.
          </p>
        )}

        {selectedCustomer && (
          <div className="selected-customer">
            <strong>{selectedCustomer.name}</strong>
            <span>{selectedCustomer.phone || "No phone number"}</span>
          </div>
        )}
      </section>

      <section className="balance-card">
        <span>Outstanding balance</span>
        <h1>{money(balance)}</h1>
        <p>
          {balance > 0
            ? "Amount owed by this customer"
            : balance === 0
              ? "No outstanding balance"
              : "The balance is in favour of the customer"}
        </p>
      </section>

      <section className="credit-card">
        <h3>Record a transaction</h3>

        <form onSubmit={handleSubmit} className="credit-form">
          <label htmlFor="transaction-type">Transaction type</label>
          <select
            id="transaction-type"
            value={type}
            onChange={(event) => setType(event.target.value)}
          >
            <option value="CREDIT">Credit given (increases balance)</option>
            <option value="PAYMENT">Payment received (reduces balance)</option>
          </select>

          <label htmlFor="transaction-amount">Amount (₹)</label>
          <input
            id="transaction-amount"
            type="number"
            min="0.01"
            step="0.01"
            max="9999999999999.99"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="Enter amount in rupees"
            required
          />

          <label htmlFor="transaction-note">Description / note</label>
          <input
            id="transaction-note"
            type="text"
            maxLength="500"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="e.g. Grocery purchase or cash payment"
          />

          <button type="submit" disabled={loading || !customerId}>
            {loading
              ? "Saving..."
              : type === "CREDIT"
                ? "Add credit"
                : "Record payment"}
          </button>
        </form>
      </section>

      <section className="credit-card">
        <h3>Transaction history</h3>

        {history.length === 0 ? (
          <p className="empty-history">
            No transactions for this customer yet.
          </p>
        ) : (
          <div className="history-table-wrap">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Amount</th>
                </tr>
              </thead>

              <tbody>
                {history.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>
                      {transaction.createdAt
                        ? new Date(transaction.createdAt).toLocaleString(
                            "en-IN"
                          )
                        : "—"}
                    </td>

                    <td>
                      <span
                        className={
                          transaction.type === "CREDIT"
                            ? "type-badge credit-type"
                            : "type-badge payment-type"
                        }
                      >
                        {transaction.type === "CREDIT"
                          ? "Credit given"
                          : "Payment received"}
                      </span>
                    </td>

                    <td>{transaction.note || "—"}</td>

                    <td
                      className={
                        transaction.type === "CREDIT"
                          ? "amount-credit"
                          : "amount-payment"
                      }
                    >
                      {transaction.type === "CREDIT" ? "+" : "−"}
                      {money(transaction.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
}
