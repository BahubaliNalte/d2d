"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FaUniversity, FaBrain, FaBell, FaCrown, FaGift, FaMapMarkedAlt, FaArrowLeft, FaArrowRight, FaFileAlt, FaTh, FaGraduationCap } from "react-icons/fa";

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
	return (
		<main className="min-h-screen bg-white" style={{ fontFamily: "'Inter', 'Poppins', sans-serif" }}>
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
					className="text-center mb-14"
				>
					<span className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-50 rounded-full border border-slate-200 mb-6 text-xs sm:text-sm font-medium text-slate-800">
						🎓 Expert Guidance
					</span>
					<h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
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
								className={`block p-6 rounded-2xl border-2 ${service.borderColor} ${service.hoverBorder} bg-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group`}
								id={`counselling-${service.title.toLowerCase().replace(/\s+/g, '-')}`}
							>
								<div className={`w-12 h-12 rounded-xl ${service.bgColor} flex items-center justify-center mb-4 ${service.iconColor} text-xl transition-transform duration-300 group-hover:scale-110`}>
									{service.icon}
								</div>
								<h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center justify-between">
									{service.title}
									<FaArrowRight className="text-sm text-slate-300 group-hover:text-black transition-all duration-300 group-hover:translate-x-1" />
								</h3>
								<p className="text-sm text-slate-500 leading-relaxed">{service.description}</p>
							</Link>
						</motion.div>
					))}
				</div>
			</div>
		</main>
	);
}
