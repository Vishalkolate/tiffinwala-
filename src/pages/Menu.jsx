
import { useEffect, useState } from "react";
import {
  ShoppingCart,
  RefreshCw,
  Utensils,
} from "lucide-react";
import { useCart } from "../context/CartContext.jsx";
import axios from "axios";

const API = "/api";

export default function Menu() {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addedDishId, setAddedDishId] = useState(null);

  const { addToCart } = useCart();

  // Fetch menu from Django API using Axios
  useEffect(() => {
    let isMounted = true;

    async function fetchMenu() {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(`${API}/menu/`, {
          headers: {
            Accept: "application/json",
          },
        });

        const data = response.data;

        const menuList = Array.isArray(data)
          ? data
          : Array.isArray(data.results)
            ? data.results
            : Array.isArray(data.menu)
              ? data.menu
              : null;

        if (!menuList) {
          throw new Error("Unexpected response from Menu API.");
        }

        if (isMounted) {
          setDishes(menuList);
        }
      } catch (err) {
        if (isMounted) {
          const status = err.response?.status;

          let message =
            err.response?.data?.detail ||
            err.response?.data?.message ||
            "Menu load झाला नाही. Django server आणि API तपासा.";

          if (status === 404) {
            message = "Menu API सापडली नाही. Django URL configuration तपासा.";
          } else if (status === 500) {
            message = "Django server मध्ये error आहे. Backend terminal तपासा.";
          }

          setError(message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchMenu();

    return () => {
      isMounted = false;
    };
  }, []);

  // Add dish to cart
  function handleAddToCart(dish) {
    addToCart(dish);
    setAddedDishId(dish.id);

    window.setTimeout(() => {
      setAddedDishId((currentId) =>
        currentId === dish.id ? null : currentId
      );
    }, 1200);
  }

  // Loading screen
  if (loading) {
    return (
      <main className="min-h-[60vh] bg-orange-50/50 px-4">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 animate-pulse items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
              <Utensils size={32} />
            </div>

            <p className="mt-5 text-lg font-bold text-orange-700">
              Preparing your menu...
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Loading fresh homemade meals
            </p>
          </div>
        </div>
      </main>
    );
  }

  // Error screen
  if (error) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-orange-50/50 px-4 py-10">
        <div className="w-full max-w-lg rounded-3xl border border-red-100 bg-white p-8 text-center shadow-lg">
          <div className="text-5xl">🍽️</div>

          <h2 className="mt-4 text-xl font-extrabold text-gray-900">
            Unable to load menu
          </h2>

          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>

          <button  type="button" onClick={() => window.location.reload()}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-6 py-3 font-bold text-white shadow-md transition hover:bg-orange-700 focus:outline-none focus:ring-4 focus:ring-orange-200"
          >
            <RefreshCw size={18} />
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full min-w-0 bg-gradient-to-b from-orange-50/70 via-white to-orange-50/40">
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        {/* Page Heading */}
        <div className="mb-10 text-center sm:mb-12">
          <span className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-4 py-2 text-xs font-extrabold tracking-widest text-orange-700 shadow-sm sm:text-sm">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            FRESH • HEALTHY • HOMEMADE
          </span>

          <h1 className="mt-5 text-4xl font-black tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            Our Tiffin{" "}
            <span className="text-orange-600">Menu</span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg">
            Enjoy authentic Maharashtrian homemade food,
            prepared fresh with love and delivered to your doorstep.
          </p>

          <div className="mx-auto mt-6 h-1.5 w-24 rounded-full bg-gradient-to-r from-orange-400 to-red-500" />
        </div>

        {/* Empty Menu */}
        {dishes.length === 0 ? (
          <div className="rounded-3xl border border-orange-100 bg-white px-6 py-14 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-orange-100 text-5xl">
              🍱
            </div>

            <h2 className="mt-5 text-2xl font-extrabold text-gray-900">
              No meals available
            </h2>

            <p className="mx-auto mt-3 max-w-md text-gray-500">
              Please add available tiffins from Django Admin.
            </p>
          </div>
        ) : (
          /* Menu Cards */
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {dishes.map((dish) => {
              const isAvailable = dish.is_available !== false;
              const wasAdded = addedDishId === dish.id;

              return (
                <article
                  key={dish.id}
                  className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl"
                >
                  {/* Food Image */}
                  <div className="relative h-48 overflow-hidden bg-orange-50 sm:h-52">
                    {dish.image ? (
                      <img
                        src={dish.image}
                        alt={dish.name || "Homemade tiffin"}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-7xl">
                        🍛
                      </div>
                    )}

                    {/* Bestseller Badge */}
                    <span className="absolute left-3 top-3 rounded-full border border-orange-100 bg-white px-3 py-1.5 text-xs font-extrabold text-orange-600 shadow-md">
                      Bestseller
                    </span>

                    {/* Availability Badge */}
                    {!isAvailable && (
                      <span className="absolute right-3 top-3 rounded-full bg-gray-900/90 px-3 py-1.5 text-xs font-bold text-white">
                        Sold Out
                      </span>
                    )}
                  </div>

                  {/* Food Details */}
                  <div className="flex flex-1 flex-col p-4">
                    {/* Dish Name and Price */}
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="min-w-0 flex-1 text-base font-extrabold leading-6 text-gray-900 transition-colors group-hover:text-orange-700">
                        {dish.name}
                      </h2>

                      <span className="shrink-0 text-xl font-black leading-6 text-orange-600">
                        ₹
                        {Number(dish.price || 0).toLocaleString("en-IN", {
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="mt-2 min-h-10 text-sm leading-5 text-gray-500">
                      {dish.description || "Freshly prepared homemade food."}
                    </p>

                    {/* Order Now Button */}
                    <button
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => handleAddToCart(dish)}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-orange-50 px-4 py-3 text-sm font-bold text-orange-700 transition-all duration-200 hover:bg-orange-100 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-orange-300 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
                    >
                      {wasAdded ? (
                        <>
                          <ShoppingCart size={17} />
                          Added to Cart!
                        </>
                      ) : (
                        <>
                          {isAvailable ? "Order Now" : "Sold Out"}

                          {isAvailable && (
                            <span className="text-lg leading-none">
                              →
                            </span>
                          )}
                        </>
                      )}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Bottom Note */}
        {dishes.length > 0 && (
          <div className="mt-12 rounded-2xl border border-orange-100 bg-white p-5 text-center shadow-sm sm:p-6">
            <p className="font-bold text-gray-800">
              ❤️ Homemade with love, delivered with care.
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Fresh meals for a happier, healthier day.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
