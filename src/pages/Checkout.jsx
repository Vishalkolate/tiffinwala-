
import { useState } from "react";
import { Link } from "react-router-dom";
import {  CheckCircle,  ClipboardList, LoaderCircle,  ShoppingBag,} from "lucide-react";
import { useCart } from "../context/CartContext.jsx";
import axios from "axios";

const API_URL = "/api/orders/";

function getPrice(item) {
  return Number(item.price ?? item.unit_price ?? 0);
}

function getQuantity(item) {
  const quantity = Number(item.quantity ?? 1);

  return Number.isInteger(quantity) && quantity >= 1
    ? quantity
    : 1;
}

function formatPrice(amount) {
  return Number(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function Checkout() {
  const { cartItems, clearCart } = useCart();

  const [form, setForm] = useState({
    customer_name: "",
    phone: "",
    address: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState(null);

  const total = cartItems.reduce(
    (sum, item) =>
      sum + getPrice(item) * getQuantity(item),
    0
  );

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (cartItems.length === 0) {
      setError(
        "Your cart is empty. Please add a tiffin first."
      );
      return;
    }

    if (
      !form.customer_name.trim() ||
      !form.phone.trim() ||
      !form.address.trim()
    ) {
      setError("Please fill in all delivery details.");
      return;
    }

    const token = localStorage.getItem("tiffin-token");

    if (!token) {
      setError("Please login before placing your order.");
      return;
    }

    const invalidItem = cartItems.find(
      (item) =>
        !Number.isInteger(Number(item.id)) ||
        Number(item.id) <= 0 ||
        !Number.isInteger(getQuantity(item))
    );

    if (invalidItem) {
      setError(
        "Invalid tiffin ID or quantity. Please remove the item and add it again from the menu."
      );
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        customer_name: form.customer_name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        items: cartItems.map((item) => ({
          tiffin_id: Number(item.id),
          quantity: getQuantity(item),
        })),
      };

      const response = await axios.post(
        API_URL,
        orderData,
        {
          headers: {
            Authorization: `Token ${token}`,
            Accept: "application/json",
          },
        }
      );

      const data = response.data;

      if (
        !data ||
        data.id == null ||
        data.total_amount == null
      ) {
        throw new Error(
          "Order response is missing the order ID or total amount. Check your Django OrderCreateSerializer."
        );
      }

      setOrder(data);
      clearCart();
    } catch (err) {
      if (err.response) {
        const status = err.response.status;
        const data = err.response.data;

        if (status === 401 || status === 403) {
          setError(
            "Login session expired or authentication failed. Please login again."
          );
          return;
        }

        let message = "";

        if (data && typeof data === "object") {
          message = Object.entries(data)
            .map(([key, value]) => {
              const details =
                typeof value === "string"
                  ? value
                  : JSON.stringify(value);

              return `${key}: ${details}`;
            })
            .join(" | ");
        } else if (typeof data === "string") {
          message = data;
        }

        setError(
          message ||
            `Order failed with status ${status}.`
        );
      } else if (err.request) {
        setError(
          "Backend server is not responding. Please check your Django server."
        );
      } else {
        setError(
          err.message ||
            "Order could not be placed. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  // Order confirmation
  if (order) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-orange-50/50 px-4 py-12">
        <div className="w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-xl">
          <CheckCircle
            className="mx-auto text-green-600"
            size={64}/>

          <h1 className="mt-5 text-3xl font-black text-gray-900">
            Order Placed!
          </h1>

          <p className="mt-3 text-gray-600">
            Thank you, {order.customer_name || form.customer_name}.
            Your order has been saved.
          </p>

          <p className="mt-5 rounded-xl bg-orange-50 p-4 font-bold text-orange-700">
            Order ID: #{order.id}
          </p>

          <p className="mt-3 text-lg font-extrabold text-gray-900">
            Total: ₹{formatPrice(order.total_amount)}
          </p>

          <p className="mt-2 text-sm text-gray-500">
            Status: {order.status || "Pending"}
          </p>

          {Array.isArray(order.items) &&
            order.items.length > 0 && (
              <div className="mt-5 rounded-xl border border-gray-100 p-4 text-left">
                <h2 className="mb-3 font-bold text-gray-900">
                  Order Items
                </h2>

                {order.items.map((item, index) => (
                  <div
                    key={item.id ?? index}
                    className="flex justify-between gap-3 py-2 text-sm"
                  >
                    <span className="text-gray-600">
                      {item.item_name || item.name || "Tiffin"} ×{" "}
                      {item.quantity}
                    </span>

                    <span className="font-bold text-gray-900">
                      ₹
                      {formatPrice(
                        item.subtotal ??
                          Number(item.unit_price || 0) *
                            Number(item.quantity || 1)
                      )}
                    </span>
                  </div>
                ))}
              </div>
            )}

          <Link
            to="/menu"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange-600 px-6 py-3 font-bold text-white transition hover:bg-orange-700"
          >
            <ClipboardList size={18} />
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  // Empty cart
  if (cartItems.length === 0) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="flex justify-center text-orange-600">
          <ShoppingBag size={60} />
        </div>

        <h1 className="mt-4 text-2xl font-extrabold text-gray-900">
          Your cart is empty
        </h1>

        <p className="mt-2 text-gray-600">
          Add some delicious tiffins before checkout.
        </p>

        <Link  to="/menu"
          className="mt-6 inline-block rounded-xl bg-orange-600 px-6 py-3 font-bold text-white hover:bg-orange-700"
        >
          Explore Menu
        </Link>
      </main>
    );
  }

  // Checkout form
  return (
    <main className="min-h-screen bg-orange-50/50 px-4 py-12">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.3fr_0.7fr]">
        <section className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm sm:p-8">
          <span className="text-sm font-bold uppercase tracking-wider text-orange-600">
            TiffinWala
          </span>

          <h1 className="mt-2 text-3xl font-black text-gray-900">
            Checkout
          </h1>

          <p className="mt-2 text-gray-500">
            Enter your details for delivery.
          </p>

          <form  onSubmit={handleSubmit}
            className="mt-8 space-y-5"
          >
            <div>
              <label htmlFor="customer_name"
                className="mb-2 block text-sm font-bold text-gray-700"
              > Full Name </label>

              <input  id="customer_name" name="customer_name" value={form.customer_name} onChange={handleChange}
                required  maxLength={150} autoComplete="name" placeholder="Enter your full name"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
              />
            </div>

            <div>
              <label  htmlFor="phone"
                className="mb-2 block text-sm font-bold text-gray-700"
              >
                Mobile Number
              </label>

              <input id="phone" name="phone"  type="tel" value={form.phone} onChange={handleChange}
                required  maxLength={20} autoComplete="tel" placeholder="Enter your phone number"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
              />
            </div>

            <div>
              <label  htmlFor="address"
                className="mb-2 block text-sm font-bold text-gray-700"
              >
                Delivery Address
              </label>

              <textarea id="address" name="address" value={form.address}  onChange={handleChange}
                required maxLength={2000} rows={4} autoComplete="street-address" placeholder="House number, street, area, city, PIN code"
                className="w-full resize-y rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
              />
            </div>

            {error && (
              <div role="alert"
                className="break-words rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <button  type="submit"  disabled={loading || cartItems.length === 0}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-4 font-extrabold text-white shadow-md shadow-orange-200 transition hover:-translate-y-0.5 hover:from-orange-600 hover:to-red-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <LoaderCircle
                    className="animate-spin"
                    size={20}
                  />
                  Placing Order...
                </>
              ) : (
                `Place Order • ₹${formatPrice(total)}`
              )}
            </button>

            <p className="text-center text-xs leading-5 text-gray-500">
              This demo submits a cash/unpaid order. Online payment is
              not configured.
            </p>
          </form>
        </section>

        <aside className="h-fit rounded-3xl border border-orange-100 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-extrabold text-gray-900">
            Order Summary
          </h2>

          <div className="mt-5 space-y-4">
            {cartItems.map((item, index) => (
              <div key={item.id ?? index}
                className="flex items-start justify-between gap-4 border-b border-gray-100 pb-4"
              >
                <div>
                  <p className="font-bold text-gray-800">
                    {item.name || item.item_name || "Tiffin"}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    ₹{formatPrice(getPrice(item))} each
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Quantity: {getQuantity(item)}
                  </p>
                </div>

                <p className="shrink-0 font-bold text-gray-900">
                  ₹
                  {formatPrice(
                    getPrice(item) * getQuantity(item)
                  )}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-5 flex items-center justify-between gap-3">
            <span className="font-bold text-gray-600">
              Total
            </span>

            <span className="text-2xl font-black text-orange-600">
              ₹{formatPrice(total)}
            </span>
          </div>
        </aside>
      </div>
    </main>
  );
}
