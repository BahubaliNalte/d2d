"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FaUniversity, FaBrain, FaBell, FaCrown, FaGift, FaMapMarkedAlt, FaArrowLeft, FaArrowRight, FaFileAlt, FaTh, FaGraduationCap, FaWhatsapp, FaTimes } from "react-icons/fa";

const counsellingServices = [
	{
		title: "Prepare a College List",
		href: "/counselling/colleges",
		icon: <FaUniversity />,
		description: (
			<>
				Explore engineering colleges with location, stream and cutoff filters with our <b>AI model</b>.
			</>
		),
		bgColor: "bg-slate-50 border border-slate-100",
		iconColor: "text-slate-900",
		borderColor: "border-slate-200",
		hoverBorder: "hover:border-slate-800",
	},
	{
		title: "Rankwise Prediction",
		href: "/counselling/predictor",
		icon: <FaBrain />,
		description: (
			<>
				Find which colleges you might get into based on your <b>Rank</b> using our <b>AI Model</b>.
			</>
		),
		bgColor: "bg-slate-50 border border-slate-100",
		iconColor: "text-slate-900",
		borderColor: "border-slate-200",
		hoverBorder: "hover:border-slate-800",
	},
	{
		title: "Required Documents",
		href: "/counselling/document",
		icon: <FaFileAlt />,
		description: (
			<>
				Get complete details about all documents required during the admission process.
			</>
		),
		bgColor: "bg-slate-50 border border-slate-100",
		iconColor: "text-slate-900",
		borderColor: "border-slate-200",
		hoverBorder: "hover:border-slate-800",
	},
	{
		title: "Seat Matrix & Cutoffs",
		href: "/counselling/seat-matrix",
		icon: <FaTh />,
		description: (
			<>
				Check branch-wise available DSE seats and state category-wise cutoffs.
			</>
		),
		bgColor: "bg-slate-50 border border-slate-100",
		iconColor: "text-slate-900",
		borderColor: "border-slate-200",
		hoverBorder: "hover:border-slate-800",
	},
	{
		title: "All Maharashtra Colleges",
		href: "/counselling/maharashtra-colleges",
		icon: <FaMapMarkedAlt />,
		description: (
			<>
				View a complete list of engineering colleges in <b>Maharashtra</b>.
			</>
		),
		bgColor: "bg-slate-50 border border-slate-100",
		iconColor: "text-slate-900",
		borderColor: "border-slate-200",
		hoverBorder: "hover:border-slate-800",
	},
	{
		title: "Scholarship Info",
		href: "/counselling/scholarships",
		icon: <FaGift />,
		description: (
			<>
				Explore available <b>scholarships</b> for diploma and engineering students.
			</>
		),
		bgColor: "bg-slate-50 border border-slate-100",
		iconColor: "text-slate-900",
		borderColor: "border-slate-200",
		hoverBorder: "hover:border-slate-800",
	},
	{
		title: "Best College List",
		href: "/counselling/best-college-list",
		icon: <FaGraduationCap />,
		description: (
			<>
				Request a <b>personalized list</b> of the best colleges curated by our experts for your profile.
			</>
		),
		bgColor: "bg-slate-50 border border-slate-100",
		iconColor: "text-slate-900",
		borderColor: "border-slate-200",
		hoverBorder: "hover:border-slate-800",
	},
	{
		title: "Admission Notifications",
		href: "/counselling/notifications",
		icon: <FaBell />,
		description: (
			<>
				Stay updated on admission <b>deadlines</b>, <b>CAP rounds</b>, and important dates.
			</>
		),
		bgColor: "bg-slate-50 border border-slate-100",
		iconColor: "text-slate-900",
		borderColor: "border-slate-200",
		hoverBorder: "hover:border-slate-800",
	},
];

export default function CounsellingHomePage() {
	const [showModal, setShowModal] = useState(false);

	useEffect(() => {
		// Wait 1.5 seconds before showing the modal
		const hasJoined = localStorage.getItem("d2d_whatsapp_joined");
		if (hasJoined !== "true") {
			const timer = setTimeout(() => {
				setShowModal(true);
			}, 1500);
			return () => clearTimeout(timer);
		}
	}, []);

	const handleJoinGroup = () => {
		localStorage.setItem("d2d_whatsapp_joined", "true");
		window.open("https://chat.whatsapp.com/LTcuLVPipunFPjodf2ifkl", "_blank");
		setShowModal(false);
	};

	const handleDismiss = () => {
		setShowModal(false);
	};

	return (
		<main className="min-h-screen bg-white relative" style={{ fontFamily: "'Inter', 'Poppins', sans-serif" }}>
			{/* Back Navigation */}
			<div className="p-4 sm:p-6">
				<Link
					href="/"
					className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-500 hover:text-black rounded-lg hover:bg-slate-100 transition-all duration-200"
					id="counselling-back"
				>
					<FaArrowLeft className="text-xs" /> Back to Home
				</Link>
			</div>

			<div className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
				{/* Header */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					className="text-center mb-8 sm:mb-14"
				>
					<span className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-50 rounded-full border border-slate-200 mb-6 text-xs sm:text-sm font-medium text-slate-800">
						🎓 Expert Guidance
					</span>
					<h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
						Counselling Services
					</h1>
					<p className="text-base sm:text-lg text-slate-500 mt-4 max-w-xl mx-auto">
						Choose a service below to get started on your diploma-to-degree journey.
					</p>
				</motion.div>

				{/* Service Cards */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
					{counsellingServices.map((service, index) => (
						<motion.div
							key={index}
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: index * 0.08 }}
							viewport={{ once: true }}
						>
							<Link
								href={service.href}
								className={`flex sm:block items-center sm:items-start gap-4 p-4 sm:p-6 rounded-2xl border-2 ${service.borderColor} ${service.hoverBorder} bg-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group`}
								id={`counselling-${service.title.toLowerCase().replace(/\s+/g, '-')}`}
							>
								<div className={`shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${service.bgColor} flex items-center justify-center sm:mb-4 ${service.iconColor} text-lg sm:text-xl transition-transform duration-300 group-hover:scale-110`}>
									{service.icon}
								</div>
								<div className="flex-1 min-w-0">
									<h3 className="text-sm sm:text-lg font-bold text-slate-800 mb-1 sm:mb-2 flex items-center justify-between">
										{service.title}
										<FaArrowRight className="text-xs sm:text-sm text-slate-300 group-hover:text-black transition-all duration-300 group-hover:translate-x-1 shrink-0 ml-2" />
									</h3>
									<p className="text-xs sm:text-sm text-slate-500 leading-relaxed">{service.description}</p>
								</div>
							</Link>
						</motion.div>
					))}
				</div>
			</div>

			{/* WhatsApp Auto-Join Pop-up Modal */}
			<AnimatePresence>
				{showModal && (
					<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
						{/* Backdrop */}
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							onClick={handleDismiss}
							className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
						/>

						{/* Modal Box */}
						<motion.div
							initial={{ opacity: 0, scale: 0.95, y: 20 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.95, y: 20 }}
							transition={{ type: "spring", duration: 0.5 }}
							className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 p-6 sm:p-8 text-center z-10"
						>
							{/* Close Button */}
							<button
								onClick={handleDismiss}
								className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition p-2 rounded-full hover:bg-slate-50"
							>
								<FaTimes className="text-base" />
							</button>

							{/* Icon */}
							<div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 mb-6 shadow-inner">
								<FaWhatsapp className="text-4xl" />
							</div>

							{/* Header */}
							<h3 className="text-xl sm:text-2xl font-extrabold text-slate-950 leading-snug mb-3">
								Join Maharashtra's #1 DSE Counselling Group!
							</h3>

							{/* Body Text */}
							<p className="text-sm text-slate-500 leading-relaxed mb-6">
								Get real-time admission updates, cutoff alerts, document lists, and connect with other direct second year (DSE) diploma students!
							</p>

							{/* Actions */}
							<div className="flex flex-col gap-3">
								<button
									onClick={handleJoinGroup}
									className="w-full flex items-center justify-center gap-2.5 px-6 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-2xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all active:scale-98"
								>
									<FaWhatsapp className="text-lg" />
									<span>Join WhatsApp Group</span>
								</button>
								<button
									onClick={() => {
										localStorage.setItem("d2d_whatsapp_joined", "true");
										setShowModal(false);
									}}
									className="text-xs text-slate-400 hover:text-slate-600 font-medium py-2 transition hover:underline"
								>
									Don't show this again
								</button>
							</div>
						</motion.div>
					</div>
				)}
			</AnimatePresence>
		</main>
	);
}
