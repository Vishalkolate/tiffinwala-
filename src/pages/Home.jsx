import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Clock,
  Heart,
  Leaf,
  ShieldCheck,
  Utensils,
  Truck,
} from "lucide-react";

const specials = [
  {
    id: 1,
    name: "Maharashtra Veg Thali",
    description: "Chapati, bhaji, dal, rice, salad and pickle.",
    price: 120,
    tag: "Bestseller",
    image:"https://images.openai.com/static-rsc-4/DH1pNLxwQzUtPrRaeDehhBQQFsEwSThtHJRSJLi_Zkma-zvfQvF1w_GCrumgUsAFVpHwAHNEAsrAT-2HSRB8vAXsZ-ga_caNMm7hsDxmbUlLAtq1SNftZPOV97A_jC1j_UqUnIaaNlISKULYLYwmHUb5MRjUCgFGnKpz3tCV0SyRa0B4V65OMvzEiNg1Uvoe?purpose=fullsize",
  },
  {
    id: 2,
    name: "Homemade Veg Thali",
    description: "Fresh vegetables, chapati and delicious dal.",
    price: 100,
    tag: "Healthy Choice",
    image:"https://images.openai.com/static-rsc-4/re_5lWatEinQKVN31RV6TAR3480aYV5t1ocawbYP0zu1IYwbtS7pRyQwtLfW1zWp3YN-I63KVRX4LIAs0jKtnC0z80ieHWI58RRJZlj-7RwgyZhaWUyfaOqWfsW_QBb8WkxhnnF8mo7vOMxl2sgzdwvBgiei3VQ_8fzg56VRAR4sJLAUu69bXI4imGf5W5A8?purpose=fullsize",
  },
  {
    id: 3,
    name: "Matki Usal Thali",
    description: "Comforting dal, steamed rice and homemade pickle.",
    price: 110,
    tag: "Daily Special",
    image: "https://images.openai.com/static-rsc-4/1VhWf0K5Nqzh9QnWtnpYoMf0IwbJvSzYXUQoRihzfYM1JIeTZLYxIijbo5HrhNoasJuc-ynLV-FQhsWyYMtEnYZvG_X0sOFhghvCY-GxRGTn8NlNOCA77GLEYxHEWtCgPGY3OFeAg95kLJNl_QqFLMP8CS2XNO9mrj8BMAZKDCLsfr6Bk0-rLFL0hAuPS4wJ?purpose=fullsize",
  },
];

export default function Home() {
  return (
   <div className="w-full min-w-0 bg-gray-50 text-gray-800">
      {/* Welcome banner */}
      <section className="relative overflow-hidden bg-gradient-to-r from-orange-50 via-white to-amber-50">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-5 py-8 sm:px-8 md:grid-cols-2 md:py-12 xl:px-10">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-2 text-xs font-bold tracking-wide text-orange-700">
              <Leaf size={16} />
              FRESH • HEALTHY • HOMEMADE
            </span>

            <h1 className="mt-5 text-3xl font-extrabold leading-tight text-gray-900 sm:text-4xl xl:text-5xl">
              Ghar Jaisa Khana,
              <span className="block text-orange-600">
                Har Din!
              </span>
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-6 text-gray-600 sm:text-base sm:leading-7">
              Enjoy fresh homemade tiffins delivered straight to your
              doorstep. Delicious food, affordable prices and the
              comfort of ghar-ka-khana every day.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/menu"
                className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-orange-200 transition hover:bg-orange-700"
              >
                Order Your Tiffin
                <ArrowRight size={18} />
              </Link>

              <Link to="/about"
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-700 transition hover:border-orange-300 hover:text-orange-600"
              > About Us </Link>
            </div>

            <div className="mt-6 flex flex-wrap gap-4 text-xs font-medium text-gray-600 sm:text-sm">
              <span className="flex items-center gap-2">
                <ShieldCheck size={17} className="text-green-600" />
                Hygienic Food
              </span>
              <span className="flex items-center gap-2">
                <Heart size={17} className="text-orange-600" />
                Homemade Taste
              </span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg">
            <img
              src="https://images.openai.com/static-rsc-4/1VhWf0K5Nqzh9QnWtnpYoMf0IwbJvSzYXUQoRihzfYM1JIeTZLYxIijbo5HrhNoasJuc-ynLV-FQhsWyYMtEnYZvG_X0sOFhghvCY-GxRGTn8NlNOCA77GLEYxHEWtCgPGY3OFeAg95kLJNl_QqFLMP8CS2XNO9mrj8BMAZKDCLsfr6Bk0-rLFL0hAuPS4wJ?purpose=fullsize"
              alt="Fresh Indian thali"
              className="h-56 w-full rounded-2xl object-cover shadow-xl sm:h-72 lg:h-80"
            />

            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-3 rounded-xl bg-white/95 p-3 shadow-lg sm:bottom-4 sm:left-4 sm:right-4 sm:p-4">
              <div>
                <p className="text-xs font-semibold text-orange-600">
                  TODAY'S FAVOURITE
                </p>
                <h3 className="mt-1 text-sm font-bold text-gray-900 sm:text-base">
                  Maharashtra Veg Thali
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                  Freshly prepared with love
                </p>
              </div>
              <span className="rounded-lg bg-orange-100 px-3 py-2 text-lg font-extrabold text-orange-700">
                ₹120
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Quick highlights */}
      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-5 py-6 sm:grid-cols-3 sm:px-8 xl:px-10">
        <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="rounded-xl bg-orange-100 p-3 text-orange-600">
            <Utensils size={23} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Fresh Meals</h3>
            <p className="mt-1 text-xs text-gray-500">
              Cooked fresh every day
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="rounded-xl bg-green-100 p-3 text-green-600">
            <Leaf size={23} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Healthy Food</h3>
            <p className="mt-1 text-xs text-gray-500">
              Balanced homemade meals
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
            <Truck size={23} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Easy Ordering</h3>
            <p className="mt-1 text-xs text-gray-500">
              Simple and convenient
            </p>
          </div>
        </div>
      </section>

      {/* Today's special menu */}
      <section className="mx-auto max-w-7xl px-5 pb-8 pt-3 sm:px-8 xl:px-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-orange-600">
              Made With Love
            </p>
            <h2 className="mt-2 text-2xl font-extrabold text-gray-900 sm:text-3xl">
              Today's Special
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Choose your favourite homemade meal.
            </p>
          </div>

          <Link to="/menu"
            className="inline-flex items-center gap-2 text-sm font-bold text-orange-600 hover:text-orange-700"
          > View Full Menu <ArrowRight size={17} />
          </Link>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {specials.map((dish) => (
            <article
              key={dish.id}
              className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative overflow-hidden">
                <img src={dish.image} alt={dish.name} loading="lazy"
                  className="h-44 w-full object-cover transition duration-500 group-hover:scale-105 sm:h-48"
                />

                <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-orange-700 shadow">
                  {dish.tag}
                </span>
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-bold text-gray-900">
                    {dish.name}
                  </h3>
                  <span className="shrink-0 text-lg font-extrabold text-orange-600">
                    ₹{dish.price}
                  </span>
                </div>

                <p className="mt-2 min-h-10 text-sm leading-5 text-gray-500">
                  {dish.description}
                </p>

                <Link to="/menu"
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-orange-50 px-4 py-2.5 text-sm font-bold text-orange-700 transition hover:bg-orange-600 hover:text-white"
                > Order Now <ArrowRight size={17} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Bottom banner */}
      <section className="mx-auto max-w-7xl px-5 pb-8 sm:px-8 xl:px-10">
        <div className="flex flex-col items-start justify-between gap-4 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 p-6 text-white sm:flex-row sm:items-center sm:p-8">
          <div>
            <h2 className="text-xl font-extrabold sm:text-2xl">
              Hungry? Let's Fix That!
            </h2>
            <p className="mt-2 text-sm text-orange-50">
              Fresh food, homely taste and affordable tiffins.
            </p>
          </div>

          <Link
            to="/menu"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-orange-700 transition hover:bg-orange-50"
          > Explore Menu
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <div className="px-5 pb-5 text-center text-xs text-gray-400">
        <Clock size={13} className="mr-1 inline" />
        TiffinWala — Ghar Jaisa Khana
      </div>
    </div>
  );
}
