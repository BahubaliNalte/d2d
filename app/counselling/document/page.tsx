"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
	FaArrowLeft,
	FaCheck,
	FaExclamationTriangle,
	FaFileAlt,
	FaPrint,
	FaSearch,
	FaFilter,
	FaRedo,
	FaInfoCircle,
	FaFolderOpen,
	FaClipboardCheck,
} from "react-icons/fa";
import { useEffect, useState, useMemo } from "react";
import { useRequireAuth } from "@/lib/useRequireAuth";

// Types
interface DocumentItem {
	id: string;
	name: string;
	category: "mandatory" | "category-specific" | "case-specific";
	applicableCaste: string[];
	description: string;
	remark?: string;
}

// Full document dataset
const DOCUMENT_DATABASE: DocumentItem[] = [
	{
		id: "cap-allotment",
		name: "CAP Seat Allotment Letter",
		category: "case-specific",
		applicableCaste: ["all"],
		description: "Allotment letter issued by the Directorate of Technical Education (DTE), Maharashtra.",
		remark: "Required for candidates taking admission through CAP rounds only.",
	},
	{
		id: "ssc-marksheet",
		name: "Marksheet of SSC (Std. X) Examination",
		category: "mandatory",
		applicableCaste: ["all"],
		description: "Official board marksheet of 10th standard exam.",
		remark: "Must show date of birth and passing status.",
	},
	{
		id: "hsc-diploma-marksheet",
		name: "Marksheet of HSC / Qualifying Exam",
		category: "mandatory",
		applicableCaste: ["all"],
		description: "Marksheet of Std. XII (HSC) / Passed three years D.Voc. Stream in same/allied sector (if applicable).",
		remark: "Only required if student completed 12th Std. or D.Voc.",
	},
	{
		id: "diploma-marksheet",
		name: "Diploma Marksheet (All Semesters)",
		category: "mandatory",
		applicableCaste: ["all"],
		description: "Semester-wise or year-wise marksheets for all years of the Diploma in Engineering.",
		remark: "Ensure you have all physical copies of every semester marksheet (Sem 1 to Sem 6).",
	},
	{
		id: "provisional-cert",
		name: "Diploma Provisional Passing Certificate",
		category: "mandatory",
		applicableCaste: ["all"],
		description: "Provisional passing certificate issued by MSBTE or autonomous institute after diploma completion.",
		remark: "Obtained from your diploma college after results are declared.",
	},
	{
		id: "leaving-cert",
		name: "College Leaving Certificate (LC / TC)",
		category: "mandatory",
		applicableCaste: ["all"],
		description: "Leaving Certificate / Transfer Certificate from the last attended diploma college.",
		remark: "Must mention nationality, mother tongue, and place of birth.",
	},
	{
		id: "migration-cert",
		name: "Migration Certificate",
		category: "case-specific",
		applicableCaste: ["all"],
		description: "Migration certificate issued by the parent Board/University.",
		remark: "Mandatory only if you completed your diploma from a board other than MSBTE (e.g., other state boards, or autonomous universities outside Maharashtra).",
	},
	{
		id: "domicile-cert",
		name: "Domicile Certificate of Candidate",
		category: "mandatory",
		applicableCaste: ["all"],
		description: "Certificate indicating domicile of Maharashtra state.",
		remark: "Alternatively, birth certificate or school/college leaving certificate indicating birthplace in Maharashtra is acceptable.",
	},
	{
		id: "caste-cert",
		name: "Caste Certificate",
		category: "category-specific",
		applicableCaste: ["SC", "ST", "VJ/DT", "NT-A", "NT-B", "NT-C", "NT-D", "OBC", "SBC"],
		description: "Caste certificate issued by competent authority in Maharashtra State.",
		remark: "Mandatory for all backward class category candidates claiming seat/fee concessions.",
	},
	{
		id: "caste-validity",
		name: "Caste Validity Certificate",
		category: "category-specific",
		applicableCaste: ["SC", "ST", "VJ/DT", "NT-A", "NT-B", "NT-C", "NT-D", "OBC", "SBC"],
		description: "Certificate validating the authenticity of the caste certificate, issued by Scrutiny Committee.",
		remark: "Extremely critical. Admission will convert to General category if validity is not submitted at the time of reporting.",
	},
	{
		id: "ncl-cert",
		name: "Non-Creamy Layer (NCL) Certificate",
		category: "category-specific",
		applicableCaste: ["VJ/DT", "NT-A", "NT-B", "NT-C", "NT-D", "OBC", "SBC"],
		description: "Non-Creamy Layer Certificate stating that family income is within limits.",
		remark: "CRITICAL: This certificate must be valid up to 31st March 2027.",
	},
	{
		id: "ews-cert",
		name: "EWS Eligibility Certificate",
		category: "category-specific",
		applicableCaste: ["EWS"],
		description: "Eligibility Certificate for Economically Weaker Section (EWS) issued by competent authority.",
		remark: "Must be valid for the current financial year under Maharashtra state criteria.",
	},
	{
		id: "gap-cert",
		name: "Gap Certificate",
		category: "case-specific",
		applicableCaste: ["all"],
		description: "Gap Certificate on stamp paper of Rs. 20/- duly notarized.",
		remark: "Required only for candidates who passed their Diploma in March 2025 or before and presently are not studying in any course/institution.",
	},
	{
		id: "minority-affidavit",
		name: "Affidavit for Minority Status",
		category: "case-specific",
		applicableCaste: ["Minority"],
		description: "Affidavit for Minority status on a Rs. 100/- non-judicial stamp paper.",
		remark: "Required if your leaving certificate does not explicitly mention your minority status (linguistic or religious).",
	},
	{
		id: "pwd-cert",
		name: "Disability (PWD) Certificate",
		category: "case-specific",
		applicableCaste: ["all"],
		description: "Certificate issued by the competent medical authority / Civil Surgeon.",
		remark: "Required only for candidates seeking admission under the Physically Handicapped quota (minimum 40% disability).",
	},
];

export default function DocumentRequiredPage() {
	const { loading: authLoading } = useRequireAuth({ requirePremium: false });
	
	// User Selections
	const [caste, setCaste] = useState<string>("Open");

	const [isCapStudent, setIsCapStudent] = useState<boolean>(true);
	const [hasGap, setHasGap] = useState<boolean>(false);
	const [isMinority, setIsMinority] = useState<boolean>(false);
	const [isPwd, setIsPwd] = useState<boolean>(false);
	const [isOtherBoard, setIsOtherBoard] = useState<boolean>(false);
	
	// Search and checklist state
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({});

	useEffect(() => {
		// Load checklist status from localStorage if available
		try {
			const saved = localStorage.getItem("d2d-document-checklist");
			if (saved) {
				setCheckedDocs(JSON.parse(saved));
			}
		} catch (e) {
			console.error("Could not load checklist from localStorage", e);
		}
	}, []);

	// Save checklist state when modified
	const toggleDocumentCheck = (id: string) => {
		const updated = { ...checkedDocs, [id]: !checkedDocs[id] };
		setCheckedDocs(updated);
		try {
			localStorage.setItem("d2d-document-checklist", JSON.stringify(updated));
		} catch (e) {
			console.error("Could not save checklist to localStorage", e);
		}
	};

	const resetChecklist = () => {
		setCheckedDocs({});
		try {
			localStorage.removeItem("d2d-document-checklist");
		} catch (e) {}
	};

	// Determine dynamic document requirements
	const filteredDocuments = useMemo(() => {
		return DOCUMENT_DATABASE.filter((doc) => {
			// Search filter
			if (
				searchQuery &&
				!doc.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
				!doc.description.toLowerCase().includes(searchQuery.toLowerCase())
			) {
				return false;
			}

			// CAP allotment filter
			if (doc.id === "cap-allotment" && !isCapStudent) return false;

			// Gap certificate filter
			if (doc.id === "gap-cert" && !hasGap) return false;

			// Minority filter
			if (doc.id === "minority-affidavit" && !isMinority) return false;

			// PWD filter
			if (doc.id === "pwd-cert" && !isPwd) return false;

			// Migration certificate filter
			if (doc.id === "migration-cert" && !isOtherBoard) return false;

			// Caste filtering
			if (doc.category === "category-specific") {
				return doc.applicableCaste.includes(caste);
			}

			return true;
		});
	}, [caste, isCapStudent, hasGap, isMinority, isPwd, isOtherBoard, searchQuery]);

	// Show loading spinner while auth resolves (prevents flash of content)
	if (authLoading) {
		return (
			<main className="min-h-screen flex items-center justify-center bg-white">
				<div className="w-8 h-8 rounded-full border-[3px] border-slate-200 border-t-slate-900 animate-spin" />
			</main>
		);
	}

	// Print Action
	const handlePrint = () => {
		window.print();
	};

	// Document category color tags
	const getCategoryBadge = (category: string) => {
		switch (category) {
			case "mandatory":
				return (
					<span className="px-2 py-0.5 text-xs font-semibold text-neutral-900 bg-neutral-100 border border-neutral-300 rounded">
						Mandatory for All
					</span>
				);
			case "category-specific":
				return (
					<span className="px-2 py-0.5 text-xs font-semibold text-neutral-800 bg-neutral-50 border border-neutral-200 rounded">
						Category Specific
					</span>
				);
			case "case-specific":
				return (
					<span className="px-2 py-0.5 text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-200 rounded">
						Case Specific
					</span>
				);
			default:
				return null;
		}
	};

	return (
		<main className="min-h-screen bg-white text-slate-900 print:bg-white print:text-black" style={{ fontFamily: "'Inter', sans-serif" }}>
			{/* Header Navigation */}
			<div className="p-4 sm:p-6 print:hidden">
				<Link
					href="/counselling"
					className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-500 hover:text-black rounded-lg hover:bg-slate-100 transition-all duration-200"
					id="documents-back"
				>
					<FaArrowLeft className="text-xs" /> Back to Counselling
				</Link>
			</div>

			<div className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
				{/* Header */}
				<div className="text-center mb-10 print:mb-6">
					<span className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-50 rounded-full border border-slate-200 mb-4 text-xs font-medium text-slate-800 print:hidden">
						📄 Admission Verification Checklist
					</span>
					<h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight print:text-3xl">
						Required Documents
					</h1>
					<p className="text-base sm:text-lg text-slate-500 mt-3 max-w-2xl mx-auto print:text-sm print:text-black">
						Personalize your caste and eligibility choices below to instantly generate the exact document checklist you need for your Direct Second Year (DSE) Admission.
					</p>
				</div>

				{/* Selection panel / Interactive Filters */}
				<div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 mb-8 print:hidden shadow-sm">
					<h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
						<FaFilter className="text-sm text-slate-500" />
						Configure Your Admission Details
					</h2>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{/* Caste Category */}
						<div className="flex flex-col gap-2">
							<label className="text-xs font-bold uppercase tracking-wider text-slate-500">Caste / Category</label>
							<select
								value={caste}
								onChange={(e) => setCaste(e.target.value)}
								className="w-full p-3 border border-slate-200 rounded-xl bg-white font-medium text-slate-800 outline-none focus:border-black transition-all"
								id="document-caste-select"
							>
								<option value="Open">Open / General</option>
								<option value="EWS">EWS (Economically Weaker Section)</option>
								<option value="SC">SC (Scheduled Caste)</option>
								<option value="ST">ST (Scheduled Tribe)</option>
								<option value="OBC">OBC (Other Backward Class)</option>
								<option value="SBC">SBC (Special Backward Class)</option>
								<option value="VJ/DT">VJ / DT (Vimukta Jati / De-Notified Tribes)</option>
								<option value="NT-A">NT-A (Nomadic Tribe A)</option>
								<option value="NT-B">NT-B (Nomadic Tribe B)</option>
								<option value="NT-C">NT-C (Nomadic Tribe C)</option>
								<option value="NT-D">NT-D (Nomadic Tribe D)</option>
							</select>
						</div>

						{/* Academic & Gap Details */}
						<div className="flex flex-col gap-3 justify-center">
							<div className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-all cursor-pointer">
								<span className="text-sm font-semibold text-slate-700">Do you have a study gap?</span>
								<input
									type="checkbox"
									checked={hasGap}
									onChange={(e) => setHasGap(e.target.checked)}
									className="w-5 h-5 rounded border-slate-300 accent-neutral-900 cursor-pointer"
								/>
							</div>

							<div className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-all cursor-pointer">
								<span className="text-sm font-semibold text-slate-700 font-sans">Diploma passed from board other than MSBTE?</span>
								<input
									type="checkbox"
									checked={isOtherBoard}
									onChange={(e) => setIsOtherBoard(e.target.checked)}
									className="w-5 h-5 rounded border-slate-300 accent-neutral-900 cursor-pointer"
								/>
							</div>
						</div>

						{/* Other Statuses */}
						<div className="grid grid-cols-2 gap-3">
							<button
								onClick={() => setIsCapStudent(!isCapStudent)}
								className={`p-3 rounded-xl border flex flex-col justify-between items-start transition-all duration-200 text-left ${
									isCapStudent
										? "bg-slate-900 border-slate-950 text-white shadow-md shadow-slate-900/10"
										: "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
								}`}
							>
								<span className="text-xs font-bold uppercase tracking-wider opacity-60">Admission Type</span>
								<span className="text-sm font-bold mt-2">CAP Round</span>
							</button>

							<button
								onClick={() => setIsMinority(!isMinority)}
								className={`p-3 rounded-xl border flex flex-col justify-between items-start transition-all duration-200 text-left ${
									isMinority
										? "bg-slate-900 border-slate-950 text-white shadow-md shadow-slate-900/10"
										: "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
								}`}
							>
								<span className="text-xs font-bold uppercase tracking-wider opacity-60">Minority Student</span>
								<span className="text-sm font-bold mt-2">{isMinority ? "Yes" : "No"}</span>
							</button>

							<button
								onClick={() => setIsPwd(!isPwd)}
								className={`p-3 rounded-xl border flex flex-col justify-between items-start transition-all duration-200 text-left col-span-2 ${
									isPwd
										? "bg-slate-900 border-slate-950 text-white shadow-md shadow-slate-900/10"
										: "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
								}`}
							>
								<span className="text-xs font-bold uppercase tracking-wider opacity-60">Physically Challenged (PWD) Status</span>
								<span className="text-sm font-bold mt-1">Yes, seeking PWD quota benefit</span>
							</button>
						</div>
					</div>
				</div>

				{/* Search & Actions Bar */}
				<div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6 print:hidden">
					<div className="relative w-full sm:w-80">
						<FaSearch className="absolute left-4 top-3.5 text-slate-400 text-sm" />
						<input
							type="text"
							placeholder="Search documents..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl bg-white outline-none focus:border-black transition-all"
						/>
					</div>

					<div className="flex gap-2.5 w-full sm:w-auto">
						<button
							onClick={resetChecklist}
							className="flex-1 sm:flex-initial px-4 py-3 bg-white border border-slate-200 text-slate-700 hover:text-black font-semibold rounded-xl transition duration-200 flex items-center justify-center gap-2"
						>
							<FaRedo className="text-xs" /> Reset Checklist
						</button>

						<button
							onClick={handlePrint}
							className="flex-1 sm:flex-initial px-5 py-3 bg-black hover:bg-slate-800 text-white font-semibold rounded-xl transition duration-200 flex items-center justify-center gap-2 shadow-md shadow-slate-900/10"
						>
							<FaPrint className="text-xs" /> Print Checklist
						</button>
					</div>
				</div>

				{/* Custom criteria banner showing what selection produced the table */}
				<div className="p-4 bg-slate-100 border border-slate-200 rounded-2xl mb-6 text-sm text-slate-700 flex flex-wrap gap-2.5 items-center justify-between">
					<div className="flex items-center gap-2 flex-wrap">
						<span className="font-semibold text-slate-900">Current Checklist configuration:</span>
						<span className="px-2 py-0.5 bg-white border border-slate-300 rounded font-medium text-xs text-slate-800">
							Category: {caste}
						</span>
						<span className="px-2 py-0.5 bg-white border border-slate-300 rounded font-medium text-xs text-slate-800">
							CAP Candidate: {isCapStudent ? "Yes" : "No"}
						</span>
						<span className="px-2 py-0.5 bg-white border border-slate-300 rounded font-medium text-xs text-slate-800">
							Study Gap: {hasGap ? "Yes" : "No"}
						</span>
						{isMinority && (
							<span className="px-2 py-0.5 bg-white border border-slate-300 rounded font-medium text-xs text-slate-800">
								Minority Status
							</span>
						)}
						{isPwd && (
							<span className="px-2 py-0.5 bg-white border border-slate-300 rounded font-medium text-xs text-slate-800">
								PWD Status
							</span>
						)}
						{isOtherBoard && (
							<span className="px-2 py-0.5 bg-white border border-slate-300 rounded font-medium text-xs text-slate-800">
								Other Board (Non-MSBTE)
							</span>
						)}
					</div>
					<div className="text-slate-500 font-medium">
						Showing {filteredDocuments.length} required documents
					</div>
				</div>

				{/* Live progress indicator */}
				<div className="mb-6 print:hidden">
					<div className="flex justify-between items-center text-sm font-semibold mb-2">
						<span className="flex items-center gap-1.5 text-slate-700">
							<FaClipboardCheck className="text-neutral-900 text-base" /> Preparation Progress
						</span>
						<span className="text-slate-900 font-bold">
							{filteredDocuments.filter((d) => checkedDocs[d.id]).length} of {filteredDocuments.length} Collected
						</span>
					</div>
					<div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
						<div
							className="bg-black h-full rounded-full transition-all duration-500"
							style={{
								width: `${
									filteredDocuments.length > 0
										? (filteredDocuments.filter((d) => checkedDocs[d.id]).length / filteredDocuments.length) * 100
										: 0
								}%`,
							}}
						></div>
					</div>
				</div>

				{/* Documents Table */}
				<div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm print:border-none print:shadow-none">
					<div className="overflow-x-auto">
						<table className="w-full border-collapse text-left text-sm text-slate-600">
							<thead className="bg-slate-50 border-b border-slate-200 text-slate-900 font-bold text-xs uppercase tracking-wider print:bg-white">
								<tr>
									<th scope="col" className="px-6 py-4 print:hidden w-16 text-center">Status</th>
									<th scope="col" className="px-6 py-4 w-64 sm:w-80">Document Name</th>
									<th scope="col" className="px-6 py-4 w-36">Type</th>
									<th scope="col" className="px-6 py-4">Description & Instructions</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-slate-100">
								<AnimatePresence mode="popLayout">
									{filteredDocuments.map((doc, idx) => {
										const isChecked = !!checkedDocs[doc.id];
										return (
											<motion.tr
												key={doc.id}
												initial={{ opacity: 0 }}
												animate={{ opacity: 1 }}
												exit={{ opacity: 0 }}
												transition={{ duration: 0.2 }}
												className={`transition-colors duration-150 hover:bg-slate-50/50 print:hover:bg-white ${
													isChecked ? "bg-slate-50/30 font-medium" : ""
												}`}
											>
												{/* Action check button (hidden in print) */}
												<td className="px-6 py-4 print:hidden text-center">
													<button
														onClick={() => toggleDocumentCheck(doc.id)}
														className={`w-6 h-6 rounded-md border flex items-center justify-center transition-all ${
															isChecked
																? "bg-black border-black text-white"
																: "border-slate-300 hover:border-black text-transparent hover:text-slate-300"
														}`}
														aria-label={`Mark ${doc.name} as collected`}
													>
														<FaCheck className="text-[10px]" />
													</button>
												</td>

												{/* Name Column */}
												<td className="px-6 py-4 font-semibold text-slate-900">
													<div className="flex items-start gap-2.5">
														<span className="print:inline-block hidden font-medium text-slate-400 mr-1.5">
															[{isChecked ? "✓" : " "}]
														</span>
														<div className="flex flex-col">
															<span className="leading-snug">{doc.name}</span>
															{doc.remark && (
																<span className="text-xs text-slate-400 font-normal mt-1 flex items-start gap-1">
																	<FaInfoCircle className="text-[10px] mt-0.5 flex-shrink-0" />
																	{doc.remark}
																</span>
															)}
														</div>
													</div>
												</td>

												{/* Category / Type Tag */}
												<td className="px-6 py-4 whitespace-nowrap">
													{getCategoryBadge(doc.category)}
												</td>

												{/* Description */}
												<td className="px-6 py-4 leading-relaxed text-slate-500">
													{doc.description}
												</td>
											</motion.tr>
										);
									})}
								</AnimatePresence>

								{filteredDocuments.length === 0 && (
									<tr>
										<td colSpan={4} className="text-center py-16 text-slate-400">
											<FaFolderOpen className="text-3xl mx-auto mb-3 opacity-40 text-slate-500" />
											<span className="font-semibold text-sm">No documents found matching current filter search.</span>
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</div>

				{/* Important DTE guidelines/Pro-tips alert */}
				<div className="mt-8 p-5 bg-neutral-900 text-white rounded-3xl flex flex-col md:flex-row items-start gap-4">
					<div className="p-2.5 bg-neutral-800 rounded-2xl flex-shrink-0">
						<FaExclamationTriangle className="text-amber-400 text-xl" />
					</div>
					<div>
						<h3 className="text-base font-bold text-white mb-1.5">Important DTE Admission Guidelines</h3>
						<ul className="text-sm text-neutral-300 space-y-2 list-disc list-inside leading-relaxed font-sans">
							<li>
								<strong>Receipt submission:</strong> For VJ/DT-NT/OBC/SBC/EWS candidates, if Caste Validity or Non-Creamy Layer Certificate is not available during verification, DTE rules may temporarily accept the online application receipt, but the actual certificate must be submitted within the allotted cutoff deadline.
							</li>
							<li>
								<strong>Attested Sets:</strong> Always prepare at least <strong>3 sets</strong> of self-attested photocopies of all applicable documents along with the original documents in a clear folder.
							</li>
							<li>
								<strong>Keep digital scans:</strong> Scan all your physical certificates and upload them to Google Drive or DigiLocker before submitting originals to the engineering institute.
							</li>
						</ul>
					</div>
				</div>
			</div>
		</main>
	);
}
