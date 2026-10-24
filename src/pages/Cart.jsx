
import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import {
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ArrowLeft,
} from "lucide-react";

// Get food image from cart item
const getItemImage = (item) => {
  const rawImage =
    item?.image ||
    item?.image_url ||
    item?.img ||
    item?.dish?.image ||
    item?.dish?.image_url ||
    item?.tiffin?.image ||
    item?.tiffin?.image_url ||
    item?.product?.image ||
    item?.product?.image_url ||
    "";

  if (!rawImage) return "";

  // Django may return an image object
  const image =
    typeof rawImage === "object"
      ? rawImage.url || rawImage.image || ""
      : rawImage;

  if (typeof image !== "string" || !image.trim()) {
    return "";
  }

  const imageUrl = image.trim();

  // Full URL
  if (/^https?:\/\//i.test(imageUrl)) {
    return imageUrl;
  }

  // Protocol-relative URL
  if (imageUrl.startsWith("//")) {
    return `${window.location.protocol}${imageUrl}`;
  }

  // Relative backend media path
  if (imageUrl.startsWith("/")) {
    return imageUrl;
  }

  // Relative image path
  return `/${imageUrl}`;
};

// Food image component
function CartItemImage({ item }) {
  const image = getItemImage(item);
  const [imageError, setImageError] = useState(false);

  return (
    <div className="relative h-36 w-full shrink-0 overflow-hidden rounded-xl bg-orange-50 sm:h-28 sm:w-32">

      {image && !imageError ? (
        <img
          src={image}
          alt={item.name || "Tiffin"}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
          onError={(event) => {
            console.error(
              "Cart image loading failed:",
              event.currentTarget.src
            );

            setImageError(true);
          }}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-5xl">
          🍱
        </div>
      )}

    </div>
  );
}

export default function Cart() {
  const {
    cartItems = [],
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  // Get item price
  const getPrice = (item) => {
    const rawPrice = item.price ?? item.unit_price ?? 0;

    const price = Number(
      String(rawPrice).replace(/[₹,\s]/g, "")
    );

    return Number.isFinite(price) ? price : 0;
  };

  // Total quantity
  const totalItems = cartItems.reduce(
    (sum, item) => sum + Number(item.quantity || 1),
    0
  );

  // Cart total
  const cartTotal = cartItems.reduce(
    (sum, item) =>
      sum + getPrice(item) * Number(item.quantity || 1),
    0
  );

  // Format price
  const formatPrice = (price) =>
    `₹${Number(price).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  // Empty cart
  if (cartItems.length === 0) {
    return (
      <div className="min-w-0 bg-orange-50/40">

        <main className="flex min-h-[60vh] items-center justify-center px-4 py-12">

          <div className="w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-sm sm:p-12">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-orange-100">
              <ShoppingBag size={38} className="text-orange-600" />
            </div>

            <h1 className="mt-6 text-3xl font-extrabold text-gray-900">
              Your Cart is Empty
            </h1>

            <p className="mt-3 text-gray-600">
              Choose your favorite Maharashtrian meals from our menu.
            </p>

            <Link
              to="/menu"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-orange-600 px-6 py-3 font-bold text-white transition hover:bg-orange-700"
            >
              <ArrowLeft size={18} />
              Explore Menu
            </Link>

          </div>

        </main>

      </div>
    );
  }

  // Cart page
  return (
    <div className="min-w-0 bg-orange-50/40 md:ml-64 md:pt-[72px]">

      <main className="min-h-[60vh] px-4 py-8 sm:px-6 lg:px-8">

        <div className="mx-auto max-w-6xl">

          {/* Header */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">

            <div>

              <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                My Cart
              </h1>

              <p className="mt-2 text-gray-600">
                {totalItems} {totalItems === 1 ? "item" : "items"} in your cart
              </p>

            </div>

            <Link
              to="/menu"
              className="rounded-xl border border-orange-200 bg-white px-4 py-2.5 font-semibold text-orange-700 hover:bg-orange-50"
            >
              + Add More Items
            </Link>

          </div>

          {/* Cart and summary */}
          <div className="grid items-start gap-8 lg:grid-cols-3">

            {/* Cart items */}
            <section className="min-w-0 space-y-4 lg:col-span-2">

              {cartItems.map((item) => {

                const quantity = Number(item.quantity || 1);
                const price = getPrice(item);
                const itemKey = item.id ?? item.name;

                return (

                  <article
                    key={itemKey}
                    className="flex flex-col gap-4 rounded-2xl border border-orange-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center"
                  >

                    {/* Food image */}
                    <CartItemImage item={item} />

                    {/* Item information */}
                    <div className="min-w-0 flex-1">

                      <h2 className="text-lg font-bold text-gray-900">
                        {item.name || "Tiffin"}
                      </h2>

                      <p className="mt-1 font-semibold text-orange-600">
                        {formatPrice(price)} each
                      </p>

                      {/* Quantity and remove */}
                      <div className="mt-4 flex flex-wrap items-center gap-3">

                        <div className="flex items-center rounded-lg border border-gray-200">

                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(itemKey, quantity - 1)
                            }
                            aria-label="Decrease quantity"
                            className="p-2 hover:bg-orange-50"
                          >
                            <Minus size={16} />
                          </button>

                          <span className="min-w-10 text-center font-bold">
                            {quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(itemKey, quantity + 1)
                            }
                            aria-label="Increase quantity"
                            className="p-2 hover:bg-orange-50"
                          >
                            <Plus size={16} />
                          </button>

                        </div>

                        <button
                          type="button"
                          onClick={() => removeFromCart(itemKey)}
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={16} />
                          Remove
                        </button>

                      </div>

                    </div>

                    {/* Subtotal */}
                    <div className="sm:min-w-24 sm:text-right">

                      <p className="text-xs text-gray-500">
                        Subtotal
                      </p>

                      <p className="mt-1 text-lg font-extrabold text-gray-900">
                        {formatPrice(price * quantity)}
                      </p>

                    </div>

                  </article>

                );
              })}

              {/* Clear cart */}
              <button
                type="button"
                onClick={clearCart}
                className="rounded-lg px-2 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                <Trash2 size={16} className="mr-1 inline" />
                Clear Cart
              </button>

            </section>

            {/* Order summary */}
            <aside className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm lg:sticky lg:top-24">

              <h2 className="text-xl font-extrabold text-gray-900">
                Order Summary
              </h2>

              <div className="mt-5 flex justify-between text-gray-600">
                <span>Products</span>
                <span>{cartItems.length}</span>
              </div>

              <div className="mt-3 flex justify-between text-gray-600">
                <span>Total quantity</span>
                <span>{totalItems}</span>
              </div>

              <div className="mt-3 flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-gray-200 pt-5">

                <span className="text-lg font-bold text-gray-900">
                  Total
                </span>

                <span className="text-2xl font-extrabold text-orange-600">
                  {formatPrice(cartTotal)}
                </span>

              </div>

              {/* Checkout */}
              <Link
                to="/checkout"
                state={{ cartTotal }}
                className="mt-5 block w-full rounded-xl bg-orange-600 px-5 py-3 text-center font-bold text-white transition hover:bg-orange-700"
              >
                Proceed to Checkout
              </Link>

              <p className="mt-3 text-center text-xs text-gray-500">
                Review your order before placing it.
              </p>

            </aside>

          </div>

        </div>

      </main>

    </div>
  );
}
