const API_URL = `${import.meta.env.VITE_API_URL || "http://localhost:8080"}/api/customers`;

async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `Request failed: ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const customerApi = {
  getAll: () => request(API_URL),

  getById: (id) => request(`${API_URL}/${id}`),

  create: (customer) =>
    request(API_URL, {
      method: "POST",
      body: JSON.stringify(customer),
    }),

  update: (id, customer) =>
    request(`${API_URL}/${id}`, {
      method: "PUT",
      body: JSON.stringify(customer),
    }),

  remove: (id) =>
    request(`${API_URL}/${id}`, {
      method: "DELETE",
    }),
};
