"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import UserTable from "./UserTable";
import PlusMemberTable from "./PlusMemberTable";
import CollegeRequestTable from "./CollegeRequestTable";

import AnnouncementAdmin from "./AnnouncementAdmin";
import ClientReviewAdmin from "./ClientReviewAdmin";
import BannerAdmin from "./BannerAdmin";
import FeedbackImageAdmin from "./FeedbackImageAdmin";
import MentorshipRequestTable from "./MentorshipRequestTable";
import PrebookAdmin from "./PrebookAdmin";
import SuccessStoryAdmin from "./SuccessStoryAdmin";
import { get, ref as dbRef, set } from "firebase/database";
import { database, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

const adminSections = [
	{
		key: "users",
		label: "User Management",
		desc: "View, search, filter, and manage all registered users.",
	},
	{
		key: "premium",
		label: "Premium/Plus Membership Management",
		desc: "View and manage premium/plus members and payments.",
	},
	{
		key: "collegeRequests",
		label: "Best College List Requests",
		desc: "View, process, and export best college list requests.",
	},
	{
		key: "notifications",
		label: "Notifications & Announcements",
		desc: "Create and manage notifications and announcements.",
	},
	{
		key: "content",
		label: "Content Management",
		desc: "Manage reviews and feedback images.",
	},
	{
		key: "mentorship",
		label: "1:1 Mentorship Requests",
		desc: "View and manage 1:1 mentorship session requests.",
	},
	{
		key: "prebook",
		label: "Prebooked Users",
		desc: "View and manage users who have prebooked sessions.",
	},
	{
		key: "successStories",
		label: "Success Stories",
		desc: "Manage successfully placed students on the premium page.",
	},
];

export default function AdminPage() {
	const [section, setSection] = useState(adminSections[0].key);
	const [premiumPrice, setPremiumPrice] = useState<number | null>(null);
	const [priceInput, setPriceInput] = useState("");
	const [priceLoading, setPriceLoading] = useState(false);
	const [priceMsg, setPriceMsg] = useState("");
	const [checkingAuth, setCheckingAuth] = useState(true);
	const router = useRouter();

	// Handle premium price change
	const handlePriceChange = async () => {
		if (!priceInput) {
			setPriceMsg("Please enter a price.");
			return;
		}
		const newPrice = parseInt(priceInput, 10);
		if (isNaN(newPrice) || newPrice <= 0) {
			setPriceMsg("Enter a valid price.");
			return;
		}
		setPriceLoading(true);
		setPriceMsg("");
		try {
			await set(dbRef(database, "AppConfig/PlusMembershipPrice"), newPrice);
			setPremiumPrice(newPrice);
			setPriceMsg("Price updated!");
			setPriceInput("");
		} catch (err) {
			setPriceMsg("Failed to update price.");
		}
		setPriceLoading(false);
	};

	useEffect(() => {
		// Fetch current premium price from AppConfig/PlusMembershipPrice
		const priceRef = dbRef(database, "AppConfig/PlusMembershipPrice");
		get(priceRef).then((snap) => {
			if (snap.exists()) {
				setPremiumPrice(snap.val());
			}
		});

		const unsubscribe = onAuthStateChanged(auth, async (user) => {
			if (user) {
				const userRef = dbRef(database, `Users/${user.uid}`);
				const snap = await get(userRef);
				if (snap.exists() && snap.val().role === "admin") {
					setCheckingAuth(false);
				} else {
					router.replace("/login");
				}
			} else {
				router.replace("/login");
			}
		});
		return () => unsubscribe();
	}, [router]);

	if (checkingAuth) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				Checking admin access...
			</div>
		);
	}

	return (
		<main className="min-h-screen bg-white px-6 py-10 font-poppins">
			<motion.h1
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.7 }}
				className="text-4xl font-bold text-center text-slate-900 mb-10"
			>
				Admin Dashboard
			</motion.h1>
			<div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto">
				{/* Sidebar */}
				<aside className="md:w-1/4 w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col gap-4 mb-8 md:mb-0">
					{adminSections.map((s) => (
						<button
							key={s.key}
							onClick={() => setSection(s.key)}
							className={`text-left px-4 py-3 rounded-xl font-semibold transition border ${
								section === s.key
									? "bg-slate-900 text-white border-slate-900 shadow-sm"
									: "bg-slate-50 text-slate-800 border-transparent hover:bg-slate-100"
							}`}
						>
							<div className="text-base">{s.label}</div>
							<div className={`text-xs mt-1 font-normal ${section === s.key ? 'text-slate-200' : 'text-slate-500'}`}>
								{s.desc}
							</div>
						</button>
					))}
				</aside>
				{/* Main Content */}
				<section className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-8 min-h-[400px]">
					{section === "users" && (
						<div>
							<h2 className="text-2xl font-bold mb-4 text-slate-900">
								User Management
							</h2>
							<p className="mb-4 text-slate-600 text-sm">
								View, search, filter, and manage all registered users here.
							</p>
							<UserTable />
						</div>
					)}
					{section === "premium" && (
						<div>
							<h2 className="text-2xl font-bold mb-4 text-slate-900">
								Premium/Plus Membership Management
							</h2>
							<p className="mb-4 text-slate-600 text-sm">
								View and manage premium/plus members and payments.
							</p>
							{/* Premium Price Management */}
							<div className="mb-8 p-4 bg-slate-50 border border-slate-250 rounded-xl flex flex-col md:flex-row items-center gap-4">
								<div className="font-semibold text-slate-800 text-sm">
									Current Premium Price:{" "}
									<span className="text-slate-900 font-bold">
										₹{premiumPrice !== null ? premiumPrice : "--"}
									</span>
								</div>
								<input
									type="number"
									className="border border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none rounded-xl px-3 py-2 w-32 bg-white text-sm transition"
									value={priceInput}
									onChange={(e) => setPriceInput(e.target.value)}
									disabled={priceLoading}
									placeholder="New Price"
								/>
								<button
									onClick={handlePriceChange}
									className="bg-slate-900 text-white px-4 py-2 rounded-xl font-semibold hover:bg-black transition disabled:opacity-50 text-sm shadow-sm"
									disabled={priceLoading}
								>
									{priceLoading ? "Saving..." : "Change Price"}
								</button>
								{priceMsg && (
									<span className="ml-4 text-emerald-600 font-semibold text-sm">
										{priceMsg}
									</span>
								)}
							</div>
							<PlusMemberTable />
						</div>
					)}
					{section === "collegeRequests" && (
						<div>
							<h2 className="text-2xl font-bold mb-4 text-slate-900">
								Best College List Requests
							</h2>
							<p className="mb-4 text-slate-600 text-sm">
								View, process, and export best college list requests.
							</p>
							<CollegeRequestTable />
						</div>
					)}
					{section === "notifications" && (
						<div>
							<h2 className="text-2xl font-bold mb-4 text-slate-900">
								Notifications & Announcements
							</h2>
							<p className="mb-4 text-slate-600 text-sm">
								Create and manage notifications and announcements.
							</p>
							<AnnouncementAdmin />
						</div>
					)}
					{section === "content" && (
						<div>
							<h2 className="text-2xl font-bold mb-4 text-slate-900">
								Content Management
							</h2>
							<p className="mb-4 text-slate-600 text-sm">
								Manage FAQs, banners, images, and client reviews.
							</p>
							<h2 className="text-xl font-bold mb-4 text-slate-800 border-t border-slate-200 pt-6">
								Add Banner Here
							</h2>
							<BannerAdmin />
							<h2 className="text-xl font-bold mb-4 text-slate-800 border-t border-slate-200 pt-6">
								Add Review Here
							</h2>
							<ClientReviewAdmin />
							<h2 className="text-xl font-bold mb-4 text-slate-800 border-t border-slate-200 pt-6">
								Add Feedback images Here
							</h2>
							<FeedbackImageAdmin />
						</div>
					)}
					{section === "mentorship" && (
						<div>
							<h2 className="text-2xl font-bold mb-4 text-slate-900">
								1:1 Mentorship Requests
							</h2>
							<p className="mb-4 text-slate-600 text-sm">
								View and manage 1:1 mentorship session requests.
							</p>
							<MentorshipRequestTable />
						</div>
					)}
					{section === "prebook" && (
						<div>
							<h2 className="text-2xl font-bold mb-4 text-slate-900">
								Prebooked Users
							</h2>
							<p className="mb-4 text-slate-600 text-sm">
								View and manage users who have prebooked sessions.
							</p>
							<PrebookAdmin />
						</div>
					)}
					{section === "successStories" && (
						<div>
							<h2 className="text-2xl font-bold mb-4 text-slate-900">
								Success Stories (Premium Page)
							</h2>
							<p className="mb-4 text-slate-600 text-sm">
								Dynamically add placed students with their LinkedIn URLs to display on the premium page marquee.
							</p>
							<SuccessStoryAdmin />
						</div>
					)}
				</section>
			</div>
		</main>
	);
}
