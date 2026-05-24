// app/thank-you/page.tsx
export default function ThankYouPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 font-poppins px-4">
      <div className="text-center p-8 bg-white shadow-lg rounded-3xl max-w-md border border-slate-100">
        <h1 className="text-3xl font-bold text-emerald-600 mb-2">🎉 Payment Successful!</h1>
        <p className="text-slate-600 mb-4 leading-relaxed">
          Thank you for purchasing Premium Counselling. We’ve received your payment and you’ll get guidance soon.
        </p>
        <a
          href="/counselling/premium"
          className="inline-block mt-4 bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition duration-300 font-semibold"
        >
          Enjoy Your Premium Counselling!!!
        </a>
      </div>
    </main>
  );
}
