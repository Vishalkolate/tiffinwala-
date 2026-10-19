
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {  Package,  CalendarDays,  MapPin,  CreditCard,  Clock,  ShoppingBag,  RefreshCw,  ArrowLeft,  Utensils,  CheckCircle2,  XCircle,  Truck,} from "lucide-react";
import axios from "axios";

const API = "/api";

// Format date
const formatDate = (date) => {
  if (!date) return "Date unavailable";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return String(date);
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

// Format status
const formatStatus = (status) => {
  if (!status) return "Pending";

  return String(status)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

// Status colors
const getStatusClass = (status) => {
  const value = String(status || "pending")
    .trim()
    .toLowerCase();

  if (
    value.includes("deliver") ||
    value.includes("complete") ||
    value.includes("success")
  ) {
    return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
  }

  if (
    value.includes("cancel") ||
    value.includes("fail") ||
    value.includes("reject")
  ) {
    return "bg-red-50 text-red-700 ring-1 ring-red-200";
  }

  if (
    value.includes("pending") ||
    value.includes("process") ||
    value.includes("confirm") ||
    value.includes("prepar")
  ) {
    return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
  }

  return "bg-gray-100 text-gray-700 ring-1 ring-gray-200";
};

// Order items
const getOrderItems = (order) => {
  const items =
    order?.items ||
    order?.order_items ||
    order?.tiffins ||
    [];

  return Array.isArray(items) ? items : [];
};

// Order total
const getOrderTotal = (order) => {
  const total =
    order?.total_amount ??
    order?.total ??
    order?.grand_total ??
    order?.amount;

  if (total === undefined || total === null || total === "") {
    return null;
  }

  const numericTotal = Number(total);

  return Number.isNaN(numericTotal)
    ? String(total)
    : `₹${numericTotal.toFixed(2)}`;
};

// Item name
const getItemName = (item) =>
  item?.item_name ||
  item?.tiffin_name ||
  item?.product_name ||
  item?.name ||
  item?.tiffin?.name ||
  "Tiffin Item";

// Item image
const getItemImage = (item) => {
  const image =
    item?.image ||
    item?.image_url ||
    item?.tiffin_image ||
    item?.product_image ||
    item?.tiffin?.image ||
    item?.tiffin?.image_url ||
    "";

  if (typeof image !== "string" || !image.trim()) {
    return "";
  }

  if (/^https?:\/\//i.test(image)) {
    return image;
  }

  if (image.startsWith("//")) {
    return `${window.location.protocol}${image}`;
  }

  if (image.startsWith("/")) {
    return image;
  }

  return `/${image}`;
};

// Item price
const getItemSubtotal = (item) => {
  const quantity = Number(item?.quantity ?? item?.qty ?? 1);
  const subtotal = item?.subtotal;

  if (subtotal !== undefined && subtotal !== null) {
    const amount = Number(subtotal);

    return Number.isNaN(amount)
      ? String(subtotal)
      : `₹${amount.toFixed(2)}`;
  }

  const price =
    item?.unit_price ??
    item?.price ??
    item?.tiffin?.price;

  if (price === undefined || price === null || price === "") {
    return "Price unavailable";
  }

  const amount = Number(price) * quantity;

  return Number.isNaN(amount)
    ? "Price unavailable"
    : `₹${amount.toFixed(2)}`;
};

// Payment status
const getPaymentStatus = (order) => {
  if (order?.payment_status) {
    return order.payment_status;
  }

  if (order?.payment?.status) {
    return order.payment.status;
  }

  if (order?.is_paid === true) {
    return "Paid";
  }

  if (order?.is_paid === false) {
    return "Unpaid";
  }

  return "Not available";
};

// Delivery address
const getAddress = (order) =>
  order?.delivery_address ||
  order?.shipping_address ||
  order?.address ||
  "Address not provided";

// Normalize order status
const normalizeStatus = (order) =>
  String(order?.status || order?.order_status || "pending")
    .trim()
    .toLowerCase()
    .replaceAll("_", " ");

// Allowed cancellation statuses
const canCancelOrder = (order) => {
  const status = normalizeStatus(order);

  return ["pending", "confirmed"].includes(status);
};

function MyOrder() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordersMessage, setOrdersMessage] = useState("");
  const [cancelLoading, setCancelLoading] = useState(null);
  const [cancelMessage, setCancelMessage] = useState("");
  const [cancelMessageType, setCancelMessageType] = useState("");

  const token = localStorage.getItem("tiffin-token");

  // Fetch logged-in user's orders using Axios
  const axiosOrders = useCallback(async () => {
    const savedToken = localStorage.getItem("tiffin-token");

    if (!savedToken) {
      setOrders([]);
      setLoading(false);
      setOrdersMessage("Please log in to view your orders.");
      return;
    }

    setLoading(true);
    setOrdersMessage("");

    try {
      const response = await axios.get(`${API}/orders/my/`, {
        headers: {
          Authorization: `Token ${savedToken}`,
          Accept: "application/json",
        },
      });

      const data = response.data;

      const orderList = Array.isArray(data)
        ? data
        : Array.isArray(data.results)
          ? data.results
          : Array.isArray(data.orders)
            ? data.orders
            : null;

      if (!orderList) {
        throw new Error("Unexpected response from orders API.");
      }

      setOrders(orderList);

      setOrdersMessage(
        orderList.length === 0
          ? "No orders are linked to this account yet."
          : ""
      );
    } catch (error) {
      setOrders([]);

      const status = error.response?.status;
      const data = error.response?.data;

      let message =
        data?.detail ||
        data?.message ||
        error.message ||
        "Unable to load your order history.";

      if (status === 401 || status === 403) {
        message = "Your login session is invalid. Please log in again.";
      } else if (status === 404) {
        message = "My Orders API was not found. Check Django URL configuration.";
      }

      setOrdersMessage(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    axiosOrders();
  }, [axiosOrders]);

  // Cancel order using Axios
  const cancelOrder = async (order) => {
    const orderId = order?.id ?? order?.order_id;

    if (!orderId) {
      setCancelMessage("Order ID is not available.");
      setCancelMessageType("error");
      return;
    }

    if (!canCancelOrder(order)) {
      setCancelMessage(
        "Only pending or confirmed orders can be cancelled."
      );
      setCancelMessageType("error");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to cancel order #${orderId}?`
    );

    if (!confirmed) {
      return;
    }

    const savedToken = localStorage.getItem("tiffin-token");

    if (!savedToken) {
      setCancelMessage("Please log in again.");
      setCancelMessageType("error");
      return;
    }

    setCancelLoading(orderId);
    setCancelMessage("");
    setCancelMessageType("");

    try {
      await axios.delete(`${API}/orders/${orderId}/cancel/`, {
        headers: {
          Authorization: `Token ${savedToken}`,
          Accept: "application/json",
        },
      });

      setCancelMessage(`Order #${orderId} cancelled successfully.`);
      setCancelMessageType("success");

      // Refresh orders after cancellation
      await axiosOrders();
    } catch (error) {
      const status = error.response?.status;
      const data = error.response?.data;

      let message =
        data?.detail ||
        data?.message ||
        error.message ||
        "Unable to cancel this order.";

      if (status === 401) {
        message = "Login session expired. Please log in again.";
      } else if (status === 403) {
        message = "You are not allowed to cancel this order.";
      } else if (status === 404) {
        message = "Cancel API or order was not found. Check Django URLs.";
      } else if (status === 400) {
        message = data?.detail || "This order cannot be cancelled.";
      }

      setCancelMessage(message);
      setCancelMessageType("error");
    } finally {
      setCancelLoading(null);
    }
  };

  // Login required
  if (!token) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-orange-50 px-4">
        <div className="w-full max-w-md rounded-3xl border border-orange-100 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
            <ShoppingBag size={30} />
          </div>

          <h1 className="mt-5 text-2xl font-extrabold text-gray-900">
            Login Required
          </h1>

          <p className="mt-2 text-gray-500">
            Please log in to view your orders.
          </p>

          <Link
            to="/login"
            className="mt-6 inline-flex rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffaf5] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 rounded-3xl bg-gradient-to-r from-orange-500 to-orange-400 p-6 text-white shadow-lg sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div>
              <Link
                to="/profile"
                className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-orange-50 transition hover:text-white"
              >
                <ArrowLeft size={16} />
                Back to Profile
              </Link>

              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                My Orders
              </h1>

              <p className="mt-2 text-sm text-orange-50 sm:text-base">
                Your meals, your orders, all in one place.
              </p>
            </div>

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm sm:h-20 sm:w-20">
              <Utensils size={38} />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="rounded-xl bg-white/15 px-4 py-2 text-sm font-medium">
              {orders.length} {orders.length === 1 ? "Order" : "Orders"}
            </div>

            <button type="button" onClick={axiosOrders}
              disabled={loading} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-orange-600 transition hover:bg-orange-50 disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
              Refresh Orders
            </button>
          </div>
        </div>

        {/* Success or error message */}
        {cancelMessage && (
          <div
            className={`mb-6 flex items-start gap-3 rounded-2xl border p-4 ${
              cancelMessageType === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {cancelMessageType === "success" ? (
              <CheckCircle2 size={20} className="mt-0.5 shrink-0" />
            ) : (
              <XCircle size={20} className="mt-0.5 shrink-0" />
            )}

            <p className="text-sm font-medium">{cancelMessage}</p>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="rounded-3xl border border-orange-100 bg-white p-12 text-center shadow-sm">
            <RefreshCw
              size={32}
              className="mx-auto animate-spin text-orange-500"
            />

            <h3 className="mt-4 text-lg font-bold text-gray-800">
              Loading your orders
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Please wait while we load your order history.
            </p>
          </div>
        ) : orders.length === 0 ? (
          // Empty state
          <div className="rounded-3xl border border-orange-100 bg-white px-6 py-14 text-center shadow-sm sm:px-12">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-orange-100 text-orange-500">
              <ShoppingBag size={34} />
            </div>

            <h3 className="mt-5 text-2xl font-extrabold text-gray-900">
              {ordersMessage === "No orders are linked to this account yet."
                ? "No orders yet"
                : "Unable to show orders"}
            </h3>

            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-gray-500">
              {ordersMessage ||
                "Your tiffin orders will appear here after you place an order."}
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                to="/menu"
                className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 font-bold text-white transition hover:bg-orange-600"
              >
                <Utensils size={18} />
                Explore Menu
              </Link>

              {ordersMessage && (
                <button
                  type="button"
                  onClick={axiosOrders}
                  className="inline-flex items-center gap-2 rounded-xl border border-orange-200 bg-white px-5 py-3 font-bold text-orange-600 transition hover:bg-orange-50"
                >
                  <RefreshCw size={16} />
                  Try Again
                </button>
              )}
            </div>
          </div>
        ) : (
          // Orders list
          <div className="space-y-6">
            {orders.map((order, index) => {
              const orderId = order.id ?? order.order_id ?? index + 1;

              const status = order.status || order.order_status || "Pending";
              const normalizedStatus = normalizeStatus(order);
              const canCancel = canCancelOrder(order);
              const items = getOrderItems(order);
              const total = getOrderTotal(order);

              return (
                <article
                  key={order.id ?? order.order_id ?? index}
                  className="overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-sm transition hover:shadow-md"
                >
                  {/* Order card header */}
                  <div className="flex flex-col gap-4 border-b border-gray-100 bg-gradient-to-r from-white to-orange-50/60 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                    <div className="flex items-start gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
                        <Package size={26} />
                      </div>

                      <div>
                        <h2 className="text-xl font-extrabold text-gray-900">
                          Order #{orderId}
                        </h2>

                        <p className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                          <CalendarDays size={16} className="text-orange-500" />
                          {formatDate(
                            order.created_at || order.order_date || order.date
                          )}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${getStatusClass(status)}`}
                    >
                      <Clock size={15} />
                      {formatStatus(status)}
                    </span>
                  </div>

                  {/* Card body */}
                  <div className="grid gap-7 p-5 sm:p-7 lg:grid-cols-[1.15fr_0.85fr]">
                    {/* Items */}
                    <section>
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-extrabold text-gray-900">
                          Ordered Items
                        </h3>

                        <span className="rounded-lg bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600">
                          {items.length} {items.length === 1 ? "Item" : "Items"}
                        </span>
                      </div>

                      {items.length > 0 ? (
                        <div className="space-y-3">
                          {items.map((item, itemIndex) => {
                            const quantity = item.quantity ?? item.qty ?? 1;
                            const image = getItemImage(item);

                            return (
                              <div
                                key={item.id ?? itemIndex}
                                className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-gray-50/80 p-3 transition hover:border-orange-200"
                              >
                                {image ? (
                                  <img
                                    src={image}
                                    alt={getItemName(item)}
                                    loading="lazy"
                                    onError={(event) => {
                                      event.currentTarget.style.display = "none";
                                    }}
                                    className="h-20 w-20 shrink-0 rounded-xl border border-gray-100 object-cover sm:h-24 sm:w-24"
                                  />
                                ) : (
                                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-3xl sm:h-24 sm:w-24">
                                    🍱
                                  </div>
                                )}

                                <div className="min-w-0 flex-1">
                                  <h4 className="font-bold text-gray-900">
                                    {getItemName(item)}
                                  </h4>

                                  <p className="mt-1 text-sm text-gray-500">
                                    Quantity: {quantity}
                                  </p>

                                  <p className="mt-2 font-extrabold text-orange-600">
                                    {getItemSubtotal(item)}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="rounded-2xl bg-gray-50 p-5 text-sm text-gray-500">
                          Item details are not available for this order.
                        </div>
                      )}
                    </section>

                    {/* Payment and delivery */}
                    <section className="space-y-5">
                      {/* Payment */}
                      <div>
                        <h3 className="mb-3 text-lg font-extrabold text-gray-900">
                          Payment Details
                        </h3>

                        <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                            <CreditCard size={21} />
                          </div>

                          <div>
                            <p className="text-xs font-medium text-gray-500">
                              Payment Status
                            </p>

                            <p className="mt-1 font-bold text-gray-800">
                              {formatStatus(getPaymentStatus(order))}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Address */}
                      <div>
                        <h3 className="mb-3 text-lg font-extrabold text-gray-900">
                          Delivery Address
                        </h3>

                        <div className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                            <MapPin size={21} />
                          </div>

                          <p className="pt-1 text-sm leading-6 text-gray-600">
                            {getAddress(order)}
                          </p>
                        </div>
                      </div>

                      {/* Total */}
                      <div className="rounded-2xl bg-orange-50 p-5">
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-bold text-gray-700">
                            Order Total
                          </span>

                          <span className="text-2xl font-extrabold text-orange-600">
                            {total ?? "Not available"}
                          </span>
                        </div>
                      </div>

                      {/* Cancel button */}
                      {canCancel && (
                        <button
                          type="button"
                          onClick={() => cancelOrder(order)}
                          disabled={cancelLoading === orderId}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-3 font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {cancelLoading === orderId ? (
                            <>
                              <RefreshCw size={17} className="animate-spin" />
                              Cancelling Order...
                            </>
                          ) : (
                            <>
                              <XCircle size={17} />
                              Cancel Order
                            </>
                          )}
                        </button>
                      )}

                      {/* Non-cancellable orders */}
                      {!canCancel && (
                        <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-4 py-3 text-sm font-medium text-gray-500">
                          {normalizedStatus.includes("cancel") ? (
                            <XCircle size={17} />
                          ) : (
                            <Truck size={17} />
                          )}

                          {normalizedStatus.includes("cancel")
                            ? "This order has been cancelled."
                            : "This order can no longer be cancelled."}
                        </div>
                      )}
                    </section>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Bottom button */}
        {!loading && orders.length > 0 && (
          <div className="mt-8 text-center">
            <Link
              to="/menu"
              className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 font-bold text-white shadow-sm transition hover:bg-orange-600"
            >
              <Utensils size={18} />
              Order More Tiffin
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyOrder;
