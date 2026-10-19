
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  RefreshCw,
  Search,
  Utensils,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
} from "lucide-react";

const API_URL = "/api/admin/orders/";
const MEDIA_URL = "http://127.0.0.1:8000";
const TOKEN_KEY = "admin-token";

const ORDER_STATUSES = [
  "Pending",
  "Confirmed",
  "Preparing",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

function getAuthHeaders() {
  const token = localStorage.getItem(TOKEN_KEY);

  return {
    Accept: "application/json",
    ...(token ? { Authorization: `Token ${token}` } : {}),
  };
}

function getOrderList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.orders)) return data.orders;
  return [];
}

function getOrderItems(order) {
  if (Array.isArray(order?.items)) return order.items;
  if (Array.isArray(order?.order_items)) return order.order_items;
  return [];
}

function getImageUrl(image) {
  if (!image || typeof image !== "string") return "";

  if (/^(https?:\/\/|blob:|data:)/i.test(image)) {
    return image;
  }

  return `${MEDIA_URL}${image.startsWith("/") ? "" : "/"}${image}`;
}

function getItemName(item) {
  return (
    item?.tiff_name ||
    item?.tiff?.name ||
    item?.tiff?.title ||
    item?.name ||
    item?.tiff?.slug ||
    "Tiffin"
  );
}

function getItemImage(item) {
  return (
    item?.image ||
    item?.tiff_image ||
    item?.tiff?.image ||
    item?.image_url ||
    item?.tiff?.image_url ||
    ""
  );
}

function getItemQuantity(item) {
  return item?.quantity ?? item?.qty ?? 1;
}

function formatPrice(value) {
  return Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function getErrorMessage(err, fallback) {
  const status = err.response?.status;
  const data = err.response?.data;

  if (status === 401) {
    return "Login token invalid किंवा missing आहे. कृपया Admin म्हणून पुन्हा login करा.";
  }

  if (status === 403) {
    return (
      data?.detail ||
      "Admin permission नाकारली गेली. Admin account आणि token तपासा."
    );
  }

  if (status === 404) {
    return "Orders API URL सापडला नाही.";
  }

  if (data?.detail) return data.detail;

  if (data && typeof data === "object") {
    return Object.values(data).flat().join(" ");
  }

  return err.message || fallback;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem(TOKEN_KEY);

      if (!token) {
        setOrders([]);
        setError("Admin token सापडला नाही. कृपया Admin Login करा.");
        return;
      }

      const response = await axios.get(API_URL, {
        headers: getAuthHeaders(),
      });

      setOrders(getOrderList(response.data));
    } catch (err) {
      console.error(
        "Load orders error:",
        err.response?.status,
        err.response?.data || err.message
      );

      setError(getErrorMessage(err, "Unable to load orders."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  async function updateStatus(orderId, newStatus) {
    setUpdatingId(orderId);
    setError("");

    try {
      const token = localStorage.getItem(TOKEN_KEY);

      if (!token) {
        setError("Admin token सापडला नाही. पुन्हा login करा.");
        return;
      }

      await axios.patch(
        `${API_URL}${orderId}/`,
        { status: newStatus },
        {
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json",
          },
        }
      );

      setOrders((previous) =>
        previous.map((order) =>
          order.id === orderId
            ? { ...order, status: newStatus }
            : order
        )
      );
    } catch (err) {
      console.error(
        "Update order status error:",
        err.response?.status,
        err.response?.data || err.message
      );

      setError(
        getErrorMessage(err, "Unable to update order status.")
      );
    } finally {
      setUpdatingId(null);
    }
  }

  const filteredOrders = orders.filter((order) => {
    const searchText = search.trim().toLowerCase();
    const orderItems = getOrderItems(order);

    const itemNames = orderItems
      .map(getItemName)
      .join(" ")
      .toLowerCase();

    const matchesSearch =
      String(order.id ?? "").includes(searchText) ||
      String(order.customer_name ?? "")
        .toLowerCase()
        .includes(searchText) ||
      String(order.phone ?? "").includes(searchText) ||
      itemNames.includes(searchText);

    const matchesStatus =
      statusFilter === "All" ||
      String(order.status ?? "").toLowerCase() ===
        statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 p-5">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">
            Orders Management
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            View and manage customer orders.
          </p>
        </div>

        <button  type="button" onClick={loadOrders} disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw
            size={17}
            className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {error && (
        <div role="alert"
          className="m-5 flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700"  >
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-col gap-3 p-5 sm:flex-row">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-gray-200 px-3">
          <Search size={18} className="text-gray-400" />
          <input  type="search"  value={search} onChange={(event) => setSearch(event.target.value)}
            placeholder="Search order ID, customer, phone or tiffin" className="w-full py-3 text-sm outline-none"  />
        </div>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500"
        >
          <option value="All">All Statuses</option>
          {ORDER_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px] text-left">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-5 py-4">Order ID</th>
              <th className="px-5 py-4">Customer</th>
              <th className="px-5 py-4">Phone</th>
              <th className="px-5 py-4">Order Items</th>
              <th className="px-5 py-4">Total</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Created</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-5 py-10">
                  <div className="flex items-center justify-center gap-2 text-gray-500">
                    <Loader2 size={20} className="animate-spin" />
                    Loading orders...
                  </div>
                </td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-5 py-10 text-center text-gray-500"
                >
                  No orders found.
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => {
                const orderItems = getOrderItems(order);

                return (
                  <tr
                    key={order.id}
                    className="transition hover:bg-orange-50/40"
                  >
                    <td className="px-5 py-4 font-bold text-orange-600">
                      #{order.id}
                    </td>

                    <td className="px-5 py-4 text-sm font-semibold text-gray-800">
                      {order.customer_name || "Customer"}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {order.phone || "-"}
                    </td>

                    <td className="px-5 py-4">
                      {orderItems.length > 0 ? (
                        <div className="flex min-w-[220px] flex-col gap-3">
                          {orderItems.map((item, index) => {
                            const itemImage = getImageUrl(
                              getItemImage(item)
                            );

                            return (
                              <div key={item.id ?? `${order.id}-${index}`}
                                className="flex items-center gap-3">

                                {itemImage ? (
                                  <img   src={itemImage} alt={getItemName(item)}
                                    className="h-14 w-14 shrink-0 rounded-lg border border-gray-200 bg-gray-50 object-cover"
                                    onError={(event) => {  event.currentTarget.style.display = "none";
                                    }}
                                  />
                                ) : (
                                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-400">
                                    <ImageIcon size={24} />
                                  </div>
                                )}

                                <div className="min-w-0">
                                  <p className="max-w-[200px] truncate text-sm font-semibold text-gray-800">
                                    {getItemName(item)}
                                  </p>
                                  <p className="mt-1 text-xs text-gray-500">
                                    Qty: {getItemQuantity(item)}
                                  </p>

                                  {item.price != null && (
                                    <p className="mt-1 text-xs font-medium text-gray-600">
                                      ₹{formatPrice(item.price)}
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Utensils size={18} />
                          Order items not available
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-4 text-sm font-bold text-gray-900">
                      ₹
                      {formatPrice(
                        order.total_amount ??
                          order.total ??
                          order.grand_total ??
                          order.amount
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <select
                        value={order.status || "Pending"}
                        disabled={updatingId === order.id}
                        onChange={(event) =>
                          updateStatus(order.id, event.target.value)
                        }
                        className="rounded-lg border border-gray-200 bg-white px-2 py-2 text-xs font-semibold outline-none focus:border-orange-500 disabled:opacity-50"
                      >
                        {ORDER_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>

                      {updatingId === order.id && (
                        <p className="mt-1 text-xs text-gray-400">
                          Updating...
                        </p>
                      )}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-xs text-gray-500">
                      {order.created_at
                        ? new Date(order.created_at).toLocaleString("en-IN")
                        : "-"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="border-t border-gray-200 px-5 py-4 text-sm text-gray-500">
        Showing {filteredOrders.length} of {orders.length} orders
      </div>
    </section>
  );
}
