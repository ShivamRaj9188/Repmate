import React, { useState } from "react";
import img from "../assets/images/contact.png";
import { STORAGE_KEYS, getJSON, setJSON } from "../lib/storage";

const Contact = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    message: "",
    terms: false,
  });

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.terms) {
      alert("Please accept the terms and conditions.");
      return;
    }
    const entry = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      department: form.department,
      message: form.message.trim(),
      timestamp: new Date().toISOString(),
    };
    const messages = getJSON(STORAGE_KEYS.messages, []);
    messages.push(entry);
    setJSON(STORAGE_KEYS.messages, messages);
    alert("Message sent successfully. We will get back to you soon.");
    setForm({
      name: "",
      email: "",
      phone: "",
      department: "",
      message: "",
      terms: false,
    });
  };

  return (
    <div className="font-inter bg-[#10141a] text-[#e4e6eb] min-h-screen">
      <main className="max-w-[1200px] mx-auto my-16 px-6">
        <div className="flex flex-wrap gap-8 items-start justify-center">
          <div className="flex-1 min-w-[300px] min-h-[400px] bg-[#151a20] shadow-[0_0_10px_rgba(62,207,142,0.1)] p-4">
            <div className="w-full h-[300px] bg-[#1a1f27] border-2 border-dashed border-[#2c3340] rounded-xl shadow-[0_0_10px_rgba(62,207,142,0.1)] mb-4 flex items-center justify-center overflow-hidden relative transition-transform duration-300 ease-in-out hover:scale-[1.03] hover:border-[#3ECF8E] hover:shadow-[0_0_10px_rgba(62,207,142,0.6),0_0_16px_rgba(62,207,142,0.3)]">
              <img
                src={img}
                alt="Contact"
                className="w-full h-full object-cover rounded-xl transition-transform duration-400 ease-in-out hover:scale-105"
              />
            </div>
            <div className="text-center font-orbitron text-[#3ECF8E] text-sm px-2">
              <p>"Empowered by tech, driven by vision."</p>
            </div>
          </div>

          <div className="flex-1 min-w-[500px] bg-[#1a1f27] border border-[#2c3340] rounded-xl p-8 shadow-[0_0_16px_rgba(0,255,170,0.05)]">
            <h1 className="font-orbitron text-4xl font-bold text-[#3ECF8E] text-center mb-8">
              Contact Us
            </h1>
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col mb-6">
                <label htmlFor="name" className="font-orbitron text-base text-[#c8ccd4] mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  placeholder="Your full name"
                  required
                  value={form.name}
                  onChange={handleChange}
                  className="bg-[#12171e] border border-[#2c3340] px-4 py-3 rounded-lg text-[#e4e6eb] text-base focus:border-[#3ECF8E] focus:shadow-[0_0_10px_rgba(62,207,142,0.2)] outline-none"
                />
              </div>

              <div className="flex flex-col mb-6">
                <label htmlFor="email" className="font-orbitron text-base text-[#c8ccd4] mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="you@example.com"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className="bg-[#12171e] border border-[#2c3340] px-4 py-3 rounded-lg text-[#e4e6eb] text-base focus:border-[#3ECF8E] focus:shadow-[0_0_10px_rgba(62,207,142,0.2)] outline-none"
                />
              </div>

              <div className="flex flex-col mb-6">
                <label htmlFor="phone" className="font-orbitron text-base text-[#c8ccd4] mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  placeholder="e.g. +1 555 123 4567"
                  required
                  value={form.phone}
                  onChange={handleChange}
                  className="bg-[#12171e] border border-[#2c3340] px-4 py-3 rounded-lg text-[#e4e6eb] text-base focus:border-[#3ECF8E] focus:shadow-[0_0_10px_rgba(62,207,142,0.2)] outline-none"
                />
              </div>

              <div className="flex flex-col mb-6">
                <label htmlFor="department" className="font-orbitron text-base text-[#c8ccd4] mb-2">
                  Select Department
                </label>
                <select
                  id="department"
                  required
                  value={form.department}
                  onChange={handleChange}
                  className="bg-[#12171e] border border-[#2c3340] px-4 py-3 rounded-lg text-[#e4e6eb] text-base focus:border-[#3ECF8E] focus:shadow-[0_0_10px_rgba(62,207,142,0.2)] outline-none"
                >
                  <option value="">-- Choose an option --</option>
                  <option value="tech">Technical Support</option>
                  <option value="feedback">Feedback</option>
                  <option value="partnership">Partnerships</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="flex flex-col mb-6">
                <label htmlFor="message" className="font-orbitron text-base text-[#c8ccd4] mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  rows="5"
                  placeholder="What's on your mind?"
                  required
                  value={form.message}
                  onChange={handleChange}
                  className="bg-[#12171e] border border-[#2c3340] px-4 py-3 rounded-lg text-[#e4e6eb] text-base focus:border-[#3ECF8E] focus:shadow-[0_0_10px_rgba(62,207,142,0.2)] outline-none"
                ></textarea>
              </div>

              <label className="flex items-center gap-3 mb-6 custom-checkbox relative cursor-pointer text-[#c8ccd4] text-sm">
                <input type="checkbox" id="terms" checked={form.terms} onChange={handleChange} required />
                <span className="checkmark"></span>
                <span className="text-[#c8ccd4]">
                  I agree to the terms and conditions
                </span>
              </label>

              <div className="flex justify-end mt-6">
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0066FF] rounded-tl-[15px] rounded-br-[15px] rounded-tr-[8px] rounded-bl-[8px] text-white font-orbitron font-semibold hover:bg-[#0052cc] hover:shadow-[0_0_10px_rgba(0,102,255,0.6),0_0_18px_rgba(0,102,255,0.3)] hover:text-[#3ECF8E] hover:-translate-y-0.5 transition"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Contact;
