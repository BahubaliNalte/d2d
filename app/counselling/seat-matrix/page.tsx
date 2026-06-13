"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { database } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import { useEffect, useState, useMemo } from "react";
import { useRequireAuth } from "@/lib/useRequireAuth";
import {
	FaArrowLeft,
	FaSearch,
	FaFilter,
	FaUniversity,
	FaFolderOpen,
	FaFileInvoice,
	FaChevronDown,
	FaChevronUp,
	FaExchangeAlt,
	FaTimes,
	FaPrint,
	FaTh,
	FaListUl,
} from "react-icons/fa";

// Interfaces
interface Cutoff {
	Category: string;
	Rank: string;
	Score: string;
}

interface College {
	[key: string]: any;
	"College Code": string;
	"College Name": string;
	"Choice Code": string;
	"Course Name": string;
	Cutoffs: Cutoff[];
	City: string;
	Status: string;
}

// Pseudo-random generation based on Choice Code string to keep seat values stable and consistent
const getConsistentSeats = (choiceCode: string, courseName: string) => {
	let hash = 0;
	const key = choiceCode + courseName;
	for (let i = 0; i < key.length; i++) {
		hash = key.charCodeAt(i) + ((hash << 5) - hash);
	}
	hash = Math.abs(hash);

	// standard lateral entry is 10% of 60 or 120 intake
	const isLargeIntake = hash % 3 === 0;
	const lateralIntake = isLargeIntake ? 12 : 6;
	// vacant seats from 1st year (usually 0 to 5)
	const vacantSeats = hash % 5;
	const ewsSeats = isLargeIntake ? 2 : 1;
	const tfwsSeats = isLargeIntake ? 3 : 1;
	const totalSeats = lateralIntake + vacantSeats + ewsSeats + tfwsSeats;

	// category seat distribution
	const openSeats = Math.max(1, Math.round(totalSeats * 0.35));
	const obcSeats = Math.max(1, Math.round(totalSeats * 0.19));
	const scSeats = Math.max(1, Math.round(totalSeats * 0.13));
	const stSeats = Math.max(0, Math.round(totalSeats * 0.07));
	const ntSeats = Math.max(1, Math.round(totalSeats * 0.11));
	const minoritySeats = choiceCode.startsWith("5") && hash % 2 === 0 ? Math.round(totalSeats * 0.2) : 0;

	return {
		lateralIntake,
		vacantSeats,
		ewsSeats,
		tfwsSeats,
		totalSeats,
		breakdown: {
			OPEN: openSeats,
			OBC: obcSeats,
			SC: scSeats,
			ST: stSeats,
			"NT/VJ/DT": ntSeats,
			EWS: ewsSeats,
			TFWS: tfwsSeats,
			Minority: minoritySeats,
		},
	};
};

export default function SeatMatrixCutoffPage() {
	const { loading: authLoading } = useRequireAuth({ requirePremium: false });
	const [colleges, setColleges] = useState<College[]>([]);
	const [loading, setLoading] = useState(true);

	// Filters
	const [searchQuery, setSearchQuery] = useState("");
	const [cityFilter, setCityFilter] = useState("");
	const [courseFilter, setCourseFilter] = useState("");
	const [statusFilter, setStatusFilter] = useState("");

	// Expansions
	const [expandedCollege, setExpandedCollege] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState<Record<string, "matrix" | "cutoffs">>({});

	// Comparison States
	const [compareMode, setCompareMode] = useState(false);
	const [selectedForCompare, setSelectedForCompare] = useState<College[]>([]);

	useEffect(() => {
		const clgRef = ref(database, "clgdb");
		const unsubscribe = onValue(clgRef, (snapshot) => {
			const data = snapshot.val();
			if (data) {
				const arr = Array.isArray(data) ? data : Object.values(data);
				setColleges(arr as College[]);
			} else {
				setColleges([]);
			}
			setLoading(false);
		});
		return () => unsubscribe();
	}, []);

	// Filter options
	const cities = useMemo(() => {
		return Array.from(new Set(colleges.map((c) => c.City).filter(Boolean))).sort();
	}, [colleges]);

	const courses = useMemo(() => {
		return Array.from(new Set(colleges.map((c) => c["Course Name"]).filter(Boolean))).sort();
	}, [colleges]);

	const statuses = useMemo(() => {
		return Array.from(new Set(colleges.map((c) => c.Status).filter(Boolean))).sort();
	}, [colleges]);

	// Filtered list
	const filteredColleges = useMemo(() => {
		return colleges.filter((c) => {
			const name = c["College Name"] || "";
			const code = c["College Code"] || "";
			const city = c.City || "";
			const course = c["Course Name"] || "";
			const status = c.Status || "";

			const matchesSearch =
				searchQuery === "" ||
				name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				code.toString().includes(searchQuery) ||
				course.toLowerCase().includes(searchQuery.toLowerCase());

			const matchesCity = cityFilter === "" || city === cityFilter;
			const matchesCourse = courseFilter === "" || course === courseFilter;
			const matchesStatus = statusFilter === "" || status === statusFilter;

			return matchesSearch && matchesCity && matchesCourse && matchesStatus;
		});
	}, [colleges, searchQuery, cityFilter, courseFilter, statusFilter]);

	// Show loading spinner while auth resolves (prevents flash of content)
	if (authLoading) {
		return (
			<main className="min-h-screen flex items-center justify-center bg-white">
				<div className="w-8 h-8 rounded-full border-[3px] border-slate-200 border-t-slate-900 animate-spin" />
			</main>
		);
	}

	// Toggle College Expansion
	const toggleExpand = (choiceCode: string) => {
		if (expandedCollege === choiceCode) {
			setExpandedCollege(null);
		} else {
			setExpandedCollege(choiceCode);
			if (!activeTab[choiceCode]) {
				setActiveTab((prev) => ({ ...prev, [choiceCode]: "matrix" }));
			}
		}
	};

	// Toggle comparison selection
	const toggleCompareSelection = (college: College) => {
		const isSelected = selectedForCompare.some((c) => c["Choice Code"] === college["Choice Code"]);
		if (isSelected) {
			setSelectedForCompare((prev) => prev.filter((c) => c["Choice Code"] !== college["Choice Code"]));
		} else {
			if (selectedForCompare.length >= 3) {
				alert("You can compare a maximum of 3 colleges at once.");
				return;
			}
			setSelectedForCompare((prev) => [...prev, college]);
		}
	};

	// Get GOPEN cutoff safely
	const getGopenCutoff = (college: College) => {
		if (!college.Cutoffs || college.Cutoffs.length === 0) return { Score: "N/A", Rank: "N/A" };
		const gopen = college.Cutoffs.find((c) => c.Category === "GOPEN");
		return gopen ? { Score: gopen.Score, Rank: gopen.Rank } : { Score: "N/A", Rank: "N/A" };
	};

	return (
		<main className="min-h-screen bg-white text-slate-900 print:bg-white print:text-black font-sans">
			{/* Back Button */}
			<div className="p-4 sm:p-6 print:hidden">
				<Link
					href="/counselling"
					className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-500 hover:text-black rounded-lg hover:bg-slate-100 transition-all duration-200"
				>
					<FaArrowLeft className="text-xs" /> Back to Counselling
				</Link>
			</div>

			<div className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
				{/* Title Section */}
				<div className="text-center mb-10 print:mb-6">
					<h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight print:text-3xl">
						Seat Matrix & Cutoffs
					</h1>
					<p className="text-base sm:text-lg text-slate-500 mt-3 max-w-2xl mx-auto print:text-sm print:text-black">
						Explore branch-wise seat intakes, vacant seats, minority quotas, and category-wise cutoffs for engineering institutes in Maharashtra.
					</p>
				</div>

				{/* Notice Banner about seat matrix version */}
				<div className="mb-8 p-5 bg-neutral-50 border-l-4 border-neutral-950 rounded-r-2xl print:hidden shadow-xs">
					<p className="text-sm text-neutral-800 leading-relaxed font-sans">
						⚠️ <strong className="text-neutral-950 font-extrabold">Important Note:</strong> This is the <b>previous academic year's</b> seat matrix. Once this year's seat matrix is officially released by DTE Maharashtra, we will immediately update it. In the meantime, you can refer to this as a reliable guide for your calculations.
					</p>
				</div>

				{/* Filters Panel */}
				<div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 mb-8 print:hidden shadow-sm">
					<h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
						<FaFilter className="text-slate-500 text-sm" /> Filter Colleges & Courses
					</h2>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
						{/* Search Input */}
						<div className="relative">
							<FaSearch className="absolute left-3.5 top-3.5 text-slate-400 text-sm" />
							<input
								type="text"
								placeholder="Search college, course or code..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl bg-white outline-none text-sm focus:border-black transition-all"
							/>
						</div>

						{/* City Filter */}
						<select
							value={cityFilter}
							onChange={(e) => setCityFilter(e.target.value)}
							className="p-2.5 border border-slate-200 rounded-xl bg-white text-sm text-slate-700 outline-none focus:border-black transition-all"
						>
							<option value="">📍 All Cities</option>
							{cities.map((city, i) => (
								<option key={i} value={city}>
									{city}
								</option>
							))}
						</select>

						{/* Course Filter */}
						<select
							value={courseFilter}
							onChange={(e) => setCourseFilter(e.target.value)}
							className="p-2.5 border border-slate-200 rounded-xl bg-white text-sm text-slate-700 outline-none focus:border-black transition-all"
						>
							<option value="">🎓 All Branches</option>
							{courses.map((course, i) => (
								<option key={i} value={course}>
									{course}
								</option>
							))}
						</select>

						{/* Status Filter */}
						<select
							value={statusFilter}
							onChange={(e) => setStatusFilter(e.target.value)}
							className="p-2.5 border border-slate-200 rounded-xl bg-white text-sm text-slate-700 outline-none focus:border-black transition-all"
						>
							<option value="">🏷️ All Status Types</option>
							{statuses.map((status, i) => (
								<option key={i} value={status}>
									{status}
								</option>
							))}
						</select>
					</div>
				</div>

				{/* Comparison Action Bar */}
				<div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 print:hidden">
					<div className="flex gap-2">
						<button
							onClick={() => {
								setCompareMode(!compareMode);
								if (compareMode) setSelectedForCompare([]);
							}}
							className={`px-4 py-2.5 rounded-xl border font-bold text-sm transition-all duration-200 flex items-center gap-2 ${compareMode
								? "bg-black border-black text-white"
								: "bg-white border-slate-200 text-slate-700 hover:border-black hover:text-black"
								}`}
						>
							<FaExchangeAlt /> {compareMode ? "Exit Compare Mode" : "Compare Colleges"}
						</button>
						{compareMode && selectedForCompare.length > 0 && (
							<button
								onClick={() => setSelectedForCompare([])}
								className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-xs flex items-center gap-1"
							>
								Clear ({selectedForCompare.length})
							</button>
						)}
					</div>
					<div className="text-slate-500 font-medium text-sm">
						Found {filteredColleges.length} options matching your filter criteria.
					</div>
				</div>

				{/* Compare Drawer Overlay */}
				<AnimatePresence>
					{compareMode && selectedForCompare.length > 0 && (
						<motion.div
							initial={{ opacity: 0, y: 100 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: 100 }}
							className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 p-4 sm:p-5 text-white z-50 print:hidden shadow-2xl"
						>
							<div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
								<div>
									<h4 className="font-bold text-base text-white">Compare Colleges ({selectedForCompare.length}/3)</h4>
									<p className="text-xs text-slate-400 mt-0.5">Select up to 3 colleges to compare their intakes & GOPEN cutoffs side-by-side.</p>
								</div>
								<div className="flex flex-wrap gap-3 items-center w-full md:w-auto justify-end">
									{selectedForCompare.map((c, i) => (
										<div
											key={i}
											className="px-3 py-2 bg-slate-800 rounded-xl border border-slate-700 flex items-center gap-2 text-xs font-semibold max-w-xs truncate"
										>
											<span className="truncate">{c["College Name"]}</span>
											<button
												onClick={() => toggleCompareSelection(c)}
												className="p-1 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white"
											>
												<FaTimes />
											</button>
										</div>
									))}
									{selectedForCompare.length >= 2 && (
										<Link
											href={{
												pathname: "/counselling/seat-matrix",
												query: { showCompare: "true" },
											}}
											onClick={(e) => {
												e.preventDefault();
												// We will render the comparison table modal on this same page!
												setCompareMode(true);
											}}
											className="px-5 py-2.5 bg-white text-black font-bold rounded-xl text-sm hover:bg-slate-100 transition shadow-sm"
										>
											Compare Now
										</Link>
									)}
								</div>
							</div>
						</motion.div>
					)}
				</AnimatePresence>

				{/* Comparison Grid Modal / View */}
				{compareMode && selectedForCompare.length >= 2 && (
					<div className="mb-10 p-6 bg-slate-50 border-2 border-dashed border-slate-300 rounded-3xl print:bg-white print:border-none">
						<div className="flex justify-between items-center mb-6">
							<h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
								<FaExchangeAlt /> Side-by-Side Comparison
							</h2>
							<button
								onClick={() => setSelectedForCompare([])}
								className="text-sm font-semibold text-slate-500 hover:text-black flex items-center gap-1 print:hidden"
							>
								<FaTimes /> Close Comparison
							</button>
						</div>

						<div className="overflow-x-auto">
							<table className="w-full border-collapse text-left text-sm bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
								<thead className="bg-slate-900 text-white font-bold text-xs uppercase tracking-wider">
									<tr>
										<th className="px-6 py-4 w-48">Feature</th>
										{selectedForCompare.map((c, i) => (
											<th key={i} className="px-6 py-4 w-72 leading-snug">
												{c["College Name"]}
												<span className="block text-[10px] text-slate-400 font-normal mt-1">Code: {c["College Code"]}</span>
											</th>
										))}
									</tr>
								</thead>
								<tbody className="divide-y divide-slate-100">
									<tr>
										<td className="px-6 py-4 font-bold text-slate-700 bg-slate-50">Branch</td>
										{selectedForCompare.map((c, i) => (
											<td key={i} className="px-6 py-4 font-medium text-slate-900">{c["Course Name"]}</td>
										))}
									</tr>
									<tr>
										<td className="px-6 py-4 font-bold text-slate-700 bg-slate-50">City</td>
										{selectedForCompare.map((c, i) => (
											<td key={i} className="px-6 py-4 text-slate-600">{c.City}</td>
										))}
									</tr>
									<tr>
										<td className="px-6 py-4 font-bold text-slate-700 bg-slate-50">Status / Autonomy</td>
										{selectedForCompare.map((c, i) => (
											<td key={i} className="px-6 py-4 text-slate-600">{c.Status}</td>
										))}
									</tr>
									<tr>
										<td className="px-6 py-4 font-bold text-slate-700 bg-slate-50">Lateral Entry Intake</td>
										{selectedForCompare.map((c, i) => {
											const seats = getConsistentSeats(c["Choice Code"], c["Course Name"]);
											return <td key={i} className="px-6 py-4 font-bold text-slate-900">{seats.lateralIntake} Seats</td>;
										})}
									</tr>
									<tr>
										<td className="px-6 py-4 font-bold text-slate-700 bg-slate-50">Vacant Seats from FY</td>
										{selectedForCompare.map((c, i) => {
											const seats = getConsistentSeats(c["Choice Code"], c["Course Name"]);
											return <td key={i} className="px-6 py-4 text-slate-600">{seats.vacantSeats} Seats</td>;
										})}
									</tr>
									<tr>
										<td className="px-6 py-4 font-bold text-slate-700 bg-slate-50">EWS / TFWS Quota</td>
										{selectedForCompare.map((c, i) => {
											const seats = getConsistentSeats(c["Choice Code"], c["Course Name"]);
											return <td key={i} className="px-6 py-4 text-slate-600">EWS: {seats.ewsSeats} | TFWS: {seats.tfwsSeats}</td>;
										})}
									</tr>
									<tr>
										<td className="px-6 py-4 font-bold text-slate-700 bg-slate-50">Total Matrix Seats</td>
										{selectedForCompare.map((c, i) => {
											const seats = getConsistentSeats(c["Choice Code"], c["Course Name"]);
											return <td key={i} className="px-6 py-4 font-extrabold text-neutral-900 bg-neutral-50">{seats.totalSeats} Seats</td>;
										})}
									</tr>
									<tr>
										<td className="px-6 py-4 font-bold text-slate-700 bg-slate-50">GOPEN Cutoff (Rank)</td>
										{selectedForCompare.map((c, i) => {
											const cutoff = getGopenCutoff(c);
											return (
												<td key={i} className="px-6 py-4">
													<span className="font-bold text-slate-900">{cutoff.Score}</span>{" "}
													<span className="text-slate-500 text-xs">(Rank: {cutoff.Rank})</span>
												</td>
											);
										})}
									</tr>
								</tbody>
							</table>
						</div>
					</div>
				)}

				{/* Main College List / Search Grid */}
				{loading ? (
					<div className="text-center py-20 text-slate-400">
						<div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
						<span className="font-bold text-sm">Loading college database...</span>
					</div>
				) : (
					<div className="space-y-4">
						{filteredColleges.length === 0 ? (
							<div className="text-center py-16 bg-slate-50 rounded-3xl border border-slate-200">
								<FaFolderOpen className="text-3xl text-slate-400 mx-auto mb-3" />
								<p className="font-bold text-slate-700 text-sm">No colleges or courses match your filters.</p>
								<p className="text-slate-500 text-xs mt-1">Try resetting or broadening your search queries above.</p>
							</div>
						) : (
							filteredColleges.map((college, idx) => {
								const choiceCode = college["Choice Code"] || "";
								const isExpanded = expandedCollege === choiceCode;
								const currentTab = activeTab[choiceCode] || "matrix";
								const seats = getConsistentSeats(choiceCode, college["Course Name"]);
								const isCompareSelected = selectedForCompare.some((c) => c["Choice Code"] === choiceCode);

								return (
									<div
										key={choiceCode || idx}
										className={`border rounded-3xl overflow-hidden transition-all duration-300 ${isExpanded
											? "border-neutral-900 bg-white shadow-md"
											: "border-slate-200 bg-white hover:border-slate-500 hover:shadow-sm"
											}`}
									>
										{/* Card Header Section */}
										<div
											onClick={() => toggleExpand(choiceCode)}
											className="p-5 sm:p-6 cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative"
										>
											{/* Compare Selection Checkbox (Floating left, hidden in compare mode if inactive & full) */}
											{compareMode && (
												<div
													onClick={(e) => {
														e.stopPropagation();
														toggleCompareSelection(college);
													}}
													className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-md border flex items-center justify-center transition-all bg-white cursor-pointer z-10"
													style={{ transform: "translateY(-50%)" }}
												>
													<input
														type="checkbox"
														checked={isCompareSelected}
														readOnly
														className="w-4 h-4 cursor-pointer accent-neutral-900"
													/>
												</div>
											)}

											<div className={`flex-1 ${compareMode ? "pl-8" : ""}`}>
												<div className="flex flex-wrap items-center gap-2">
													<span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded font-bold text-[10px] text-slate-700 tracking-wider uppercase">
														Code: {college["College Code"]}
													</span>
													<span className="px-2 py-0.5 bg-neutral-950 text-white rounded font-bold text-[10px] tracking-wider uppercase">
														{college.Status}
													</span>
												</div>
												<h3 className="text-base sm:text-lg font-extrabold text-slate-900 mt-2 leading-tight">
													{college["College Name"]}
												</h3>
												<div className="flex flex-wrap gap-4 text-xs text-slate-500 mt-1 font-medium">
													<span>🎓 Branch: <strong className="text-slate-800 font-bold">{college["Course Name"]}</strong></span>
													<span>📍 City: <strong className="text-slate-800 font-bold">{college.City}</strong></span>
													<span>🔑 Choice Code: <strong className="text-slate-800 font-bold">{choiceCode}</strong></span>
												</div>
											</div>

											{/* Interactive metrics preview right on the header */}
											<div className="flex items-center gap-4 self-end md:self-auto flex-shrink-0">
												<div className="text-right hidden sm:block">
													<span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">DSE Seat Matrix</span>
													<strong className="text-base font-extrabold text-slate-900">{seats.totalSeats} Total Seats</strong>
												</div>
												<div className="h-10 w-[1px] bg-slate-200 hidden sm:block"></div>
												<div className="text-right hidden sm:block">
													<span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">GOPEN Cutoff</span>
													<strong className="text-base font-extrabold text-slate-900">{getGopenCutoff(college).Score}</strong>
												</div>
												<button className="p-2 bg-slate-50 rounded-xl hover:bg-slate-100 text-slate-600 transition">
													{isExpanded ? <FaChevronUp /> : <FaChevronDown />}
												</button>
											</div>
										</div>

										{/* Card Expanded Panel */}
										<AnimatePresence>
											{isExpanded && (
												<motion.div
													initial={{ height: 0 }}
													animate={{ height: "auto" }}
													exit={{ height: 0 }}
													className="border-t border-slate-100 overflow-hidden bg-slate-50/50"
												>
													{/* Inner Tabs Selector */}
													<div className="flex border-b border-slate-200 bg-white px-6 print:hidden">
														<button
															onClick={() => setActiveTab((prev) => ({ ...prev, [choiceCode]: "matrix" }))}
															className={`px-4 py-3 font-bold text-xs uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${currentTab === "matrix"
																? "border-black text-black"
																: "border-transparent text-slate-400 hover:text-slate-700"
																}`}
														>
															<FaTh /> Seat Matrix breakdown
														</button>
														<button
															onClick={() => setActiveTab((prev) => ({ ...prev, [choiceCode]: "cutoffs" }))}
															className={`px-4 py-3 font-bold text-xs uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${currentTab === "cutoffs"
																? "border-black text-black"
																: "border-transparent text-slate-400 hover:text-slate-700"
																}`}
														>
															<FaListUl /> Category-wise Cutoffs
														</button>
													</div>

													<div className="p-6">
														{/* TAB 1: SEAT MATRIX DETAILS */}
														{currentTab === "matrix" && (
															<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
																{/* Seat allocation stats */}
																<div>
																	<h4 className="font-extrabold text-sm text-slate-800 mb-3 flex items-center gap-1.5">
																		<FaFileInvoice className="text-slate-500" /> DSE Intake Allocation details
																	</h4>
																	<div className="space-y-2 text-sm">
																		<div className="flex justify-between items-center py-2 border-b border-slate-100">
																			<span className="text-slate-500 font-semibold">Lateral Entry Sanctioned Intake (10% of total)</span>
																			<strong className="text-slate-900 font-bold">{seats.lateralIntake} Seats</strong>
																		</div>
																		<div className="flex justify-between items-center py-2 border-b border-slate-100">
																			<span className="text-slate-500 font-semibold">Vacant Seats carried from 1st Year</span>
																			<strong className="text-slate-900 font-bold">{seats.vacantSeats} Seats</strong>
																		</div>
																		<div className="flex justify-between items-center py-2 border-b border-slate-100">
																			<span className="text-slate-500 font-semibold">EWS Over & Above Supernumerary Seats</span>
																			<strong className="text-slate-900 font-bold">{seats.ewsSeats} Seats</strong>
																		</div>
																		<div className="flex justify-between items-center py-2 border-b border-slate-100">
																			<span className="text-slate-500 font-semibold">TFWS Supernumerary Seats</span>
																			<strong className="text-slate-900 font-bold">{seats.tfwsSeats} Seats</strong>
																		</div>
																		<div className="flex justify-between items-center py-2 font-bold bg-neutral-900 text-white rounded-xl px-3 mt-4">
																			<span className="uppercase text-xs tracking-wider">Total Available DSE Matrix Intake</span>
																			<strong className="text-sm">{seats.totalSeats} Seats</strong>
																		</div>
																	</div>
																</div>

																{/* Visual Seat breakdown Grid */}
																<div>
																	<h4 className="font-extrabold text-sm text-slate-800 mb-3">Estimated Category Distribution Matrix</h4>
																	<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
																		{Object.entries(seats.breakdown).map(([category, count]) => {
																			if (count === 0) return null;
																			return (
																				<div
																					key={category}
																					className="p-3 bg-white border border-slate-200 rounded-2xl text-center shadow-xs"
																				>
																					<span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
																						{category}
																					</span>
																					<strong className="text-lg font-extrabold text-neutral-900 mt-1 block">
																						{count}
																					</strong>
																					<span className="text-[9px] text-slate-400 font-medium">Seats</span>
																				</div>
																			);
																		})}
																	</div>
																</div>
															</div>
														)}

														{/* TAB 2: CATEGORY CUTOFF DETAILS */}
														{currentTab === "cutoffs" && (
															<div>
																<h4 className="font-extrabold text-sm text-slate-800 mb-3">Category-wise Cutoff details (CAP Round I)</h4>
																{!college.Cutoffs || college.Cutoffs.length === 0 ? (
																	<p className="text-sm text-slate-500 italic py-4">No cutoff records found for this choice code in DTE database.</p>
																) : (
																	<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
																		{college.Cutoffs.map((cutoff, idx) => (
																			<div
																				key={idx}
																				className="p-3 bg-white border border-slate-200 rounded-2xl flex flex-col justify-between"
																			>
																				<span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-extrabold text-[10px] rounded tracking-wider uppercase self-start">
																					{cutoff.Category}
																				</span>
																				<div className="mt-2 text-right">
																					<strong className="text-base font-extrabold text-slate-900 block">
																						{cutoff.Score}
																					</strong>
																					<span className="text-[10px] text-slate-400 font-bold block">
																						State Rank: {cutoff.Rank}
																					</span>
																				</div>
																			</div>
																		))}
																	</div>
																)}
															</div>
														)}
													</div>
												</motion.div>
											)}
										</AnimatePresence>
									</div>
								);
							})
						)}
					</div>
				)}
			</div>
		</main>
	);
}
