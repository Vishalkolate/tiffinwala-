
import { Link } from "react-router-dom";
import {
  UtensilsCrossed,
  MapPin,
  Phone,
  Mail,
  Clock,
  ArrowRight,
  Heart,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-auto bg-gray-950 text-gray-300">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">

        {/* Footer columns */}
        <div className="grid grid-cols-1 gap-9 sm:grid-cols-2 xl:grid-cols-4">

          {/* Brand */}
          <div>
            <Link to="/" className="mb-5 inline-flex items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white">
                <UtensilsCrossed size={25} />
              </span>

              <span>
                <span className="block text-2xl font-extrabold text-white">
                  Tiffin<span className="text-orange-500">Wala</span>
                </span>
                <span className="text-xs tracking-widest text-gray-400">
                  GHAR JAISA KHANA
                </span>
              </span>
            </Link>

            <p className="text-sm leading-7 text-gray-400">
              Fresh, healthy and delicious homemade meals, prepared
              with love and delivered to your doorstep. Enjoy ghar
              jaisa khana every day!
            </p>

            {/* Social links */}
            <div className="mt-5 flex gap-3">
              <a  href="https://www.facebook.com/"  target="_blank"
                rel="noopener noreferrer" aria-label="Facebook"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-700 text-white transition hover:border-orange-500 hover:bg-orange-500"
              > <span className="text-xl font-bold">f</span>
              </a>

              <a href="https://www.instagram.com/" target="_blank"
                rel="noopener noreferrer" aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-700 text-white transition hover:border-orange-500 hover:bg-orange-500"
              >
                <span className="text-xl font-bold">◎</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-5 text-lg font-bold text-white">
              Quick Links
            </h3>

            <ul className="space-y-3 text-sm">
              <li>
                <Link className="transition hover:text-orange-400" to="/">
                  Home
                </Link>
              </li>
              <li>
                <Link className="transition hover:text-orange-400" to="/menu">
                  Our Menu
                </Link>
              </li>
              <li>
                <Link className="transition hover:text-orange-400" to="/about">
                  About Us
                </Link>
              </li>
              <li>
                <Link className="transition hover:text-orange-400" to="/contact">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h3 className="mb-5 text-lg font-bold text-white">
              Customer Care
            </h3>

            <ul className="space-y-3 text-sm">
              <li>
                <Link className="transition hover:text-orange-400" to="/login">
                  My Account
                </Link>
              </li>
              <li>
                <Link className="transition hover:text-orange-400" to="/cart">
                  My Cart
                </Link>
              </li>
              <li>
                <Link className="transition hover:text-orange-400" to="/orders">
                  My Orders
                </Link>
              </li>
              <li>
                <Link className="transition hover:text-orange-400" to="/contact">
                  Help &amp; Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="mb-5 text-lg font-bold text-white">
              Get In Touch
            </h3>

            <div className="space-y-4 text-sm">
              <p className="flex items-start gap-3">
                <MapPin size={19} className="mt-0.5 shrink-0 text-orange-500" />
                <span>Your City, Maharashtra, India</span>
              </p>

              <p className="flex items-center gap-3">
                <Phone size={18} className="shrink-0 text-orange-500" />
                <a href="tel:+919876543210"
                  className="transition hover:text-orange-400" >
                  +91 98765 43210
                </a>
              </p>

              <p className="flex items-start gap-3">
                <Mail size={18} className="mt-0.5 shrink-0 text-orange-500" />
                <a
                  href="mailto:hello@tiffinwala.in"
                  className="break-all transition hover:text-orange-400"
                > hello@tiffinwala.in </a>
              </p>

              <p className="flex items-start gap-3">
                <Clock size={18} className="mt-0.5 shrink-0 text-orange-500" />
                <span>Mon – Sun: 8 AM – 9 PM</span>
              </p>
            </div>
          </div>
        </div>

        {/* Explore Menu Banner */}
        <div className="mt-10 flex flex-col items-start justify-between gap-5 rounded-2xl border border-orange-500/20 bg-orange-500/10 p-5 sm:flex-row sm:items-center sm:p-7">
          <div>
            <h3 className="text-xl font-bold text-white">
              Hungry for something delicious?
            </h3>
            <p className="mt-2 text-sm leading-6 text-gray-400">
              Explore fresh homemade tiffins made with love.
            </p>
          </div>

          <Link
            to="/menu"
            className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-orange-600"
          >
            Explore Menu
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-5 text-center text-sm text-gray-500 sm:flex-row sm:px-6 lg:px-8">
          <p>
            © {new Date().getFullYear()} TiffinWala. All rights reserved.
          </p>

          <p className="flex items-center gap-2">
            Made with
            <Heart size={15} className="fill-red-500 text-red-500" />
            for food lovers
          </p>
        </div>
      </div>
    </footer>
  );
}
