"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { database, auth } from "@/lib/firebase";
import { ref, get, set } from "firebase/database";
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

export default function CollegeListPage() {
  const router = useRouter();
  const { user, loading: authLoading, isPremium } = useRequireAuth({ requirePremium: false });

  const [colleges, setColleges] = useState<College[]>([]);
  const [location, setLocation] = useState("");
  // Branch filtering states
  const [mainBranch, setMainBranch] = useState("");
  const [subBranch, setSubBranch] = useState("");
  // Caste filtering states
  const [stream, setStream] = useState(""); // legacy, will be replaced by mainBranch/subBranch
  const [category, setCategory] = useState("");
  const [mainCategory, setMainCategory] = useState("");
  const [diplomaPercent, setDiplomaPercent] = useState<number | null>(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [usageCount, setUsageCount] = useState(0);
  const [usageLoading, setUsageLoading] = useState(true);
  const [showAddNumberPopup, setShowAddNumberPopup] = useState(false);
  const [showPrintReport, setShowPrintReport] = useState(false);

  const isPlusMember = isPremium;
  const isLoggedIn = !!user;

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

  // Fetch and verify usage limits
  useEffect(() => {
    if (!user) return;

    setUsageLoading(true);
    get(ref(database, `Usage/collegeExplorer/${user.uid}`))
      .then((snap) => {
        const count = snap.exists() ? snap.val() : 0;
        setUsageCount(count);
        setUsageLoading(false);
      })
      .catch((e) => {
        console.error("Error fetching collegeExplorer usage:", e);
        setUsageCount(0);
        setUsageLoading(false);
      });
  }, [user]);

  // Sort locations and streams alphabetically
  const locations = unique(colleges.map((c) => c.City))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
  const streams = unique(colleges.map((c) => c["Course Name"]))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
  // List of all required categories
  const requiredCategories = [
    "DEFA-OBC",
    "DEFR-DBC",
    "DEFR-NTA",
    "DEFR-NTB",
    "DEFR-OBC",
    "DEFR-SC",
    "DEFR-SEBC",
    "DEFR-ST",
    "EWS",
    "GBEBC",
    "GNTA",
    "GNTB",
    "GNTC",
    "GNTD",
    "GNTE",
    "GNTO",
    "GOBC",
    "GOPEN",
    "GORD",
    "GSC",
    "GSEBC",
    "GSEBO",
    "GSESC",
    "GST",
    "L",
    "LBC",
    "LEC",
    "LGENC",
    "LIST",
    "LNTA",
    "LNTB",
    "LNTC",
    "LNTD",
    "LNTE",
    "LNTH",
    "LNTO",
    "LNTTD",
    "LOBC",
    "LODC",
    "LOE",
    "LOEC",
    "LOOC",
    "LOPEN",
    "LOSC",
    "LOUC",
    "LSC",
    "LSEBC",
    "LSEBO",
    "LSESC",
    "LST",
    "PWD-O",
    "PWDA-SEBC",
    "PWDR-OBC",
    "PWDR-SC",
    "PWDR-SEBC",
    "minority"
  ];
  // Branches list (union of all branches in data + required list)
  const requiredBranches = [
    "5G",
    "Aeronautical Engineering",
    "Agricultural Engineering",
    "Artificial Intelligence",
    "Artificial Intelligence (AI) and Data Science",
    "Artificial Intelligence (Al) and Data Science",
    "Artificial Intelligence and Data Science",
    "Artificial Intelligence and Machine Learning",
    "Artificial intelligence and Machine Learning",
    "Automation and Robotics",
    "Automobile Engineering",
    "Bio Medical Engineering",
    "Bio Technology",
    "Chemical Engineering",
    "Civil Engineering",
    "Civil Engineering and Planning",
    "Civil and Environmental Engineering",
    "Civil and infrastructure Engineering",
    "Commuter Science and Engineering(Data Science)",
    "Computer Engineering",
    "Computer Engineering (Software Engineering)",
    "Computer Engineering[Direct Second Year Second Shift]",
    "Computer Science",
    "Computer Science and Business Systems",
    "Computer Science and Design",
    "Computer Science and Engineering",
    "Computer Science and Engineering (Artificial Intelligence and Data Science)",
    "Computer Science and Engineering (Artificial Intelligence)",
    "Computer Science and Engineering (Cyber Security)",
    "Computer Science and Engineering (Internet of Things and Cyber Security Including Block Chain Technology)",
    "Computer Science and Engineering (IoT)",
    "Computer Science and Engineering(Artificial Intelligence and Machine Learning)",
    "Computer Science and Engineering(Cyber Security)",
    "Computer Science and Engineering(Data Science)",
    "Computer Science and Information Technology",
    "Computer Science and Technology",
    "Computer Technology",
    "Cyber Security",
    "Data Engineering",
    "Data Science",
    "Electrical Engg Electronics and Power]",
    "Electrical Engg [Electrical and Power]",
    "Electrical Engg[Electronics and Power]",
    "Electrical Engineering",
    "Electrical and Computer Engineering",
    "Electrical and Electronics Engineering",
    "Electronics Engineering",
    "Electronics Engineering ( VLSI Design and Technology)",
    "Electronics Engineering (VLSI Design and Technology)",
    "Electronics and Biomedical Engineering",
    "Electronics and Communication (Advanced Communication Technology)",
    "Electronics and Communication Engineering",
    "Electronics and Communication(Advanced Communication Technology)",
    "Electronics and Computer Engineering",
    "Electronics and Computer Science",
    "Electronics and Telecommunication Engg",
    "Electronics and Telecommunication Engg[Direct Second Year Second Shift]",
    "Fashion Technology",
    "Food Technology",
    "Food Technology And Management",
    "Industrial IoT",
    "Information Technology",
    "Instrumentation Engineering",
    "Instrumentation and Control Engineering",
    "Internet of Things (IoT)",
    "Man Made Textile Technology",
    "Manufacturing Science and Engineering",
    "Mechanical & Automation Engineering",
    "Mechanical Engineering",
    "Mechanical Engineering[Sandwich]",
    "Mechanical and Mechatronics Engineering (Additive Manufacturing)",
    "Mechatronics Engineering",
    "Metallurgy and Material Technology",
    "Mining Engineering",
    "Oil Fats and Waxes Technology",
    "Oil Technology",
    "Paints Technology",
    "Paper and Pulp Technology",
    "Petro Chemical Engineering",
    "Petro Chemical Technology",
    "Plastic Technology",
    "Plastic and Polymer Engineering",
    "Plastic and Polymer Technology",
    "Printing Technology",
    "Production Engineering",
    "Production Engineering[Sandwich]",
    "Robotics and Artificial Intelligence",
    "Robotics and Automation",
    "Safety and Fire Engineering",
    "Structural Engineering",
    "Surface Coating Technology",
    "Textile Chemistry",
    "Textile Engineering / Technology",
    "Textile Plant Engineering",
    "Textile Technology",
    "VLSI"
  ];

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
    // ... add more as needed ...
  };

  // Reverse mapping: full branch name -> all possible variants
  const reverseBranchMap: { [key: string]: string[] } = {};
  Object.entries(branchMap).forEach(([variant, full]) => {
    if (!reverseBranchMap[full]) reverseBranchMap[full] = [];
    reverseBranchMap[full].push(variant);
  });
  // Normalize branch names for filtering and display
  const normalizeBranch = (branch: string) => branchMap[branch] || branch;
  const dataBranches = unique(
    colleges.map((c) => normalizeBranch(c["Course Name"]))
  ).filter(Boolean).sort((a, b) => a.localeCompare(b));
  const allBranches = unique([
    ...dataBranches,
    ...requiredBranches.map(normalizeBranch)
  ]).sort((a, b) => a.localeCompare(b));

  // Main branch mapping: main branch -> all its sub-branches/variants
  // This is similar to reverseBranchMap, but for dropdowns
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
  // Merge unique categories from data and required list
  const categories = unique([
    ...colleges.flatMap((c) => c.Cutoffs ? c.Cutoffs.map((cut: Cutoff) => cut.Category) : []),
    ...requiredCategories
  ]);

  // Mapping of main categories to their subcategories 
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
    "PWD (Disability)": ["PWD-O", "PWDA-SEBC", "PWDR-OBC", "PWDR-SC", "PWDR-SEBC"],
    DEFENCE: ["DEFR-OBC", "DEFR-SC", "DEFR-ST", "DEFR-SEBC", "DEFR-NTA", "DEFR-NTB", "DEFR-NTC", "DEFR-NTD", "DEFA-OBC"]
  };
  const mainCategories = Object.keys(mainCategoryMap);

  // City and district mapping for Maharashtra (expanded)
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

  // Filtering logic with mainBranch/subBranch and city mapping
  const filtered = colleges.filter((college) => {
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
    const matchesLocation = location ? cityList.map(c => c.toLowerCase()).includes(college.City.toLowerCase()) : true;

    // Branch filtering logic
    let matchesBranch = true;
    if (mainBranch) {
      if (subBranch) {
        // If subBranch selected, match only that sub branch (variant, exact match only)
        matchesBranch = college["Course Name"] === subBranch;
      } else {
        // If only mainBranch selected, match any of its variants
        const variants = mainBranchMap[mainBranch] || [mainBranch];
        matchesBranch = variants.includes(college["Course Name"]);
      }
    }

    // Caste/category filtering (unchanged)
    let minCutoff = null;
    if (college.Cutoffs && college.Cutoffs.length > 0 && category) {
      const cat = college.Cutoffs.find((c) => c.Category === category);
      if (cat && cat.Score) {
        minCutoff = parseFloat(cat.Score.replace("%", ""));
      }
    } else if (college.Cutoffs && college.Cutoffs.length > 0) {
      const gopen = college.Cutoffs.find((c) => c.Category === "GOPEN");
      if (gopen && gopen.Score) {
        minCutoff = parseFloat(gopen.Score.replace("%", ""));
      }
    }
    (college as any)._minCutoff = minCutoff;
    const matchesCutoff = diplomaPercent !== null ? (minCutoff !== null && diplomaPercent >= minCutoff) : true;
    return matchesLocation && matchesBranch && matchesCutoff;
  })
    // Sort: exact match first, then by closest higher cutoff, then others
    .sort((a, b) => {
      const userCutoff = diplomaPercent || 0;
      const aCut = (a as any)._minCutoff;
      const bCut = (b as any)._minCutoff;
      // Exact match comes first
      if (aCut === userCutoff && bCut !== userCutoff) return -1;
      if (bCut === userCutoff && aCut !== userCutoff) return 1;
      // Then by how close the cutoff is (descending order)
      if (aCut !== null && bCut !== null) {
        return Math.abs(userCutoff - aCut) - Math.abs(userCutoff - bCut);
      }
      if (aCut === null) return 1;
      if (bCut === null) return -1;
      return 0;
    });

  // Extended list of Maharashtra cities including new entries from user
  const maharashtraCities = [
    "Ahmednagar", "Akkalkuwa", "Akluj", "Akola", "Ambejogai", "Amravati", "Andheri", "Aurangabad", "Babulgaon", "Badlapur", "Badnera", "Badravati", "Bamni", "Baramati", "Barshi", "Beed", "Bhandara", "Bhandars", "Bhanders", "Bhima", "Bhor", "Bhusawal", "Boisar", "Buldhana", "Chandrapur", "Chikhali", "Deorukh", "Dharashiv", "Dhule", "Dumbarwadi", "Egaon", "Faizpur", "Falzpur", "Gadhinglaj", "Hagpur", "Haveli", "Indapur", "Jalgaon", "Jalna", "Jaysingpur", "Kalyan", "Kankavli", "Karad", "Karjat", "Khurd", "Kolhapur", "Kopargaon", "Kuran", "Lakoll", "Latur", "Lonavala", "Lonere", "Mandal", "Miraj", "Mumbai", "Nagar", "Nagpur", "Nanded", "Nandurbar", "Narhe", "Nashik", "Nepti", "Nile", "Ohar", "Palghar", "Pandharpur", "Panhala", "Paniv", "Panvel", "Parbhani", "Pisoli", "Pune", "Raigad", "Ramtek", "Ratnagiri", "Ravet", "Sakoll", "Sambhajinagar", "Sangamner", "Sangli", "Sangola", "Sasewadi", "Satara", "Sawantwadi", "Sevagram", "Shahapur", "Shegaon", "Shirgaon", "Shirpur", "Sindhi", "Sinnar", "Solapur", "Sukhall", "Thane", "Tuljapur", "Ulhasnagar", "Vasai", "Wadwadi", "Waghall", "Wagholi", "Warananagar", "Wardha", "Warghe", "Washim", "Yadrav", "Yavatmal", "Yelgaon"
  ].sort((a, b) => a.localeCompare(b));

  // Handlers to reset formSubmitted if any input is cleared
  const handleDiplomaPercentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === "" ? null : parseFloat(e.target.value);
    setDiplomaPercent(value);
    if (value === null) setFormSubmitted(false);
  };
  const handleMainBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMainBranch(e.target.value);
    setSubBranch("");
    if (e.target.value === "") setFormSubmitted(false);
  };
  const handleSubBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSubBranch(e.target.value);
    if (e.target.value === "") setFormSubmitted(false);
  };
  const handleMainCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMainCategory(e.target.value);
    setCategory("");
    if (e.target.value === "") setFormSubmitted(false);
  };
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategory(e.target.value);
    if (e.target.value === "") setFormSubmitted(false);
  };
  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLocation(e.target.value);
    if (e.target.value === "") setFormSubmitted(false);
  };

  // Reset formSubmitted if any required input is deselected (subcategory is NOT required for list)
  useEffect(() => {
    if (
      diplomaPercent === null ||
      mainBranch === "" ||
      mainCategory === "" ||
      location === ""
    ) {
      if (formSubmitted) setFormSubmitted(false);
    }
  }, [diplomaPercent, mainBranch, mainCategory, location]);

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
        <span className="text-sm font-bold text-slate-800 truncate">College Explorer</span>
      </div>

      {/* Heading shown on all screens */}
      <div className="max-w-5xl mx-auto px-4 sm:px-8 pt-6 md:pt-16 pb-2 md:pb-4 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 mb-2 md:mb-4"
        >
          Explore Engineering Colleges With Our AI model
        </motion.h1>
        <p className="text-slate-500 text-sm sm:text-base">Fill in your details to find matching engineering colleges</p>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 md:py-6">
        {/* Filter Form */}
        <form
          className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200"
          onSubmit={async e => {
            e.preventDefault();

            // Check premium status and usage limit
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

            // Show results panel first
            setFormSubmitted(true);

            // Only increment usage for non-premium users when results are found
            if (!isPlusMember) {
              // `filtered` contains the matching results for current form state
              if (filtered.length > 0) {
                const newCount = usageCount + 1;
                const user = auth.currentUser;
                if (user) {
                  set(ref(database, `Usage/collegeExplorer/${user.uid}`), newCount).catch((err) => {
                    console.warn("Write to Usage/collegeExplorer failed, attempting Users fallback:", err);
                    return set(ref(database, `Users/${user.uid}/usage/collegeExplorer`), newCount).catch((e2) => {
                      console.error("Fallback write also failed:", e2);
                    });
                  });
                }
                setUsageCount(newCount);
              }
            }
          }}
        >
          <div className="col-span-1">
            <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1">Diploma Percentage *</label>
            <input
              type="number"
              step="0.01"
              placeholder="e.g. 78.50"
              value={diplomaPercent || ""}
              onChange={handleDiplomaPercentChange}
              className="p-2.5 border border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 rounded-xl outline-none transition w-full text-sm text-slate-800 bg-white"
              min={0}
              max={100}
              required
            />
          </div>
          <div className="col-span-1">
            <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1">Main Branch *</label>
            <SearchableSelect
              options={mainBranches}
              value={mainBranch}
              onChange={(v) => { setMainBranch(v); setSubBranch(""); if (!v) setFormSubmitted(false); }}
              placeholder="Search branch..."
              required
            />
          </div>
          {mainBranch && (
            <div className="col-span-1">
              <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1">Sub Branch <span className="text-slate-300">(optional)</span></label>
              <SearchableSelect
                options={mainBranchMap[mainBranch] || []}
                value={subBranch}
                onChange={(v) => { setSubBranch(v); }}
                placeholder="Search sub-branch..."
              />
            </div>
          )}
          <div className="col-span-1">
            <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1">Main Category *</label>
            <SearchableSelect
              options={mainCategories}
              value={mainCategory}
              onChange={(v) => { setMainCategory(v); setCategory(""); if (!v) setFormSubmitted(false); }}
              placeholder="Search category..."
              required
            />
          </div>
          {mainCategory && (
            <div className="col-span-1">
              <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1">Sub Category <span className="text-slate-300">(optional)</span></label>
              <SearchableSelect
                options={mainCategoryMap[mainCategory] || []}
                value={category}
                onChange={(v) => { setCategory(v); }}
                placeholder="Search sub-category..."
              />
            </div>
          )}
          <div className="col-span-1">
            <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1">City *</label>
            <SearchableSelect
              options={maharashtraCities}
              value={location}
              onChange={(v) => { setLocation(v); if (!v) setFormSubmitted(false); }}
              placeholder="Search city..."
              required
            />
          </div>
          <div className="col-span-1 sm:col-span-2">
            <button
              type="submit"
              disabled={authLoading || (!!user && usageLoading)}
              className="w-full bg-slate-900 hover:bg-black disabled:opacity-60 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-bold text-sm transition duration-300 flex items-center justify-center gap-2"
            >
              {authLoading ? (
                <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Checking...</>
              ) : "Generate College List"}
            </button>
          </div>
        </form>
      </div>

      {/* College Cards */}
      {loading ? (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-10">
          <p className="text-center text-slate-500 font-medium">Loading colleges...</p>
        </div>
      ) : formSubmitted && diplomaPercent !== null && mainBranch && mainCategory && location ? (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-16 flex flex-col gap-6">
          {filtered.length === 0 ? (
            <p className="text-center text-slate-500 mt-10 col-span-full font-medium">No colleges match your criteria.</p>
          ) : (
            <div className="w-full flex flex-col gap-6">
              {/* Download / Print Report Button */}
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-600">{filtered.slice(0, 20).length} colleges found</p>
                <button
                  onClick={() => setShowPrintReport(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-black text-white text-sm font-bold rounded-xl transition shadow"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                  Download / Print PDF
                </button>
              </div>

              {/* Print Report Modal */}
              {showPrintReport && (
                <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 overflow-y-auto p-4 flex items-start justify-center pt-10">
                  <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden">
                    <div className="flex items-center justify-between p-4 border-b border-slate-100">
                      <h2 className="text-base font-bold text-slate-900">College Report Preview</h2>
                      <button onClick={() => setShowPrintReport(false)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                    <div className="p-6 overflow-y-auto max-h-[80vh]">
                      <CollegePrintReport
                        colleges={filtered.slice(0, 20)}
                        category={category || mainCategory}
                        branch={subBranch || mainBranch}
                        city={location}
                        scoreLabel={diplomaPercent ? `${diplomaPercent}%` : undefined}
                        onClose={() => setShowPrintReport(false)}
                      />
                    </div>
                  </div>
                </div>
              )}
              {/* ── FLAT COLLEGE LIST with Chance Tag ── */}
              {(() => {
                const userScore = diplomaPercent || 0;
                const activeCategory = category || (mainCategory && mainCategoryMap[mainCategory]?.[0]) || "GOPEN";

                const getCutoff = (college: College): number | null => {
                  if (!college.Cutoffs) return null;
                  let cut = college.Cutoffs.find((c: Cutoff) => c.Category === activeCategory);
                  if (!cut && mainCategory && mainCategoryMap[mainCategory]) {
                    for (const sub of mainCategoryMap[mainCategory]) {
                      cut = college.Cutoffs.find((c: Cutoff) => c.Category === sub);
                      if (cut) break;
                    }
                  }
                  if (!cut) cut = college.Cutoffs.find((c: Cutoff) => c.Category === "GOPEN");
                  if (cut?.Score) return parseFloat(cut.Score.replace("%", ""));
                  return null;
                };

                const getDisplayCutoff = (college: College) => {
                  if (!college.Cutoffs) return null;
                  let cut = college.Cutoffs.find((c: Cutoff) => c.Category === activeCategory);
                  if (!cut && mainCategory && mainCategoryMap[mainCategory]) {
                    for (const sub of mainCategoryMap[mainCategory]) {
                      cut = college.Cutoffs.find((c: Cutoff) => c.Category === sub);
                      if (cut) break;
                    }
                  }
                  if (!cut) cut = college.Cutoffs.find((c: Cutoff) => c.Category === "GOPEN");
                  return cut || null;
                };

                const getChance = (college: College): "dream" | "medium" | "safe" | null => {
                  const co = getCutoff(college);
                  if (co === null) return null;
                  if (co > userScore + 3) return "dream";
                  if (co >= userScore - 3) return "medium";
                  return "safe";
                };

                const displayList = filtered.slice(0, 20);

                return (
                  <div className="flex flex-col gap-4">
                    {displayList.map((college, index) => {
                      const cutoffObj = getDisplayCutoff(college);
                      const cutoffScore = getCutoff(college);
                      const chance = getChance(college);
                      const rawDiff = cutoffScore !== null ? cutoffScore - userScore : null;

                      const chanceTag = {
                        dream:  { label: "Dream",        dot: "bg-red-500",     text: "text-red-600",     bg: "bg-red-50 border-red-200" },
                        medium: { label: "Medium Chance", dot: "bg-amber-500",   text: "text-amber-700",   bg: "bg-amber-50 border-amber-200" },
                        safe:   { label: "High Chance",   dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
                      }[chance as "dream" | "medium" | "safe"] ?? null;

                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 16 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03 }}
                          viewport={{ once: true }}
                          className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
                        >
                          {/* Dark header strip */}
                          <div className="bg-slate-900 px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                            <div className="flex items-start gap-3 min-w-0">
                              <span className="text-slate-400 text-sm font-bold shrink-0 mt-0.5">#{index + 1}</span>
                              <h3 className="text-white font-bold text-sm md:text-base leading-snug break-words">
                                {college["College Name"]}
                              </h3>
                            </div>
                            {chanceTag && (
                              <span className={`self-start sm:self-auto shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${chanceTag.bg} ${chanceTag.text}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${chanceTag.dot}`} />
                                {chanceTag.label}
                              </span>
                            )}
                          </div>

                          {/* Card body */}
                          <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-stretch sm:justify-between gap-4">
                            {/* Info column */}
                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                              <div>
                                <div className="flex flex-wrap gap-2 mb-3">
                                  <span className="inline-block bg-slate-100 text-slate-700 text-[11px] font-semibold px-2.5 py-1 rounded-full">
                                    {college.Status}
                                  </span>
                                  <span className="inline-block bg-slate-100 text-slate-500 text-[11px] font-medium px-2.5 py-1 rounded-full">
                                    Code: {college["College Code"]}
                                  </span>
                                </div>
                                <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-x-5 sm:gap-y-1.5 text-sm text-slate-500">
                                  <span className="flex items-center gap-1.5">
                                    <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                                    </svg>
                                    <span className="font-semibold text-slate-800">{college.City}</span>
                                  </span>
                                  <span className="flex items-start gap-1.5">
                                    <svg className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                                    </svg>
                                    <span className="text-slate-700 font-medium break-words leading-relaxed">{normalizeBranch(college["Course Name"])}</span>
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Cutoff column */}
                            {cutoffObj && (
                              <div className="border-t border-slate-100 pt-4 mt-2 sm:border-t-0 sm:border-l sm:border-slate-100 sm:pt-0 sm:pl-5 sm:mt-0 shrink-0 flex flex-col justify-center">
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                                  Cutoff ({cutoffObj.Category})
                                </p>
                                <div className="text-2xl font-extrabold text-slate-900 leading-none">
                                  {cutoffObj.Score}
                                </div>
                                <div className="text-xs text-slate-400 mt-0.5">Rank: {cutoffObj.Rank}</div>
                                {rawDiff !== null && (
                                  <div className={`text-[11px] font-semibold mt-1.5 ${rawDiff > 0 ? "text-red-500" : "text-emerald-600"}`}>
                                    {rawDiff > 0
                                      ? `▲ ${rawDiff.toFixed(1)}% above your score`
                                      : `▼ ${Math.abs(rawDiff).toFixed(1)}% below your score`}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                    {displayList.length === 0 && (
                      <p className="text-center text-slate-500 mt-10 font-medium">No colleges match your criteria.</p>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      ) : null}

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
