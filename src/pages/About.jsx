import { Heart, Leaf, CookingPot, Truck } from "lucide-react";

const features = [
  {
    icon: CookingPot,
    title: "Homemade Taste",
    text: "Comforting meals inspired by traditional home cooking.",
  },
  {
    icon: Leaf,
    title: "Fresh Ingredients",
    text: "Our goal is to prepare meals with fresh everyday ingredients.",
  },
  {
    icon: Heart,
    title: "Made with Love",
    text: "Every meal is prepared with care for your daily routine.",
  },
  {
    icon: Truck,
    title: "Convenient Delivery",
    text: "A simple way to arrange your daily tiffin delivery.",
  },
];

export default function About() {
  return (
    <div className="min-w-0 bg-orange-50/40">
      <section className="bg-orange-100 px-5 py-16 text-center">
        <p className="font-bold tracking-widest text-orange-700">
          OUR STORY
        </p>

        <h1 className="mt-3 text-4xl font-extrabold text-gray-900 md:text-5xl">
          A Taste of Home, Every Day
        </h1>

        <p className="mx-auto mt-5 max-w-2xl leading-7 text-gray-600">
          TiffinWala aims to bring the warmth of homemade food to your
          everyday life with delicious meals inspired by Indian kitchens.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <img src="https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1000&q=80"
            alt="Home cooking"className="h-80 w-full rounded-3xl object-cover shadow-lg"/>

          <div>
            <h2 className="text-3xl font-extrabold text-gray-900">
              Simple Food. Honest Flavours.
            </h2>

            <p className="mt-5 leading-7 text-gray-600">
              We believe everyday food should be tasty, convenient and
              comforting. From Maharashtrian veg thalis to simple rice
              meals, our menu is inspired by familiar homemade flavours.
            </p>

            <p className="mt-4 leading-7 text-gray-600">
              Our goal is to make ordering daily meals easier for students,
              professionals and families.
            </p>
          </div>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, text }) => (
            <article
              key={title}
              className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm"
            >
              <Icon size={30} className="text-orange-600" />

              <h3 className="mt-4 text-lg font-bold">{title}</h3>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                {text}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}