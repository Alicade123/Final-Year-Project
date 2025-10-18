import React, { useState, useEffect } from "react";
import {
  ArrowRight,
  Quote,
  Sprout,
  ShoppingBag,
  Users,
  MapPin,
  Mail,
  Phone,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Globe,
  BarChart3,
  Truck,
} from "lucide-react";
import { Link } from "react-router-dom";

const testimonials = [
  {
    name: "Jean Baptiste, Farmer in Ruhango",
    role: "Coffee & Vegetable Producer",
    text: "Through the hub I sell my produce 40% faster and receive payments within 24 hours. No more waiting weeks for middlemen.",
    img: "https://images.unsplash.com/photo-1595152772835-219674b2a8a6?w=400&h=400&fit=crop",
  },
  {
    name: "Alice Uwamahoro, Restaurant Owner",
    role: "Kigali City Buyer",
    text: "Ordering directly from farmers ensures absolute freshness for my restaurant while supporting local communities with fair prices.",
    img: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=400&fit=crop",
  },
  {
    name: "Eric Mugisha, Hub Manager",
    role: "Musanze Collection Hub",
    text: "Managing deliveries, inventory, and farmer payouts is now streamlined through one intuitive dashboard. Our hub processes 2 tons daily.",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
  },
];

const impactStats = [
  { value: "850+", label: "Registered Farmers" },
  { value: "340+", label: "Active Buyers" },
  { value: "23", label: "Collection Hubs" },
  { value: "$2.4M", label: "Produce Traded" },
];

const features = [
  {
    icon: Sprout,
    title: "Empower Farmers",
    desc: "Direct market access increases farmer income by up to 30%, eliminating exploitative middlemen.",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    icon: ShoppingBag,
    title: "Fair Market Prices",
    desc: "Transparent pricing ensures buyers get fresh produce while farmers earn sustainable incomes.",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    icon: Users,
    title: "Stronger Communities",
    desc: "Local hubs create jobs, reduce post-harvest losses by 25%, and build food system resilience.",
    gradient: "from-blue-500 to-indigo-600",
  },
  {
    icon: Truck,
    title: "Efficient Logistics",
    desc: "Coordinated collection and delivery systems reduce waste and ensure timely distribution.",
    gradient: "from-purple-500 to-pink-600",
  },
];

export default function LandingPage() {
  const [index, setIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  function prev() {
    setIndex((index - 1 + testimonials.length) % testimonials.length);
  }

  function next() {
    setIndex((index + 1) % testimonials.length);
  }

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50">
      {/* Navigation Bar */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm shadow-sm z-50">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Sprout className="text-emerald-600" size={32} />
              <span className="text-xl font-bold text-neutral-800">
                Farmers Trade Hub
              </span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <a
                href="login"
                className="text-neutral-600 hover:text-emerald-600 transition-colors font-medium"
              >
                Farmers
              </a>
              <a
                href="login"
                className="text-neutral-600 hover:text-emerald-600 transition-colors font-medium"
              >
                Buyers
              </a>
              <a
                href="login"
                className="text-neutral-600 hover:text-emerald-600 transition-colors font-medium"
              >
                Hub-Manager
              </a>
              {/* <button className="bg-emerald-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-emerald-700 transition-all shadow-md hover:shadow-lg ">
                <Link className="hover:cursor-pointer" to={"login"}>
                  {" "}
                  Get Started
                </Link>
              </button> */}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden mt-16">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-emerald-700 to-teal-600"></div>
        <img
          src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1920&h=1080&fit=crop"
          alt="Rwandan farmland"
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-30"
        />

        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse"></div>

        <div
          className={`relative max-w-7xl mx-auto px-6 py-24 text-center transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <h1 className="text-3xl md:text-7xl font-extrabold leading-tight text-white mb-6">
            Connecting Farmers,
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-400">
              Buyers & Communities
            </span>
          </h1>
          <p className="mt-6 max-w-3xl mx-auto text-xl text-emerald-50 leading-relaxed">
            A modern digital platform transforming Rwanda's agriculture. Trade
            produce transparently, ensure fair prices, and strengthen food
            systems across Africa.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <button className="group bg-gradient-to-r from-amber-400 to-orange-500 text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-3 shadow-2xl hover:shadow-amber-500/50 transition-all hover:scale-105">
              <Link className="hover:cursor-pointer" to={"login"}>
                Get started
              </Link>
              <ArrowRight
                size={20}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
            <button className="bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/20 transition-all hover:scale-105 shadow-xl">
              <Link to={"register"}>Join as Customer</Link>
            </button>
          </div>

          {/* Quick Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {impactStats.map((stat, i) => (
              <div
                key={i}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all"
              >
                <div className="text-4xl font-black text-amber-400">
                  {stat.value}
                </div>
                <div className="text-emerald-100 text-sm font-medium mt-2">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-neutral-800 mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              Built for Rwanda, designed for Africa. Our platform aligns with
              AfCFTA goals and international food security standards.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <div
                key={i}
                className="group relative bg-white border-2 border-neutral-100 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                <div
                  className={`inline-flex p-4 bg-gradient-to-br ${feature.gradient} rounded-xl mb-4 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className="text-white" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-neutral-800 mb-3">
                  {feature.title}
                </h3>
                <p className="text-neutral-600 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-24 bg-gradient-to-br from-neutral-50 to-neutral-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                <BarChart3 size={16} />
                Research-Backed Impact
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-neutral-800 mb-6">
                Transforming African Agriculture
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle
                    className="text-emerald-600 flex-shrink-0 mt-1"
                    size={24}
                  />
                  <p className="text-lg text-neutral-700">
                    Direct farm-to-consumer platforms help farmers bypass
                    traditional intermediaries, enhancing freshness while
                    allowing farmers to retain more value
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle
                    className="text-emerald-600 flex-shrink-0 mt-1"
                    size={24}
                  />
                  <p className="text-lg text-neutral-700">
                    Rwanda leads agricultural innovation with digital platforms
                    that streamline input management and ensure farmers receive
                    resources at the right time
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle
                    className="text-emerald-600 flex-shrink-0 mt-1"
                    size={24}
                  />
                  <p className="text-lg text-neutral-700">
                    Rwanda successfully dispatched value-added agricultural
                    products to Ghana under AfCFTA, demonstrating the power of
                    cross-border agricultural trade
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle
                    className="text-emerald-600 flex-shrink-0 mt-1"
                    size={24}
                  />
                  <p className="text-lg text-neutral-700">
                    The global digital agriculture marketplace is projected to
                    reach $43.73 billion by 2033, growing at 13% annually
                  </p>
                </div>
              </div>
              <a
                href="https://www.fao.org"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-all shadow-lg hover:shadow-xl"
              >
                <Globe size={20} />
                Learn More from FAO
              </a>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-3xl p-8 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=800&h=600&fit=crop"
                  alt="Rwanda agriculture"
                  className="rounded-2xl w-full h-80 object-cover shadow-xl"
                />
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="text-3xl font-black text-white">30%</div>
                    <div className="text-emerald-100 text-sm mt-1">
                      Income Increase
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="text-3xl font-black text-white">25%</div>
                    <div className="text-emerald-100 text-sm mt-1">
                      Less Waste
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-amber-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <Quote className="mx-auto text-amber-400 mb-8" size={48} />
          <h2 className="text-4xl font-bold text-white mb-16">
            Stories from Our Community
          </h2>

          <div className="bg-white/10 backdrop-blur-md border-2 border-white/20 rounded-3xl p-12 shadow-2xl">
            <p className="text-2xl md:text-3xl italic text-white leading-relaxed mb-8">
              "{testimonials[index].text}"
            </p>

            <div className="flex items-center justify-center gap-5">
              <img
                src={testimonials[index].img}
                alt={testimonials[index].name}
                className="w-20 h-20 rounded-full object-cover border-4 border-amber-400 shadow-lg"
              />
              <div className="text-left">
                <div className="font-bold text-xl text-white">
                  {testimonials[index].name}
                </div>
                <div className="text-emerald-200 text-sm">
                  {testimonials[index].role}
                </div>
              </div>
            </div>

            <div className="mt-10 flex justify-center gap-4">
              <button
                onClick={prev}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-3 rounded-full transition-all hover:scale-110 border border-white/30"
              >
                <ChevronLeft className="text-white" size={24} />
              </button>
              <button
                onClick={next}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-3 rounded-full transition-all hover:scale-110 border border-white/30"
              >
                <ChevronRight className="text-white" size={24} />
              </button>
            </div>

            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === index ? "w-8 bg-amber-400" : "w-2 bg-white/40"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1920&h=600&fit=crop"
            alt="pattern"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
            Ready to Transform Agriculture?
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Join thousands of farmers, buyers, and hub managers building a
            fairer, more resilient food system across Africa.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-white text-orange-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-neutral-100 transition-all shadow-2xl hover:scale-105">
              Register Your Hub
            </button>
            <button className="bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-emerald-700 transition-all shadow-2xl hover:scale-105">
              Start Selling Today
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-neutral-300 py-16">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12 pl-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Sprout className="text-emerald-500" size={36} />
              <span className="text-2xl font-bold text-white">
                Farmers Trade Hub
              </span>
            </div>
            <p className="text-neutral-400 leading-relaxed mb-4">
              Strengthening rural-urban food linkages in Rwanda and across
              Africa. Building sustainable agricultural systems through digital
              innovation.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 bg-neutral-800 hover:bg-emerald-600 rounded-lg flex items-center justify-center transition-all"
              >
                <Globe size={20} />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-neutral-800 hover:bg-green-500 rounded-lg flex items-center justify-center transition-all"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                </svg>
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-neutral-800 hover:bg-green-600 rounded-lg flex items-center justify-center transition-all"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="#buyers"
                  className="hover:text-emerald-400 transition-colors flex items-center gap-2"
                >
                  <ShoppingBag size={16} />
                  Marketplace
                </a>
              </li>
              <li>
                <a
                  href="#farmers"
                  className="hover:text-emerald-400 transition-colors flex items-center gap-2"
                >
                  <Sprout size={16} />
                  Farmer Portal
                </a>
              </li>
              <li>
                <a
                  href="#hubs"
                  className="hover:text-emerald-400 transition-colors flex items-center gap-2"
                >
                  <Users size={16} />
                  Hub Portal
                </a>
              </li>
              <li>
                <a
                  href="https://au-afcfta.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 transition-colors flex items-center gap-2"
                >
                  <Globe size={16} />
                  About AfCFTA
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-lg mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin
                  size={18}
                  className="flex-shrink-0 mt-1 text-emerald-500"
                />
                <span className="text-sm">
                  Ruhango District, <br />
                  Southern Province, Rwanda
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-emerald-500" />
                <a
                  href="mailto:farmertradehub@gmail.com"
                  className="text-sm hover:text-emerald-400 transition-colors"
                >
                  farmertradehub@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-emerald-500" />
                <span className="text-sm">+250 788 888 888</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-neutral-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-neutral-500">
            <div>
              © {new Date().getFullYear()} Farmers Trade Hub. All rights
              reserved.
            </div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-emerald-400 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-emerald-400 transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-emerald-400 transition-colors">
                Support
              </a>
              <a
                href="/contact"
                className="hover:text-emerald-400 transition-colors"
              >
                Contact us
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
