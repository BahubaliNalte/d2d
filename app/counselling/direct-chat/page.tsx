"use client";

import React from "react";

export default function DirectChatPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white p-4 font-poppins">
      <div className="bg-white rounded-3xl p-10 shadow-lg w-full max-w-lg border border-slate-200 flex flex-col items-center">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-4 text-center">Direct Chat with Counsellor</h1>
        <p className="text-slate-600 mb-6 text-center leading-relaxed">
          Chat instantly with our expert counsellors for any queries or support. Click the button below to start a WhatsApp chat.
        </p>
        <a
          href="https://wa.me/918767884789?text=I%20am%20a%20premium%20member%20and%20need%20counselling%20support"
          target="_blank"
          className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg text-center shadow-md hover:shadow-lg transition-all duration-300"
        >
          Start WhatsApp Chat
        </a>
      </div>
    </main>
  );
}
