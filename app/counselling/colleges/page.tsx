"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { database, auth } from "@/lib/firebase";
import { ref, onValue, get, set } from "firebase/database";
import { useRequireAuth } from "@/lib/useRequireAuth";

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
  const [showPremiumPopup, setShowPremiumPopup] = useState(false);

  const isPlusMember = isPremium;
  const isLoggedIn = !!user;

  useEffect(() => {
    const clgRef = ref(database, "clgdb");
    const unsubscribe = onValue(clgRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Flatten data if stored as object
        const arr = Array.isArray(data) ? data : Object.values(data);
        setColleges(arr as College[]);
      } else {
        setColleges([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch and verify usage limits
  useEffect(() => {
    if (!user) return;

    setUsageLoading(true);
    get(ref(database, `Users/${user.uid}/collegeExplorerUsage`)).then((snap) => {
      const count = snap.exists() ? snap.val() : 0;
      setUsageCount(count);
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
    "Ahmednagar", "Akkalkuwa", "Akluj", "Akola", "Ambejogai", "Amravati", "Andheri", "Aurangabad", "Babulgaon", "Badlapur", "Badnera", "Badravati", "Bamni", "Baramati", "Barshi", "Beed", "Bhandara", "Bhandars", "Bhanders", "Bhima", "Bhor", "Bhusawal", "Boisar", "Buldhana", "Chandrapur", "Chikhali", "Deorukh", "Dharashiv", "Dhule", "Dumbarwadi", "Egaon", "Faizpur", "Falzpur", "Gadhinglaj", "Hagpur", "Haveli", "Indapur","Jalgaon", "Jalna", "Jaysingpur", "Kalyan", "Kankavli", "Karad", "Karjat", "Khurd", "Kolhapur", "Kopargaon", "Kuran", "Lakoll", "Latur", "Lonavala", "Lonere", "Mandal", "Miraj", "Mumbai", "Nagar",  "Nagpur", "Nanded", "Nandurbar", "Narhe", "Nashik", "Nepti", "Nile", "Ohar", "Palghar", "Pandharpur", "Panhala", "Paniv", "Panvel", "Parbhani", "Pisoli", "Pune", "Raigad", "Ramtek", "Ratnagiri", "Ravet","Sakoll", "Sambhajinagar",   "Sangamner", "Sangli", "Sangola", "Sasewadi", "Satara", "Sawantwadi", "Sevagram", "Shahapur", "Shegaon", "Shirgaon", "Shirpur", "Sindhi", "Sinnar", "Solapur", "Sukhall",  "Thane", "Tuljapur", "Ulhasnagar",  "Vasai", "Wadwadi", "Waghall", "Wagholi", "Warananagar", "Wardha", "Warghe", "Washim", "Yadrav", "Yavatmal", "Yelgaon"
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

  // Show loading spinner while auth resolves or usage count is being fetched (prevents flash of content)
  if (authLoading || (user && usageLoading)) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 rounded-full border-[3px] border-slate-200 border-t-slate-900 animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white px-6 md:px-20 py-16 font-poppins">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-3xl md:text-5xl font-extrabold text-center text-slate-900 mb-8 md:mb-12"
      >
        Explore Engineering Colleges With Our AI model
      </motion.h1>

      {/* Free Usage Counter - Only show for non-premium users */}
      {isLoggedIn && !isPlusMember && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto mb-8 bg-slate-50 border border-slate-200 rounded-2xl p-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700">Free Searches Used</span>
            <span className="text-sm font-bold text-slate-900">{usageCount} / 4</span>
          </div>
          <div className="mt-2 w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-slate-900 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(usageCount / 4) * 100}%` }}
            ></div>
          </div>
          {usageCount >= 4 && (
            <p className="text-xs text-slate-600 mt-2">You've reached your free limit. <Link href="/counselling/premium" className="text-slate-900 font-bold hover:underline">Upgrade to Premium</Link> for unlimited searches.</p>
          )}
        </motion.div>
      )}

      {/* Filter Form */}
      <form
        className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-slate-200"
        onSubmit={e => {
          e.preventDefault();

          // Check premium status and usage limit
          if (!isLoggedIn) {
            alert("Please login to use this feature.");
            return;
          }

          if (!isPlusMember) {
            if (usageCount >= 4) {
              setShowPremiumPopup(true);
              return;
            }
            // Increment usage count
            const newCount = usageCount + 1;
            const user = auth.currentUser;
            if (user) {
              set(ref(database, `Users/${user.uid}/collegeExplorerUsage`), newCount);
            }
            setUsageCount(newCount);
          }

          setFormSubmitted(true);
        }}
      >
        <input
          type="number"
          step="0.01"
          placeholder="Diploma Percentage"
          value={diplomaPercent || ""}
          onChange={handleDiplomaPercentChange}
          className="p-3.5 border border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 rounded-xl outline-none transition w-full text-slate-800 bg-white"
          min={0}
          max={100}
          required
        />
        <select
          value={mainBranch}
          onChange={handleMainBranchChange}
          className="p-3.5 border border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 rounded-xl outline-none transition w-full text-slate-800 bg-white"
          required
        >
          <option value="">Select Main Branch</option>
          {mainBranches.map((mb, i) => (
            <option key={i} value={mb}>{mb}</option>
          ))}
        </select>
        {mainBranch && (
          <select
            value={subBranch}
            onChange={handleSubBranchChange}
            className="p-3.5 border border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 rounded-xl outline-none transition w-full text-slate-800 bg-white"
          >
            <option value="">Select Sub Branch (optional)</option>
            {mainBranchMap[mainBranch].map((sb, i) => (
              <option key={i} value={sb}>{sb}</option>
            ))}
          </select>
        )}
        <select
          value={mainCategory}
          onChange={handleMainCategoryChange}
          className="p-3.5 border border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 rounded-xl outline-none transition w-full text-slate-800 bg-white"
          required
        >
          <option value="">Select Main Category</option>
          {mainCategories.map((cat, i) => (
            <option key={i} value={cat}>{cat}</option>
          ))}
        </select>
        {mainCategory && (
          <select
            value={category}
            onChange={handleCategoryChange}
            className="p-3.5 border border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 rounded-xl outline-none transition w-full text-slate-800 bg-white"
          >
            <option value="">Select Sub Category</option>
            {mainCategoryMap[mainCategory].map((subcat, i) => (
              <option key={i} value={subcat}>{subcat}</option>
            ))}
          </select>
        )}
        <select
          value={location}
          onChange={handleLocationChange}
          className="p-3.5 border border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 rounded-xl outline-none transition w-full text-slate-800 bg-white"
          required
        >
          <option value="">Select City</option>
          {maharashtraCities.map((loc, i) => (
            <option key={i} value={loc}>{loc}</option>
          ))}
        </select>
        <button
          type="submit"
          className="md:col-span-4 bg-slate-900 hover:bg-black text-white px-6 py-3.5 rounded-xl shadow-md font-bold text-lg transition duration-300 mt-2 w-full"
        >
          Generate List
        </button>
      </form>

      {/* College Cards */}
      {loading ? (
        <p className="text-center text-slate-500 mt-10">Loading colleges...</p>
      ) : formSubmitted && diplomaPercent !== null && mainBranch && mainCategory && location ? (
        <div className="w-full flex flex-col gap-6">
          {filtered.length === 0 ? (
            <p className="text-center text-slate-500 mt-10 col-span-full font-medium">No colleges match your criteria.</p>
          ) : (
            <div className="w-full flex flex-col gap-6">
              {filtered.slice(0, 20).map((college, index) => {
                // If both subBranch and category are selected, show only that branch and cutoff
                if (subBranch && category) {
                  const selectedCutoff = college.Cutoffs && college.Cutoffs.find((cut: Cutoff) => cut.Category === category);
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
                          <span className="text-lg font-bold text-slate-900">{index + 1}.</span>
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
                  // If only category is selected, show only that cutoff (all branches)
                  const selectedCutoff = college.Cutoffs && college.Cutoffs.find((cut: Cutoff) => cut.Category === category);
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
                          <span className="text-lg font-bold text-slate-900">{index + 1}.</span>
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
                  const cutoffs = (college.Cutoffs || []).filter((cut: Cutoff) => subCategories.includes(cut.Category));
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
                          <span className="text-lg font-bold text-slate-900">{index + 1}.</span>
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
          )}
        </div>
      ) : null}

      {/* ── Premium Popup ── */}
      <AnimatePresence>
        {showPremiumPopup && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 px-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
              className="bg-white p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-lg border border-slate-200 text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-slate-700 to-slate-900"></div>
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-6 text-slate-900 shadow-sm border border-slate-200 text-3xl">
                👑
              </div>
              <h3 className="text-3xl font-black mb-3 text-slate-900 tracking-tight">Free Limit Reached</h3>
              <p className="mb-8 text-base text-slate-500 leading-relaxed font-medium px-4">
                You have used your 4 free college searches. Upgrade to Premium to get unlimited access, full CAP round support, and 1:1 expert mentorship.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/counselling/premium"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 hover:bg-black text-white font-bold transition-all shadow-lg text-sm flex items-center justify-center gap-2">
                  Upgrade to Premium
                </Link>
                <button onClick={() => setShowPremiumPopup(false)}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 font-bold transition-colors text-sm">
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
