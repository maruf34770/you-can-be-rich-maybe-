// Richup.io inspired Board Data & Config
// 40 spaces with modern international cities, utilities, stations, and cards

const BOARD_DATA = [
  // Bottom Row: 0 (GO) to 10 (Jail) -> right to left (standard monopoly) or 0 at bottom-right
  {
    id: 0,
    name: "GO",
    type: "go",
    subtitle: "Collect $200",
    color: "#10B981",
    icon: "🏁"
  },
  {
    id: 1,
    name: "Athens",
    type: "property",
    group: "brown",
    price: 60,
    rent: [2, 10, 30, 90, 160, 250],
    houseCost: 50,
    mortgage: 30,
    color: "#8B5A2B",
    country: "🇬🇷"
  },
  {
    id: 2,
    name: "Treasure Chest",
    type: "chest",
    subtitle: "Draw Card",
    color: "#3B82F6",
    icon: "📦"
  },
  {
    id: 3,
    name: "Rome",
    type: "property",
    group: "brown",
    price: 60,
    rent: [4, 20, 60, 180, 320, 450],
    houseCost: 50,
    mortgage: 30,
    color: "#8B5A2B",
    country: "🇮🇹"
  },
  {
    id: 4,
    name: "Income Tax",
    type: "tax",
    amount: 200,
    subtitle: "Pay $200",
    color: "#EF4444",
    icon: "💸"
  },
  {
    id: 5,
    name: "North Airport",
    type: "station",
    group: "station",
    price: 200,
    rent: [25, 50, 100, 200],
    mortgage: 100,
    color: "#64748B",
    icon: "✈️"
  },
  {
    id: 6,
    name: "Cairo",
    type: "property",
    group: "lightblue",
    price: 100,
    rent: [6, 30, 90, 270, 400, 550],
    houseCost: 50,
    mortgage: 50,
    color: "#38BDF8",
    country: "🇪🇬"
  },
  {
    id: 7,
    name: "Surprise",
    type: "chance",
    subtitle: "Take a Chance",
    color: "#F59E0B",
    icon: "❓"
  },
  {
    id: 8,
    name: "Madrid",
    type: "property",
    group: "lightblue",
    price: 100,
    rent: [6, 30, 90, 270, 400, 550],
    houseCost: 50,
    mortgage: 50,
    color: "#38BDF8",
    country: "🇪🇸"
  },
  {
    id: 9,
    name: "Berlin",
    type: "property",
    group: "lightblue",
    price: 120,
    rent: [8, 40, 100, 300, 450, 600],
    houseCost: 50,
    mortgage: 60,
    color: "#38BDF8",
    country: "🇩🇪"
  },
  {
    id: 10,
    name: "Jail / Visiting",
    type: "jail",
    subtitle: "Just Visiting",
    color: "#6B7280",
    icon: "🔒"
  },
  {
    id: 11,
    name: "Istanbul",
    type: "property",
    group: "pink",
    price: 140,
    rent: [10, 50, 150, 450, 625, 750],
    houseCost: 100,
    mortgage: 70,
    color: "#EC4899",
    country: "🇹🇷"
  },
  {
    id: 12,
    name: "Telecom Grid",
    type: "utility",
    group: "utility",
    price: 150,
    mortgage: 75,
    color: "#A855F7",
    icon: "⚡"
  },
  {
    id: 13,
    name: "Vienna",
    type: "property",
    group: "pink",
    price: 140,
    rent: [10, 50, 150, 450, 625, 750],
    houseCost: 100,
    mortgage: 70,
    color: "#EC4899",
    country: "🇦🇹"
  },
  {
    id: 14,
    name: "Brussels",
    type: "property",
    group: "pink",
    price: 160,
    rent: [12, 60, 180, 500, 700, 900],
    houseCost: 100,
    mortgage: 80,
    color: "#EC4899",
    country: "🇧🇪"
  },
  {
    id: 15,
    name: "East Airport",
    type: "station",
    group: "station",
    price: 200,
    rent: [25, 50, 100, 200],
    mortgage: 100,
    color: "#64748B",
    icon: "✈️"
  },
  {
    id: 16,
    name: "Venice",
    type: "property",
    group: "orange",
    price: 180,
    rent: [14, 70, 200, 550, 750, 950],
    houseCost: 100,
    mortgage: 90,
    color: "#F97316",
    country: "🇮🇹"
  },
  {
    id: 17,
    name: "Treasure Chest",
    type: "chest",
    subtitle: "Draw Card",
    color: "#3B82F6",
    icon: "📦"
  },
  {
    id: 18,
    name: "Amsterdam",
    type: "property",
    group: "orange",
    price: 180,
    rent: [14, 70, 200, 550, 750, 950],
    houseCost: 100,
    mortgage: 90,
    color: "#F97316",
    country: "🇳🇱"
  },
  {
    id: 19,
    name: "Barcelona",
    type: "property",
    group: "orange",
    price: 200,
    rent: [16, 80, 220, 600, 800, 1000],
    houseCost: 100,
    mortgage: 100,
    color: "#F97316",
    country: "🇪🇸"
  },
  {
    id: 20,
    name: "Free Rest",
    type: "parking",
    subtitle: "Rest Area",
    color: "#10B981",
    icon: "☕"
  },
  {
    id: 21,
    name: "Rio",
    type: "property",
    group: "red",
    price: 220,
    rent: [18, 90, 250, 700, 875, 1050],
    houseCost: 150,
    mortgage: 110,
    color: "#EF4444",
    country: "🇧🇷"
  },
  {
    id: 22,
    name: "Surprise",
    type: "chance",
    subtitle: "Take a Chance",
    color: "#F59E0B",
    icon: "❓"
  },
  {
    id: 23,
    name: "Toronto",
    type: "property",
    group: "red",
    price: 220,
    rent: [18, 90, 250, 700, 875, 1050],
    houseCost: 150,
    mortgage: 110,
    color: "#EF4444",
    country: "🇨🇦"
  },
  {
    id: 24,
    name: "Sydney",
    type: "property",
    group: "red",
    price: 240,
    rent: [20, 100, 300, 750, 925, 1100],
    houseCost: 150,
    mortgage: 120,
    color: "#EF4444",
    country: "🇦🇺"
  },
  {
    id: 25,
    name: "South Airport",
    type: "station",
    group: "station",
    price: 200,
    rent: [25, 50, 100, 200],
    mortgage: 100,
    color: "#64748B",
    icon: "✈️"
  },
  {
    id: 26,
    name: "Dubai",
    type: "property",
    group: "yellow",
    price: 260,
    rent: [22, 110, 330, 800, 975, 1150],
    houseCost: 150,
    mortgage: 130,
    color: "#EAB308",
    country: "🇦🇪"
  },
  {
    id: 27,
    name: "Seoul",
    type: "property",
    group: "yellow",
    price: 260,
    rent: [22, 110, 330, 800, 975, 1150],
    houseCost: 150,
    mortgage: 130,
    color: "#EAB308",
    country: "🇰🇷"
  },
  {
    id: 28,
    name: "Water Facility",
    type: "utility",
    group: "utility",
    price: 150,
    mortgage: 75,
    color: "#06B6D4",
    icon: "💧"
  },
  {
    id: 29,
    name: "Tokyo",
    type: "property",
    group: "yellow",
    price: 280,
    rent: [24, 120, 360, 850, 1025, 1200],
    houseCost: 150,
    mortgage: 140,
    color: "#EAB308",
    country: "🇯🇵"
  },
  {
    id: 30,
    name: "Go To Jail",
    type: "gotojail",
    subtitle: "Direct to Jail",
    color: "#DC2626",
    icon: "👮"
  },
  {
    id: 31,
    name: "Singapore",
    type: "property",
    group: "green",
    price: 300,
    rent: [26, 130, 390, 900, 1100, 1275],
    houseCost: 200,
    mortgage: 150,
    color: "#22C55E",
    country: "🇸🇬"
  },
  {
    id: 32,
    name: "London",
    type: "property",
    group: "green",
    price: 300,
    rent: [26, 130, 390, 900, 1100, 1275],
    houseCost: 200,
    mortgage: 150,
    color: "#22C55E",
    country: "🇬🇧"
  },
  {
    id: 33,
    name: "Treasure Chest",
    type: "chest",
    subtitle: "Draw Card",
    color: "#3B82F6",
    icon: "📦"
  },
  {
    id: 34,
    name: "Zurich",
    type: "property",
    group: "green",
    price: 320,
    rent: [28, 150, 450, 1000, 1200, 1400],
    houseCost: 200,
    mortgage: 160,
    color: "#22C55E",
    country: "🇨🇭"
  },
  {
    id: 35,
    name: "West Airport",
    type: "station",
    group: "station",
    price: 200,
    rent: [25, 50, 100, 200],
    mortgage: 100,
    color: "#64748B",
    icon: "✈️"
  },
  {
    id: 36,
    name: "Surprise",
    type: "chance",
    subtitle: "Take a Chance",
    color: "#F59E0B",
    icon: "❓"
  },
  {
    id: 37,
    name: "San Francisco",
    type: "property",
    group: "darkblue",
    price: 350,
    rent: [35, 175, 500, 1100, 1300, 1500],
    houseCost: 200,
    mortgage: 175,
    color: "#2563EB",
    country: "🇺🇸"
  },
  {
    id: 38,
    name: "Luxury Tax",
    type: "tax",
    amount: 100,
    subtitle: "Pay $100",
    color: "#8B5CF6",
    icon: "💎"
  },
  {
    id: 39,
    name: "New York",
    type: "property",
    group: "darkblue",
    price: 400,
    rent: [50, 200, 600, 1400, 1700, 2000],
    houseCost: 200,
    mortgage: 200,
    color: "#2563EB",
    country: "🇺🇸"
  }
];

// Color group definitions for monopoly sets
const PROPERTY_GROUPS = {
  brown: { name: "Brown", tiles: [1, 3], color: "#8B5A2B" },
  lightblue: { name: "Light Blue", tiles: [6, 8, 9], color: "#38BDF8" },
  pink: { name: "Pink", tiles: [11, 13, 14], color: "#EC4899" },
  orange: { name: "Orange", tiles: [16, 18, 19], color: "#F97316" },
  red: { name: "Red", tiles: [21, 23, 24], color: "#EF4444" },
  yellow: { name: "Yellow", tiles: [26, 27, 29], color: "#EAB308" },
  green: { name: "Green", tiles: [31, 32, 34], color: "#22C55E" },
  darkblue: { name: "Dark Blue", tiles: [37, 39], color: "#2563EB" },
  station: { name: "Airports", tiles: [5, 15, 25, 35], color: "#64748B" },
  utility: { name: "Utilities", tiles: [12, 28], color: "#A855F7" }
};

// Chance (Surprise) Cards
const SURPRISE_CARDS = [
  { text: "Advance to GO and collect $200!", action: "teleport", target: 0, collectGo: true },
  { text: "Speeding fine! Pay $50 to the bank.", action: "pay", amount: 50 },
  { text: "Take a flight to London! If you pass GO, collect $200.", action: "teleport", target: 32, collectGo: true },
  { text: "Your tech investment boomed! Collect $150.", action: "receive", amount: 150 },
  { text: "Go straight to Jail! Do not pass GO, do not collect $200.", action: "gotojail" },
  { text: "Get out of Jail free card!", action: "jailcard" },
  { text: "Property renovations! Pay $25 for each house and $100 for each hotel you own.", action: "repairs", perHouse: 25, perHotel: 100 },
  { text: "Holiday bonus! Every player gives you $20.", action: "collect_from_all", amount: 20 },
  { text: "Take a trip to North Airport. If you pass GO, collect $200.", action: "teleport", target: 5, collectGo: true },
  { text: "Crypto crash! Pay $100 in portfolio losses.", action: "pay", amount: 100 },
  { text: "You won a global lottery! Collect $100.", action: "receive", amount: 100 },
  { text: "Move back 3 spaces.", action: "move_relative", steps: -3 }
];

// Community Chest (Treasure) Cards
const TREASURE_CARDS = [
  { text: "Bank error in your favor. Collect $200.", action: "receive", amount: 200 },
  { text: "Hospital doctor fee. Pay $50.", action: "pay", amount: 50 },
  { text: "It is your birthday! Collect $25 from every player.", action: "collect_from_all", amount: 25 },
  { text: "From sale of stock you get $50.", action: "receive", amount: 50 },
  { text: "Get out of Jail free card!", action: "jailcard" },
  { text: "Go to Jail! Go directly to Jail.", action: "gotojail" },
  { text: "Income tax refund. Collect $100.", action: "receive", amount: 100 },
  { text: "Life insurance matures. Collect $100.", action: "receive", amount: 100 },
  { text: "Pay school tuition of $50.", action: "pay", amount: 50 },
  { text: "Consultancy fee received! Collect $25.", action: "receive", amount: 25 },
  { text: "Street repairs: Pay $40 per house, $115 per hotel.", action: "repairs", perHouse: 40, perHotel: 115 },
  { text: "Advance to GO (Collect $200).", action: "teleport", target: 0, collectGo: true }
];

// 24 Unique Player Presets (Vibrant colors, high-contrast, cute modern emojis)
const PLAYER_PRESETS = [
  { name: "Player 1", color: "#EF4444", icon: "🚀", bg: "rgba(239, 68, 68, 0.2)" },
  { name: "Player 2", color: "#3B82F6", icon: "👑", bg: "rgba(59, 130, 246, 0.2)" },
  { name: "Player 3", color: "#10B981", icon: "💎", bg: "rgba(16, 185, 129, 0.2)" },
  { name: "Player 4", color: "#F59E0B", icon: "🏎️", bg: "rgba(245, 158, 11, 0.2)" },
  { name: "Player 5", color: "#8B5CF6", icon: "🐱", bg: "rgba(139, 92, 246, 0.2)" },
  { name: "Player 6", color: "#EC4899", icon: "🐶", bg: "rgba(236, 72, 153, 0.2)" },
  { name: "Player 7", color: "#06B6D4", icon: "👻", bg: "rgba(6, 182, 212, 0.2)" },
  { name: "Player 8", color: "#F97316", icon: "🔥", bg: "rgba(249, 115, 22, 0.2)" },
  { name: "Player 9", color: "#84CC16", icon: "⭐", bg: "rgba(132, 204, 22, 0.2)" },
  { name: "Player 10", color: "#14B8A6", icon: "🤖", bg: "rgba(20, 184, 166, 0.2)" },
  { name: "Player 11", color: "#6366F1", icon: "🐉", bg: "rgba(99, 102, 241, 0.2)" },
  { name: "Player 12", color: "#D946EF", icon: "🍕", bg: "rgba(217, 70, 239, 0.2)" },
  { name: "Player 13", color: "#E11D48", icon: "🐯", bg: "rgba(225, 29, 72, 0.2)" },
  { name: "Player 14", color: "#0284C7", icon: "⚡", bg: "rgba(2, 132, 199, 0.2)" },
  { name: "Player 15", color: "#059669", icon: "🐼", bg: "rgba(5, 150, 105, 0.2)" },
  { name: "Player 16", color: "#D97706", icon: "🧙", bg: "rgba(217, 119, 6, 0.2)" },
  { name: "Player 17", color: "#7C3AED", icon: "🥷", bg: "rgba(124, 58, 237, 0.2)" },
  { name: "Player 18", color: "#DB2777", icon: "🦄", bg: "rgba(219, 39, 119, 0.2)" },
  { name: "Player 19", color: "#0891B2", icon: "💀", bg: "rgba(8, 145, 178, 0.2)" },
  { name: "Player 20", color: "#EA580C", icon: "⛵", bg: "rgba(234, 88, 12, 0.2)" },
  { name: "Player 21", color: "#65A30D", icon: "🦁", bg: "rgba(101, 163, 13, 0.2)" },
  { name: "Player 22", color: "#0D9488", icon: "🐻", bg: "rgba(13, 148, 136, 0.2)" },
  { name: "Player 23", color: "#4F46E5", icon: "🦊", bg: "rgba(79, 70, 229, 0.2)" },
  { name: "Player 24", color: "#C026D3", icon: "🛸", bg: "rgba(192, 38, 211, 0.2)" }
];
