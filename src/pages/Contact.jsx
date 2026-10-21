import { useState } from "react";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <main className="min-h-screen bg-orange-50/40 px-5 py-14">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className="font-bold tracking-widest text-orange-600">
            WE ARE HERE TO HELP
          </p>
          <h1 className="mt-3 text-4xl font-extrabold text-gray-900">
            Contact Us
          </h1>
          <p className="mt-3 text-gray-600">
            Have a question about your tiffin? Send us a message.
          </p>
        </div>

        <div className="mt-10 grid gap-8 md:grid-cols-2">
          <div className="rounded-2xl bg-green-800 p-8 text-white">
            <h2 className="text-2xl font-bold">Get In Touch</h2>
            <p className="mt-3 leading-7 text-green-100">
              Contact details below are sample details. Update them with
              your actual business information before publishing.
            </p>

            <div className="mt-8 space-y-6">
              <p className="flex items-center gap-3">
                <MapPin /> Your City, Maharashtra, India
              </p>
              <p className="flex items-center gap-3">
                <Phone /> +91 98765 43210
              </p>
              <p className="flex items-center gap-3">
                <Mail /> hello@tiffinwala.in
              </p>
              <p className="flex items-center gap-3">
                <Clock /> Mon – Sun: 8 AM – 9 PM
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}
            className="rounded-2xl border border-orange-100 bg-white p-8 shadow-sm"
          >
            <h2 className="text-2xl font-bold text-gray-900">
              Send a Message
            </h2>

            <label className="mt-5 block text-sm font-semibold">
              Full Name
              <input  required name="name" placeholder="Enter your name"
                className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-3 font-normal outline-none focus:border-orange-500"
              />
            </label>

            <label className="mt-4 block text-sm font-semibold">
              Email Address
              <input  required type="email" name="email" placeholder="you@example.com"
                className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-3 font-normal outline-none focus:border-orange-500"
              />
            </label>

            <label className="mt-4 block text-sm font-semibold"> Message
              <textarea  required  name="message" rows={4} placeholder="How can we help?"
                className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-3 font-normal outline-none focus:border-orange-500"
              />
            </label>

            <button className="mt-5 w-full rounded-lg bg-orange-600 py-3 font-bold text-white hover:bg-orange-700">
              Send Message
            </button>

            {submitted && (
              <p className="mt-4 text-sm text-green-700">
                Form validated successfully. Connect a backend to send and
                save this message.
              </p>
            )}
          </form>
        </div>
      </div>
    </main>
  );
}