"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { database } from "@/lib/firebase";
import { ref, push } from "firebase/database";
import Link from "next/link";
import { FaArrowLeft, FaUser, FaEnvelope, FaPhone, FaProjectDiagram, FaCheck } from "react-icons/fa";

export default function ProjectRequestPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    title: "",
    description: "",
    category: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await push(ref(database, "project-request"), form);
    setSubmitted(true);
    setForm({ name: "", email: "", phone: "", title: "", description: "", category: "" });
  };

  return (
    <main className="min-h-screen bg-white" style={{ fontFamily: "'Inter', 'Poppins', sans-serif" }}>
      {/* Back Navigation */}
      <div className="p-4 sm:p-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-500 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-200"
          id="project-back"
        >
          <FaArrowLeft className="text-xs" /> Back to Home
        </Link>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="text-center mb-10">
            <div className="w-14 h-14 rounded-2xl bg-violet-50 flex items-center justify-center mx-auto mb-5">
              <FaProjectDiagram className="text-2xl text-violet-600" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
              Submit Your Project Idea
            </h1>
            <p className="text-sm sm:text-base text-slate-500 mt-3 max-w-md mx-auto">
              Share your concept and our team will help you develop it into a complete project.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8">
            <AnimatePresence>
              {submitted && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <FaCheck className="text-emerald-600 text-sm" />
                  </div>
                  <p className="text-sm font-medium text-emerald-700">Your project request has been submitted! We'll get back to you soon.</p>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Your Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Full name"
                    value={form.name}
                    onChange={handleChange}
                    className="input-field"
                    id="project-name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Email</label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="you@gmail.com"
                    value={form.email}
                    onChange={handleChange}
                    className="input-field"
                    id="project-email"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="9876543210"
                    value={form.phone}
                    onChange={handleChange}
                    className="input-field"
                    id="project-phone"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Project Title</label>
                  <input
                    type="text"
                    name="title"
                    required
                    placeholder="e.g. Smart Irrigation System"
                    value={form.title}
                    onChange={handleChange}
                    className="input-field"
                    id="project-title"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Description</label>
                <textarea
                  required
                  name="description"
                  placeholder="Describe your project idea in detail..."
                  rows={4}
                  value={form.description}
                  onChange={handleChange}
                  className="input-field resize-none"
                  id="project-description"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Category</label>
                <select
                  required
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="input-field"
                  id="project-category"
                >
                  <option value="">Select a category</option>
                  <option value="web">Web Development</option>
                  <option value="android">Android</option>
                  <option value="iot">IoT</option>
                  <option value="ml">Machine Learning</option>
                  <option value="embedded">Embedded Systems</option>
                </select>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                type="submit"
                className="w-full py-3 px-4 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-md shadow-blue-200/50 transition-all duration-200"
                id="project-submit"
              >
                Submit Project Request
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
