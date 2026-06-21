"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { database, auth } from "@/lib/firebase";
import { ref, get, set } from "firebase/database";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { getCollegesFromDb } from "@/lib/collegesCache";
import CollegePrintReport from "@/components/CollegePrintReport";

// Searchable dropdown component
function SearchableSelect({
  options,
  value,
  onChange,
  placeholder,
  required,
}: {
  options: string[];
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  required?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref2 = useRef<HTMLDivElement>(null);

  const filtered = query
    ? options.filter((o) => o.toLowerCase().includes(query.toLowerCase()))
    : options;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref2.current && !ref2.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref2} className="relative w-full">
      <div
        className={`flex items-center border rounded-xl bg-white px-3 py-2.5 cursor-text ${open ? "border-slate-500 ring-2 ring-slate-100" : "border-slate-200"
          } transition`}
        onClick={() => setOpen(true)}
      >
        <input
          className="flex-1 outline-none text-sm text-slate-800 bg-transparent placeholder:text-slate-400 min-w-0"
          placeholder={value || placeholder}
          value={open ? query : ""}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          required={required && !value}
        />
        {value && !open && (
          <span className="text-sm text-slate-700 truncate flex-1">{value}</span>
        )}
        <svg className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </div>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-52 overflow-y-auto">
          {value && (
            <button
              type="button"
              onClick={() => { onChange(""); setQuery(""); setOpen(false); }}
              className="w-full text-left px-4 py-2.5 text-xs text-slate-400 hover:bg-slate-50 border-b border-slate-100"
            >Clear selection</button>
          )}
          {filtered.length === 0 ? (
            <p className="px-4 py-3 text-xs text-slate-400">No results found</p>
          ) : (
            filtered.map((opt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => { onChange(opt); setQuery(""); setOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 transition ${opt === value ? "font-semibold text-slate-900 bg-slate-50" : "text-slate-700"
                  }`}
              >{opt}</button>
            ))
          )}
        </div>
      )}
    </div>
  );
}


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

const unique = (array: string[]) => Array.from(new Set(array));

export default function PredictorPage() {
  const router = useRouter();
  const { user, loading: authLoading, isPremium } = useRequireAuth({ requirePremium: false });
  const FEATURE_KEY = "predictor";
  const [colleges, setColleges] = useState<College[]>([]);
  const [score, setScore] = useState<number | null>(null);
  // Branch filtering states
  const [mainBranch, setMainBranch] = useState("");
  const [subBranch, setSubBranch] = useState("");
  const [location, setLocation] = useState("");
  const [predictions, setPredictions] = useState<College[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mainCategory, setMainCategory] = useState("");
  const [category, setCategory] = useState("");
  const [usageCount, setUsageCount] = useState(0);
  const [usageLoading, setUsageLoading] = useState(true);
  const [showAddNumberPopup, setShowAddNumberPopup] = useState(false);
  const [showPrintReport, setShowPrintReport] = useState(false);

  const isPlusMember = isPremium;
  const isLoggedIn = !!user;

  useEffect(() => {
    if (!user) return;

    // Fetch predictor usage from dedicated Usage path (avoids touching Users node)
    setUsageLoading(true);
    get(ref(database, `Usage/${FEATURE_KEY}/${user.uid}`))
      .then((snap) => {
        const count = snap.exists() ? snap.val() : 0;
        setUsageCount(count);
        setUsageLoading(false);
      })
      .catch((e) => {
        console.error("Error fetching predictor usage:", e);
        setUsageCount(0);
        setUsageLoading(false);
      });
  }, [user]);

  useEffect(() => {
    getCollegesFromDb()
      .then((arr) => {
        setColleges(arr as College[]);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to read clgdb:", err);
        setColleges([]);
        setLoading(false);
      });
  }, []);

  // Sort streams and locations alphabetically
  const streams = unique(colleges.map((c) => c["Course Name"]))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
  const locations = unique(colleges.map((c) => c.City))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));

  // Mapping of main categories to their subcategories (from colleges page)
  const mainCategoryMap: { [key: string]: string[] } = {
    OBC: ["GOBC", "LOBC", "PWDR-OBC", "DEFR-OBC", "DEFA-OBC"],
    SC: ["GSC", "LSC", "PWDR-SC", "DEFR-SC"],
    ST: ["GST", "LST", "DEFR-ST"],
    SEBC: ["GSEBC", "LSEBC", "PWDA-SEBC", "PWDR-SEBC", "DEFR-SEBC"],
    "NT(A)": ["GNTA", "LNTA", "DEFR-NTA"],
    "NT(B)": ["GNTB", "LNTB", "DEFR-NTB"],
    "NT(C)": ["GNTC", "LNTC"],
    "NT(D)": ["GNTD", "LNTD"],
    "OPEN / GENERAL": ["GOPEN", "LOPEN", "PWD-O", "GORD"],
    EWS: ["EWS"],
    "Minority": ["MI"],
    "PWD (Disability)": ["PWD-O", "PWDA-SEBC", "PWDR-OBC", "PWDR-SC", "PWDR-SEBC", "PWD-NTA", "NTB", "NTC", "NTA", "st"],
    DEFENCE: ["DEFR-OBC", "DEFR-SC", "DEFR-ST", "DEFR-SEBC", "DEFR-NTA", "DEFR-NTB", "DEFR-NTC", "DEFR-NTD", "DEFA-OBC"]
  };
  const mainCategories = Object.keys(mainCategoryMap);

  // Mapping of city/district groups for broader search (expanded)
  const cityDistrictMap: { [key: string]: string[] } = {
    mumbai: ["mumbai", "thane", "navi mumbai", "panvel", "kalyan", "dombivli", "vasai", "virar", "andheri", "boisar", "ulhasnagar", "badlapur"],
    pune: ["pune", "pcmc", "hadapsar", "wagholi", "shivaji nagar", "kothrud", "baramati", "lonavala", "narhe", "pisoli", "ravet", "sasewadi", "warje", "bhor", "indapur"],
    nagpur: ["nagpur", "wardha", "bhandara", "ramtek", "sevagram", "sindhi", "badravati", "bamni"],
    nashik: ["nashik", "malegaon", "satana", "kopargaon", "sinnar", "niphad", "egatpuri", "phar"],
    aurangabad: ["aurangabad", "jalna", "paithan", "sambhajinagar", "beed", "ambejogai", "dharashiv", "tuljapur"],
    kolhapur: ["kolhapur", "ichalkaranji", "karvir", "gadhinglaj", "jaysingpur", "miraj", "sangli", "yadrav", "warananagar", "panhala"],
    ahmednagar: ["ahmednagar", "nagar", "sangamner", "nepti"],
    akola: ["akola"],
    amravati: ["amravati", "badnera", "chandrapur"],
    bhusawal: ["bhusawal"],
    buldhana: ["buldhana", "chikhali", "shegaon"],
    chandrapur: ["chandrapur"],
    dhule: ["dhule", "shirpur"],
    jalgaon: ["jalgaon", "faizpur"],
    karad: ["karad"],
    latur: ["latur", "tuljapur", "dharashiv"],
    nanded: ["nanded"],
    nandurbar: ["nandurbar"],
    parbhani: ["parbhani"],
    ratnagiri: ["ratnagiri", "deorukh", "kankavli"],
    sangli: ["sangli", "sangola", "miraj", "jaysingpur"],
    satara: ["satara", "phaltan", "panhala", "paniv"],
    solapur: ["solapur", "barshi", "pandharpur", "akluj"],
    wardha: ["wardha", "sevagram"],
    washim: ["washim"],
    yavatmal: ["yavatmal"],
    lonere: ["lonere"],
    akkalkuwa: ["akkalkuwa"],
    dumbarwadi: ["dumbarwadi"],
    haveli: ["haveli"],
    isigaon: ["isigaon"],
    karjat: ["karjat"],
    khurd: ["khurd"],
    kuran: ["kuran"],
    lakoll: ["lakoll"],
    nageer: ["nageer"],
    sakoll: ["sakoll"],
    shahapur: ["shahapur"],
    shirgaon: ["shirgaon"],
    sukhali: ["sukhali"],
    wadwadi: ["wadwadi"],
    waghall: ["waghall"],
    yelgaon: ["yelgaon"],
    panvel: ["panvel"],
    raigad: ["raigad"]
  };

  // Branch mapping for display/normalization
  const branchMap: { [key: string]: string } = {
    "Artificial Intelligence and Data Science": "Artificial Intelligence and Data Science",
    "Artificial Intelligence (AI) and Data Science": "Artificial Intelligence and Data Science",
    "Computer Science and Engineering (Artificial Intelligence and Data Science)": "Artificial Intelligence and Data Science",
    "Computer Science and Engineering(Artificial Intelligence and Data Science)": "Artificial Intelligence and Data Science",
    "Artificial Intelligence and Machine Learning": "Artificial Intelligence and Machine Learning",
    "Computer Science and Engineering(Artificial Intelligence and Machine Learning)": "Artificial Intelligence and Machine Learning",
    "Computer Science and Engineering (Artificial Intelligence)": "Artificial Intelligence",
    "Artificial Intelligence": "Artificial Intelligence",
    "Computer Science and Engineering(Cyber Security)": "Cyber Security",
    "Cyber Security": "Cyber Security",
    "Computer Science and Engineering (Cyber Security)": "Cyber Security",
    "Data Science": "Data Science",
    "Computer Science and Engineering(Data Science)": "Data Science",
    "Internet of Things (IoT)": "Internet of Things",
    "Computer Science and Engineering (IoT)": "Internet of Things",
    "Industrial IoT": "Internet of Things",
    "Computer Science and Engineering (Internet of Things and Cyber Security Including Block Chain Technology)": "Internet of Things and Cyber Security Including Block Chain Technology",
    "Computer Science": "Computer Science and Engineering",
    "Computer Science and Engineering": "Computer Science and Engineering",
    "Computer Engineering": "Computer Science and Engineering",
    "Computer Technology": "Computer Science and Engineering",
    "Computer Science and Technology": "Computer Science and Engineering",
    "Information Technology": "Information Technology",
    "Electronics and Telecommunication Engineering": "Electronics and Telecommunication Engineering",
    "Electronics and Telecommunication Engg": "Electronics and Telecommunication Engineering",
    "Electronics and Telecommunication Engineering[Direct Second Year Second Shift]": "Electronics and Telecommunication Engineering",
    "Electronics Engineering": "Electronics Engineering",
    "Electrical Engineering": "Electrical Engineering",
    "Electrical and Electronics Engineering": "Electrical and Electronics Engineering",
    "Electrical Engg [Electrical and Power]": "Electrical Engineering",
    "Electrical Engg[Electronics and Power]": "Electrical Engineering",
    "Mechanical Engineering": "Mechanical Engineering",
    "Mechanical & Automation Engineering": "Mechanical Engineering",
    "Mechanical and Mechatronics Engineering (Additive Manufacturing)": "Mechanical Engineering",
    "Mechatronics Engineering": "Mechatronics Engineering",
    "Civil Engineering": "Civil Engineering",
    "Civil Engineering and Planning": "Civil Engineering",
    "Civil and Environmental Engineering": "Civil Engineering",
    "Civil and infrastructure Engineering": "Civil Engineering",
    "Instrumentation Engineering": "Instrumentation Engineering",
    "Instrumentation and Control Engineering": "Instrumentation Engineering",
    "Printing Technology": "Printing Technology",
    "Production Engineering": "Production Engineering",
    "Production Engineering[Sandwich]": "Production Engineering",
    "Robotics and Automation": "Robotics and Automation",
    "Robotics and Artificial Intelligence": "Robotics and Artificial Intelligence",
  };

  // Reverse mapping: full branch name -> all possible variants
  const reverseBranchMap: { [key: string]: string[] } = {};
  Object.entries(branchMap).forEach(([variant, full]) => {
    if (!reverseBranchMap[full]) reverseBranchMap[full] = [];
    reverseBranchMap[full].push(variant);
  });
  // Normalize branch names for filtering and display
  const normalizeBranch = (branch: string) => branchMap[branch] || branch;
  const requiredBranches = [
    "5G",
    "Aeronautical Engineering",
    "Agricultural Engineering",
    "Architecture",
    "Artificial Intelligence",
    "Automobile Engineering",
    "Bioinformatics",
    "Biomedical Engineering",
    "Chemical Engineering",
    "Civil Engineering",
    "Computer Science and Engineering",
    "Data Science",
    "Electrical Engineering",
    "Electronics and Communication Engineering",
    "Information Technology",
    "Instrumentation Engineering",
    "Mechanical Engineering",
    "Mechatronics",
    "Mining Engineering",
    "Petroleum Engineering",
    "Production Engineering",
    "Software Engineering",
    "Structural Engineering",
    "VLSI"
  ];
  const dataBranches = unique(colleges.map((c) => normalizeBranch(c["Course Name"])))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
  const allBranches = unique([...dataBranches, ...requiredBranches.map(normalizeBranch)]).sort((a, b) => a.localeCompare(b));

  // Main branch mapping: main branch -> all its sub-branches/variants
  const mainBranchMap: { [key: string]: string[] } = {};
  Object.entries(branchMap).forEach(([variant, main]) => {
    if (!mainBranchMap[main]) mainBranchMap[main] = [];
    if (!mainBranchMap[main].includes(variant)) mainBranchMap[main].push(variant);
  });
  // Add main branch itself if not present
  Object.keys(mainBranchMap).forEach(main => {
    if (!mainBranchMap[main].includes(main)) mainBranchMap[main].push(main);
  });
  const mainBranches = Object.keys(mainBranchMap).sort((a, b) => a.localeCompare(b));

  // Extended list of Maharashtra cities including new entries from user
  const maharashtraCities = [
    "Ahmednagar", "Akkalkuwa", "Akluj", "Akola", "Ambejogai", "Amravati", "Andheri", "Aurangabad", "Babulgaon", "Badlapur", "Badnera", "Badravati", "Bamni", "Baramati", "Barshi", "Beed", "Bhandara", "Bhandars", "Bhanders", "Bhima", "Bhor", "Bhusawal", "Boisar", "Buldhana", "Chandrapur", "Chikhali", "Deorukh", "Dharashiv", "Dhule", "Dumbarwadi", "Egaon", "Faizpur", "Falzpur", "Gadhinglaj", "Hagpur", "Haveli", "Indapur", "Jalgaon", "Jalna", "Jaysingpur", "Kalyan", "Kankavli", "Karad", "Karjat", "Khurd", "Kolhapur", "Kopargaon", "Kuran", "Lakoll", "Latur", "Lonavala", "Lonere", "Mandal", "Miraj", "Mumbai", "Nagar", "Nagpur", "Nanded", "Nandurbar", "Narhe", "Nashik", "Nepti", "Nile", "Ohar", "Palghar", "Pandharpur", "Panhala", "Paniv", "Panvel", "Parbhani", "Pisoli", "Pune", "Raigad", "Ramtek", "Ratnagiri", "Ravet", "Sakoll", "Sambhajinagar", "Sangamner", "Sangli", "Sangola", "Sasewadi", "Satara", "Sawantwadi", "Sevagram", "Shahapur", "Shegaon", "Shirgaon", "Shirpur", "Sindhi", "Sinnar", "Solapur", "Sukhall", "Thane", "Tuljapur", "Ulhasnagar", "Vasai", "Wadwadi", "Waghall", "Wagholi", "Warananagar", "Wardha", "Warghe", "Washim", "Yadrav", "Yavatmal", "Yelgaon"
  ].sort((a, b) => a.localeCompare(b));

  const handlePredict = async () => {
    if (!isLoggedIn) {
      alert("Please login to use this feature.");
      return;
    }

    // Require phone number for using this feature
    const currUser = auth.currentUser;
    if (currUser) {
      let hasPhone = !!currUser.phoneNumber;
      try {
        if (!hasPhone) {
          const snap = await get(ref(database, `Users/${currUser.uid}/phone`));
          if (snap.exists() && snap.val()) hasPhone = true;
        }
      } catch (e) {
        // ignore
      }
      if (!hasPhone) {
        setShowAddNumberPopup(true);
        return;
      }
    }

    if (!isPlusMember) {
      // Increment usage count (no hard limit)
      const newCount = usageCount + 1;
      const user = auth.currentUser;
      if (user) {
        set(ref(database, `Usage/${FEATURE_KEY}/${user.uid}`), newCount).catch((err) => {
          console.warn("Write to Usage path failed, trying Users/<uid>/usage fallback:", err);
          // Fallback: try writing under the user's profile node (may be allowed by rules)
          return set(ref(database, `Users/${user.uid}/usage/${FEATURE_KEY}`), newCount).catch((e2) => {
            console.error("Fallback write also failed:", e2);
          });
        });
      }
      setUsageCount(newCount);
    }

    // Reverse city mapping: if a location is selected, get all related cities for that location
    let cityList: string[] = [location];
    if (location && cityDistrictMap[location.toLowerCase()]) {
      cityList = cityDistrictMap[location.toLowerCase()];
    } else if (location) {
      for (const [group, cities] of Object.entries(cityDistrictMap)) {
        if (cities.map(c => c.toLowerCase()).includes(location.toLowerCase())) {
          cityList = cities;
          break;
        }
      }
    }
    // Branch filtering logic
    let result = colleges.filter((college) => {
      const matchesLocation = location ? cityList.map(c => c.toLowerCase()).includes(college.City.toLowerCase()) : true;
      let matchesBranch = true;
      if (mainBranch) {
        if (subBranch) {
          // If subBranch selected, match only that sub branch (exact match)
          matchesBranch = college["Course Name"] === subBranch;
        } else {
          // If only mainBranch selected, match any of its variants
          const variants = mainBranchMap[mainBranch] || [mainBranch];
          matchesBranch = variants.includes(college["Course Name"]);
        }
      }
      let minRank = null;
      if (college.Cutoffs && college.Cutoffs.length > 0 && category) {
        const cat = college.Cutoffs.find((c) => c.Category === category);
        if (cat && cat.Rank) {
          minRank = parseInt(cat.Rank);
        }
      } else if (college.Cutoffs && college.Cutoffs.length > 0) {
        const gopen = college.Cutoffs.find((c) => c.Category === "GOPEN");
        if (gopen && gopen.Rank) {
          minRank = parseInt(gopen.Rank);
        }
      }
      (college as any)._minRank = minRank;
      const matchesRank = score !== null ? (minRank !== null && score <= minRank) : true;
      return matchesBranch && matchesLocation && matchesRank;
    })
      // Sort: exact match first, then by closest higher rank, then others
      .sort((a, b) => {
        const userRank = score || 0;
        const aRank = (a as any)._minRank;
        const bRank = (b as any)._minRank;
        // Exact match comes first
        if (aRank === userRank && bRank !== userRank) return -1;
        if (bRank === userRank && aRank !== userRank) return 1;
        // Then by how close the rank is (ascending order)
        if (aRank !== null && bRank !== null) {
          return Math.abs(userRank - aRank) - Math.abs(userRank - bRank);
        }
        if (aRank === null) return 1;
        if (bRank === null) return -1;
        return 0;
      });
    setPredictions(result.slice(0, 20));
    setSubmitted(true);

    // Do not increment usage when there are no matching results.
  };

  // When the page mounts or usageCount changes, if the user previously hit
  // the limit for this feature, show the upgrade popup so they see the CTA
  // when they come back to the feature.
  // No limit-based popup behavior needed anymore.

  // Show loading spinner while auth resolves (prevents flash of content)
  if (authLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 rounded-full border-[3px] border-slate-200 border-t-slate-900 animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Mobile-only: sticky top bar with back button */}
      <div className="md:hidden bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-30">
        <Link
          href="/counselling"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back
        </Link>
        <span className="text-slate-300">|</span>
        <span className="text-sm font-bold text-slate-800 truncate">Predictor</span>
      </div>

      {/* Heading shown on all screens */}
      <div className="max-w-5xl mx-auto px-4 sm:px-8 pt-6 md:pt-16 pb-2 md:pb-4 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 mb-2 md:mb-4"
        >
          Rank Wise College Prediction using Our AI Model
        </motion.h1>
        <p className="text-slate-500 text-sm sm:text-base">Enter your details below to predict eligible engineering colleges</p>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 md:py-6">
        {/* Input Form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="col-span-1">
            <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1">Rank *</label>
            <input
              type="number"
              step="1"
              placeholder="Enter Your Rank"
              value={score || ""}
              onChange={(e) => setScore(e.target.value === "" ? null : parseInt(e.target.value))}
              className="px-3 py-2.5 border border-slate-200 focus:border-slate-500 focus:ring-2 focus:ring-slate-100 rounded-xl outline-none text-sm text-slate-800 bg-white w-full transition"
              required
            />
          </div>

          <div className="col-span-1">
            <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1">Main Branch *</label>
            <SearchableSelect
              options={mainBranches}
              value={mainBranch}
              onChange={(val) => {
                setMainBranch(val);
                setSubBranch("");
              }}
              placeholder="Search main branch..."
              required
            />
          </div>

          {mainBranch && (
            <div className="col-span-1">
              <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1">Sub Branch <span className="text-slate-300">(optional)</span></label>
              <SearchableSelect
                options={mainBranchMap[mainBranch] || []}
                value={subBranch}
                onChange={(val) => setSubBranch(val)}
                placeholder="Search sub branch..."
              />
            </div>
          )}

          <div className="col-span-1">
            <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1">Main Category *</label>
            <SearchableSelect
              options={mainCategories}
              value={mainCategory}
              onChange={(val) => {
                setMainCategory(val);
                setCategory("");
              }}
              placeholder="Search main category..."
              required
            />
          </div>

          {mainCategory && (
            <div className="col-span-1">
              <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1">Sub Category <span className="text-slate-300">(optional)</span></label>
              <SearchableSelect
                options={mainCategoryMap[mainCategory] || []}
                value={category}
                onChange={(val) => setCategory(val)}
                placeholder="Search sub category..."
              />
            </div>
          )}

          <div className="col-span-1">
            <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1">City *</label>
            <SearchableSelect
              options={maharashtraCities}
              value={location}
              onChange={(val) => setLocation(val)}
              placeholder="Search city..."
              required
            />
          </div>

          <div className="col-span-1 sm:col-span-2 mt-2">
            <button
              onClick={handlePredict}
              disabled={loading || !score || !mainBranch || !mainCategory || !location}
              className="w-full bg-slate-900 hover:bg-black disabled:opacity-60 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-bold text-sm transition duration-300 flex items-center justify-center gap-2"
            >
              Predict Colleges
            </button>
          </div>
        </div>

        {/* Result */}
        {loading ? (
          <p className="text-center text-slate-500 mt-10">Loading colleges...</p>
        ) : !score || !mainBranch || !mainCategory || !location ? (
          <p className="text-center text-slate-500 mt-10 font-semibold bg-slate-50 py-3 rounded-2xl border border-slate-200 max-w-lg mx-auto text-sm">Please fill in Rank, Branch, Main Category, and City to see predictions.</p>
        ) : submitted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-10"
          >
            <h3 className="text-2xl font-semibold text-center text-slate-900 mb-6">
              {predictions.length > 0 ? "Colleges Matching Your Score" : "No Matches Found"}
            </h3>

            <div className="w-full flex flex-col gap-6">
              {/* Download / Print Report Button */}
              {predictions.length > 0 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-600">{predictions.length} colleges found</p>
                  <button
                    onClick={() => setShowPrintReport(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-black text-white text-sm font-bold rounded-xl transition shadow"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                    Download / Print PDF
                  </button>
                </div>
              )}

              {/* Print Report Modal */}
              {showPrintReport && (
                <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 overflow-y-auto p-4 flex items-start justify-center pt-10">
                  <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden">
                    <div className="flex items-center justify-between p-4 border-b border-slate-100">
                      <h2 className="text-base font-bold text-slate-900">College Prediction Report</h2>
                      <button onClick={() => setShowPrintReport(false)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                    <div className="p-6 overflow-y-auto max-h-[80vh]">
                      <CollegePrintReport
                        colleges={predictions}
                        category={category || mainCategory}
                        branch={subBranch || mainBranch}
                        city={location}
                        scoreLabel={score ? `Rank ${score}` : undefined}
                        onClose={() => setShowPrintReport(false)}
                      />
                    </div>
                  </div>
                </div>
              )}
              {predictions.map((college, index) => {
                const listNumber = index + 1;
                // If both subBranch and category are selected, show only that cutoff and branch
                if (subBranch && category) {
                  // Only show if this college's course matches the subBranch exactly
                  if (college["Course Name"] !== subBranch) return null;
                  const selectedCutoff = college.Cutoffs && college.Cutoffs.find((cut) => cut.Category === category);
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                      viewport={{ once: true }}
                      className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition flex flex-col md:flex-row items-start md:items-center p-5 md:p-8 gap-4 md:gap-8"
                    >
                      <div className="flex-1 w-full">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg font-bold text-slate-900">{listNumber}.</span>
                          <h3 className="text-xl md:text-2xl font-bold text-slate-800 flex flex-wrap items-center gap-2">
                            <span>{college["College Name"]}</span>
                            <span className="inline-block bg-slate-100 text-slate-800 text-xs font-semibold px-2 py-1 rounded-full ml-2">{college.Status}</span>
                          </h3>
                        </div>
                        <div className="flex flex-wrap gap-4 text-slate-500 text-base mb-2">
                          <span>📍 <span className="font-semibold text-slate-700">{college.City}</span></span>
                          <span>🎓 <span className="font-semibold text-slate-700">{college["Course Name"]}</span></span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                          <span className="font-semibold text-slate-600">Cutoff ({category}):</span>
                          {selectedCutoff ? (
                            <span className="bg-slate-100 text-slate-900 px-3 py-1 rounded-full text-sm font-semibold">
                              {selectedCutoff.Score} <span className="text-slate-500 font-normal">(Rank: {selectedCutoff.Rank})</span>
                            </span>
                          ) : (
                            <span className="text-slate-400 text-sm">No cutoff data for this category.</span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                } else if (category) {
                  // If only sub category is selected, show only that cutoff for all branches
                  const selectedCutoff = college.Cutoffs && college.Cutoffs.find((cut) => cut.Category === category);
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                      viewport={{ once: true }}
                      className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition flex flex-col md:flex-row items-start md:items-center p-5 md:p-8 gap-4 md:gap-8"
                    >
                      <div className="flex-1 w-full">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg font-bold text-slate-900">{listNumber}.</span>
                          <h3 className="text-xl md:text-2xl font-bold text-slate-800 flex flex-wrap items-center gap-2">
                            <span>{college["College Name"]}</span>
                            <span className="inline-block bg-slate-100 text-slate-800 text-xs font-semibold px-2 py-1 rounded-full ml-2">{college.Status}</span>
                          </h3>
                        </div>
                        <div className="flex flex-wrap gap-4 text-slate-500 text-base mb-2">
                          <span>📍 <span className="font-semibold text-slate-700">{college.City}</span></span>
                          <span>🎓 <span className="font-semibold text-slate-700">{normalizeBranch(college["Course Name"])}</span></span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                          <span className="font-semibold text-slate-600">Cutoff ({category}):</span>
                          {selectedCutoff ? (
                            <span className="bg-slate-100 text-slate-900 px-3 py-1 rounded-full text-sm font-semibold">
                              {selectedCutoff.Score} <span className="text-slate-500 font-normal">(Rank: {selectedCutoff.Rank})</span>
                            </span>
                          ) : (
                            <span className="text-slate-400 text-sm">No cutoff data for this category.</span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                } else if (mainCategory && mainCategoryMap[mainCategory]) {
                  // If only mainCategory is selected, show all subcategory cutoffs for this main category
                  const subCategories = mainCategoryMap[mainCategory];
                  const cutoffs = (college.Cutoffs || []).filter((cut) => subCategories.includes(cut.Category));
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                      viewport={{ once: true }}
                      className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition flex flex-col md:flex-row items-start md:items-center p-5 md:p-8 gap-4 md:gap-8"
                    >
                      <div className="flex-1 w-full">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg font-bold text-slate-900">{listNumber}.</span>
                          <h3 className="text-xl md:text-2xl font-bold text-slate-800 flex flex-wrap items-center gap-2">
                            <span>{college["College Name"]}</span>
                            <span className="inline-block bg-slate-100 text-slate-800 text-xs font-semibold px-2 py-1 rounded-full ml-2">{college.Status}</span>
                          </h3>
                        </div>
                        <div className="flex flex-wrap gap-4 text-slate-500 text-base mb-2">
                          <span>📍 <span className="font-semibold text-slate-700">{college.City}</span></span>
                          <span>🎓 <span className="font-semibold text-slate-700">{college["Course Name"]}</span></span>
                        </div>
                        <div className="flex flex-col gap-1 mb-2">
                          <span className="font-semibold text-slate-600">Cutoffs ({mainCategory}):</span>
                          {cutoffs.length > 0 ? (
                            <div className="flex flex-wrap gap-2 mt-1">
                              {cutoffs.map((cut, i) => (
                                <span key={i} className="bg-slate-100 text-slate-900 px-3 py-1 rounded-full text-sm font-semibold">
                                  {cut.Category}: {cut.Score} <span className="text-slate-500 font-normal">(Rank: {cut.Rank})</span>
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-400 text-sm">No cutoff data for these subcategories.</span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                }
                return null;
              })}
            </div>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {showAddNumberPopup && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 px-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
              className="bg-white p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-lg border border-slate-200 text-center relative overflow-hidden"
            >
              <h3 className="text-2xl font-bold mb-3 text-slate-900">Mobile Number Required</h3>
              <p className="mb-6 text-sm text-slate-600">Please add your mobile number in your profile to use this feature.</p>
              <div className="flex gap-4 justify-center">
                <Link href="/profile" className="px-6 py-3 rounded-xl bg-slate-900 text-white font-bold">Add Number</Link>
                <button onClick={() => setShowAddNumberPopup(false)} className="px-6 py-3 rounded-xl border">Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
