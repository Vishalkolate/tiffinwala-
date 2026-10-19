
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { RefreshCw, Search, Users } from "lucide-react";

const API_URL = "/api/admin/customers/";

function getAuthHeaders() {
  const token = localStorage.getItem("admin-token");

  return {
    Accept: "application/json",
    ...(token ? { Authorization: `Token ${token}` } : {}),
  };
}

function getCustomerList(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  if (Array.isArray(data?.customers)) {
    return data.customers;
  }

  return [];
}

function getCustomerName(customer) {
  const fullName = String(customer?.full_name || "").trim();

  if (fullName) {
    return fullName;
  }

  const firstName = String(customer?.first_name || "").trim();
  const lastName = String(customer?.last_name || "").trim();
  const combinedName = `${firstName} ${lastName}`.trim();

  return combinedName || customer?.username || "Customer";
}

function getErrorMessage(error) {
  const status = error.response?.status;
  const data = error.response?.data;

  if (!localStorage.getItem("admin-token")) {
    return "Admin token not found. Please login again.";
  }

  if (status === 401) {
    return "Your session is invalid or expired. Please login again.";
  }

  if (status === 403) {
    return (
      data?.detail ||
      "Admin access denied. Check that you are logged in with an admin account."
    );
  }

  if (status === 404) {
    return "Customers API not found. Check your Django URL configuration.";
  }

  if (status >= 500) {
    return "Django server error. Check the backend terminal.";
  }

  if (!error.response) {
    return "Cannot connect to the backend. Make sure Django is running.";
  }

  return (
    data?.detail ||
    data?.message ||
    "Unable to load customers. Please try again."
  );
}

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.get(API_URL, {
        headers: getAuthHeaders(),
      });

      setCustomers(getCustomerList(response.data));
    } catch (err) {
      console.error(
        "Admin customers API error:",
        err.response?.data || err.message
      );

      setCustomers([]);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const query = search.trim().toLowerCase();

  const filteredCustomers = customers.filter((customer) => {
    const fullName = getCustomerName(customer);

    return (
      String(fullName).toLowerCase().includes(query) ||
      String(customer.email || "").toLowerCase().includes(query) ||
      String(customer.phone || customer.mobile || "").includes(query) ||
      String(customer.id ?? "").includes(query)
    );
  });

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 p-5">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">
            Customers Management
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            View and search registered customers.
          </p>
        </div>

        <button type="button" onClick={loadCustomers} disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw  size={17} className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="mx-5 mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <p className="font-semibold">{error}</p>

          <button type="button" onClick={loadCustomers}  className="mt-2 font-bold underline" >
            Try again </button>
        </div>
      )}

      {/* Search and count */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-5">
        <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-xl border border-gray-200 px-3 focus-within:border-orange-400">
          <Search size={18} className="shrink-0 text-gray-400" />

          <input  type="search"  value={search}
            onChange={(event) => setSearch(event.target.value)}  placeholder="Search name, email, phone or ID"  aria-label="Search customers"  className="w-full bg-transparent py-3 text-sm outline-none" />
        </div>

        <span className="rounded-lg bg-orange-50 px-3 py-2 text-sm font-bold text-orange-700">
          {filteredCustomers.length} customers
        </span>
      </div>

      {/* Customers table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-left">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-5 py-4">Customer</th>
              <th className="px-5 py-4">Email</th>
              <th className="px-5 py-4">Phone</th>
              <th className="px-5 py-4">Registered</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={4}
                  className="px-5 py-12 text-center text-sm text-gray-500"
                >
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw size={17} className="animate-spin" />
                    Loading customers...
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td  colSpan={4}
                  className="px-5 py-10 text-center text-sm text-gray-500" >
                  Customer data could not be loaded.
                </td>
              </tr>
            ) : filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan={4}
                  className="px-5 py-12 text-center text-sm text-gray-500" >
                  {search
                    ? "No customers match your search."
                    : "No registered customers found."}
                </td>
              </tr>
            ) : (
              filteredCustomers.map((customer, index) => {
                const fullName = getCustomerName(customer);

                const registeredDate =
                  customer.date_joined || customer.created_at;

                const formattedDate = registeredDate
                  ? new Date(registeredDate).toLocaleDateString("en-IN")
                  : "-";

                return (
                  <tr key={customer.id ?? customer.email ?? index}
                    className="transition hover:bg-orange-50/40" >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-700">
                          <Users size={19} />
                        </div>

                        <div>
                          <p className="text-sm font-bold text-gray-800">
                            {fullName}
                          </p>

                          <p className="text-xs text-gray-500">
                            Customer #{customer.id ?? "-"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {customer.email || "-"}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {customer.phone || customer.mobile || "-"}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-500">
                      {formattedDate}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 px-5 py-4 text-sm text-gray-500">
        Showing {filteredCustomers.length} of {customers.length} customers
      </div>
    </section>
  );
}
