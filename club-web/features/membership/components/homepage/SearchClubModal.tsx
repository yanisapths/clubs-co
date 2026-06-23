"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  X,
  LayoutGrid,
  Users,
  MapPin,
  Lock,
  Globe,
  Crown,
  ChevronRight,
  Tag,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type SidebarTab = "All" | "Clubs" | "Spaces" | "Members" | "Categories";
type ClubType = "public" | "private" | "exclusive";

interface Club {
  id: number;
  title: string;
  description: string;
  tags: string[];
  members: number;
  type: ClubType;
  location: string;
  category: string;
  gradient: string;
}

interface Member {
  id: string;
  name: string;
  handle: string;
  clubs: number;
  initials: string;
  color: string;
  location: string;
}

// ─── Static data ─────────────────────────────────────────────────────────────

const CATEGORY_FILTERS = [
  "All",
  "Tennis",
  "Polo",
  "Swim",
  "Art",
  "Football",
  "Basketball",
  "Running",
  "Yoga",
  "e-Sport",
];

const LOCATIONS = [
  "Bangkok",
  "London",
  "Oxford",
  "Paris",
  "Tokyo",
  "Singapore",
];

const CLUBS: Club[] = [
  {
    id: 1,
    title: "NEW OXFORD & MANCHESTER POLO CLUB",
    description: "Competitive polo in the heart of the city.",
    tags: ["Weekly"],
    members: 142,
    type: "private",
    location: "Bangkok",
    category: "Polo",
    gradient: "linear-gradient(135deg,#1a4a2e,#2d7a4f)",
  },
  {
    id: 2,
    title: "RICHMOND HIGH POLO PARK",
    description: "Casual polo sessions every weekend.",
    tags: ["Weekly"],
    members: 98,
    type: "private",
    location: "Bangkok",
    category: "Polo",
    gradient: "linear-gradient(135deg,#2d4a1e,#5a8a2f)",
  },
  {
    id: 3,
    title: "KiraCraft Art Club",
    description: "We paint every Saturday morning.",
    tags: ["Weekly"],
    members: 214,
    type: "public",
    location: "Bangkok",
    category: "Art",
    gradient: "linear-gradient(135deg,#1a1a3e,#7c3aed 60%,#c2410c)",
  },
  {
    id: 4,
    title: "KCL Football Club",
    description: "Competitive 5-a-side every Thursday.",
    tags: ["Weekly"],
    members: 56,
    type: "exclusive",
    location: "London",
    category: "Football",
    gradient: "linear-gradient(135deg,#1e3a5f,#2563eb)",
  },
  {
    id: 5,
    title: "The Kings Polo Club",
    description: "Elite polo for serious riders.",
    tags: ["Monthly"],
    members: 38,
    type: "exclusive",
    location: "Oxford",
    category: "Polo",
    gradient: "linear-gradient(135deg,#3b1f0a,#c2710c)",
  },
  {
    id: 6,
    title: "Bangkok Swim Society",
    description: "Open-water and pool swimming collective.",
    tags: ["Daily"],
    members: 310,
    type: "public",
    location: "Bangkok",
    category: "Swim",
    gradient: "linear-gradient(135deg,#0c4a6e,#0ea5e9)",
  },
  {
    id: 7,
    title: "Court Kings Tennis Club",
    description: "Weekly doubles and singles ladder.",
    tags: ["Weekly"],
    members: 88,
    type: "public",
    location: "Bangkok",
    category: "Tennis",
    gradient: "linear-gradient(135deg,#365314,#84cc16)",
  },
  {
    id: 8,
    title: "Morning Mile Running Crew",
    description: "6AM runs along the riverside every day.",
    tags: ["Daily"],
    members: 175,
    type: "public",
    location: "Bangkok",
    category: "Running",
    gradient: "linear-gradient(135deg,#4c0519,#e11d48)",
  },
];

const MEMBERS: Member[] = [
  {
    id: "m1",
    name: "Nicola Pelez",
    handle: "@nicola_xii12",
    clubs: 2,
    initials: "NP",
    color: "#7C3AED",
    location: "Bangkok",
  },
  {
    id: "m2",
    name: "Andrew P",
    handle: "@andrew_p",
    clubs: 4,
    initials: "AP",
    color: "#2563EB",
    location: "London",
  },
  {
    id: "m3",
    name: "Dakota J",
    handle: "@dakota_j",
    clubs: 1,
    initials: "DJ",
    color: "#059669",
    location: "Oxford",
  },
  {
    id: "m4",
    name: "Lee H",
    handle: "@lee_h",
    clubs: 3,
    initials: "LH",
    color: "#D97706",
    location: "Bangkok",
  },
  {
    id: "m5",
    name: "Sam B",
    handle: "@sam_b",
    clubs: 2,
    initials: "SB",
    color: "#DB2777",
    location: "London",
  },
];

const CATEGORY_META: { name: string; emoji: string; count: number }[] = [
  { name: "Tennis", emoji: "🎾", count: 12 },
  { name: "Polo", emoji: "🏇", count: 8 },
  { name: "Swim", emoji: "🏊", count: 15 },
  { name: "Art", emoji: "🎨", count: 31 },
  { name: "Football", emoji: "⚽", count: 24 },
  { name: "Basketball", emoji: "🏀", count: 9 },
  { name: "Running", emoji: "🏃", count: 18 },
  { name: "Yoga", emoji: "🧘", count: 7 },
  { name: "e-Sport", emoji: "🎮", count: 6 },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function TypeBadge({ type }: { type: ClubType }) {
  const cfg = {
    public: {
      icon: <Globe size={11} />,
      label: "Public",
      bg: "#22c55e22",
      color: "#22c55e",
      border: "#22c55e44",
    },
    private: {
      icon: <Lock size={11} />,
      label: "Private",
      bg: "#f59e0b22",
      color: "#f59e0b",
      border: "#f59e0b44",
    },
    exclusive: {
      icon: <Crown size={11} />,
      label: "Exclusive",
      bg: "#a855f722",
      color: "#a855f7",
      border: "#a855f744",
    },
  }[type];
  return (
    <span
      className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0"
      style={{
        background: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
      }}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

function ClubRow({ club }: { club: Club }) {
  return (
    <button
      className="w-full flex items-center gap-4 px-4 py-3 text-left rounded-xl group transition-colors"
      style={{ background: "transparent" }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = "rgba(255,255,255,0.05)")
      }
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <div
        className="w-11 h-11 rounded-xl shrink-0 flex items-center justify-center text-[11px] font-black text-white/70 uppercase tracking-widest"
        style={{ background: club.gradient }}
      >
        {club.title.slice(0, 2)}
      </div>
      <div className="flex flex-col min-w-0 flex-1 gap-0.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[15px] font-bold text-white leading-tight truncate">
            {club.title}
          </span>
          <TypeBadge type={club.type} />
        </div>
        <span className="text-sm text-white/50 truncate">
          {club.description}
        </span>
        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
          <span className="flex items-center gap-1 text-xs text-white/35">
            <MapPin size={11} />
            {club.location}
          </span>
          <span className="flex items-center gap-1 text-xs text-white/35">
            <Users size={11} />
            {club.members.toLocaleString()} members
          </span>
          <span
            className="text-[11px] px-2 py-0.5 rounded-full"
            style={{
              background: "rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.4)",
            }}
          >
            {club.category}
          </span>
          {club.tags.map((tag) => (
            <span
              key={tag}
              className="text-[11px] px-2 py-0.5 rounded-full"
              style={{
                background: "rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.4)",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
      <ChevronRight
        size={15}
        className="shrink-0 opacity-0 group-hover:opacity-40 transition-opacity text-white"
      />
    </button>
  );
}

function MemberRow({ member }: { member: Member }) {
  return (
    <button
      className="w-full flex items-center gap-4 px-4 py-3 text-left rounded-xl group transition-colors"
      style={{ background: "transparent" }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = "rgba(255,255,255,0.05)")
      }
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <div
        className="w-11 h-11 rounded-full shrink-0 flex items-center justify-center text-sm font-bold text-white"
        style={{ background: member.color }}
      >
        {member.initials}
      </div>
      <div className="flex flex-col min-w-0 flex-1 gap-0.5">
        <span className="text-[15px] font-bold text-white">{member.name}</span>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm text-white/45">{member.handle}</span>
          <span className="flex items-center gap-1 text-xs text-white/35">
            <MapPin size={11} />
            {member.location}
          </span>
          <span className="flex items-center gap-1 text-xs text-white/35">
            <Users size={11} />
            {member.clubs} club{member.clubs !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
      <ChevronRight
        size={15}
        className="shrink-0 opacity-0 group-hover:opacity-40 transition-opacity text-white"
      />
    </button>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="px-4 pt-1 pb-2 text-xs font-semibold tracking-[0.12em] uppercase"
      style={{ color: "rgba(255,255,255,0.28)" }}
    >
      {children}
    </p>
  );
}

function Divider() {
  return (
    <div
      className="mx-4 my-3"
      style={{ height: 1, background: "rgba(255,255,255,0.07)" }}
    />
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 gap-2">
      <Search size={28} style={{ color: "rgba(255,255,255,0.12)" }} />
      <p className="text-sm text-white/30">{label}</p>
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SIDEBAR: { tab: SidebarTab; icon: React.ReactNode; label: string }[] = [
  { tab: "All", icon: <LayoutGrid size={16} />, label: "All" },
  { tab: "Clubs", icon: <Users size={16} />, label: "Clubs" },
  { tab: "Spaces", icon: <MapPin size={16} />, label: "Spaces" },
  { tab: "Members", icon: <Users size={16} />, label: "Members" },
  { tab: "Categories", icon: <Tag size={16} />, label: "Categories" },
];

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<SidebarTab>("All");
  const [activeCategory, setActiveCategory] = useState("All");
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Reset when closed — no setState in effect body ──
  const resetState = useCallback(() => {
    setQuery("");
    setTab("All");
    setActiveCategory("All");
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [isOpen]);

  // Run reset only when modal transitions from open → closed
  const wasOpenRef = useRef(false);
  useEffect(() => {
    if (wasOpenRef.current && !isOpen) resetState();
    wasOpenRef.current = isOpen;
  }, [isOpen, resetState]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  // ── Filtered data ──
  const filteredClubs = CLUBS.filter((c) => {
    const matchQ =
      !q ||
      c.title.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.location.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q);
    const matchCat = activeCategory === "All" || c.category === activeCategory;
    return matchQ && matchCat;
  });

  const filteredMembers = MEMBERS.filter(
    (m) =>
      !q ||
      m.name.toLowerCase().includes(q) ||
      m.handle.toLowerCase().includes(q) ||
      m.location.toLowerCase().includes(q),
  );

  const filteredLocations = LOCATIONS.filter(
    (l) => !q || l.toLowerCase().includes(q),
  );

  const filteredCategories = CATEGORY_META.filter(
    (c) => !q || c.name.toLowerCase().includes(q),
  );

  // ── What the "All" tab shows ──
  // Members only appear in All when there's an active query
  const allShowsMembers = q.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-16"
      style={{ background: "rgba(0,0,0,0.78)", backdropFilter: "blur(8px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-[900px] rounded-2xl overflow-hidden flex flex-col"
        style={{
          background: "#1a1a1a",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 32px 96px rgba(0,0,0,0.95)",
          maxHeight: "calc(100vh - 100px)",
        }}
      >
        {/* ══ Search header ══ */}
        <div
          className="flex items-center gap-3 px-5 py-4"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
        >
          <Search
            size={22}
            style={{ color: "rgba(255,255,255,0.45)", flexShrink: 0 }}
          />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search clubs, spaces, members, or categories"
            className="bg-transparent text-white text-xl font-medium outline-none flex-1 placeholder:text-white/25"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1.5 rounded-lg transition-colors hover:bg-white/10"
            >
              <X size={16} style={{ color: "rgba(255,255,255,0.5)" }} />
            </button>
          )}
        </div>

        {/* ══ Two-panel body ══ */}
        <div className="flex flex-1 overflow-hidden">
          {/* ── Left sidebar ── */}
          <div
            className="flex flex-col py-3 shrink-0"
            style={{
              width: 196,
              borderRight: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            {SIDEBAR.map(({ tab: t, icon, label }) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="flex items-center gap-3 mx-2 px-4 py-2.5 rounded-xl text-[15px] font-semibold text-left transition-colors"
                style={{
                  background:
                    tab === t ? "rgba(255,255,255,0.1)" : "transparent",
                  color: tab === t ? "#fff" : "rgba(255,255,255,0.42)",
                }}
              >
                <span style={{ opacity: tab === t ? 1 : 0.65 }}>{icon}</span>
                {label}
              </button>
            ))}
          </div>

          {/* ── Right panel ── */}
          <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
            {/* Category filter strip — hidden on Members / Categories tabs */}
            {tab !== "Members" && tab !== "Categories" && (
              <div
                className="flex items-center gap-2 px-4 py-2.5 overflow-x-auto scrollbar-none"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
              >
                {CATEGORY_FILTERS.map((cat) => {
                  const active = activeCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className="shrink-0 px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all"
                      style={{
                        background: active ? "#fff" : "rgba(255,255,255,0.08)",
                        color: active ? "#000" : "rgba(255,255,255,0.5)",
                        border: active
                          ? "1px solid transparent"
                          : "1px solid rgba(255,255,255,0.1)",
                      }}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            )}

            {/* ── Scrollable results ── */}
            <div className="overflow-y-auto flex-1 py-3">
              {/* ════ ALL tab ════ */}
              {tab === "All" && (
                <>
                  {/* Clubs — always visible */}
                  <SectionLabel>{q ? "Clubs" : "Trending Clubs"}</SectionLabel>
                  {filteredClubs.length === 0 ? (
                    <EmptyState label={`No clubs match "${query}"`} />
                  ) : (
                    filteredClubs.map((c) => <ClubRow key={c.id} club={c} />)
                  )}

                  {/* Spaces — only when searching */}
                  {q && filteredLocations.length > 0 && (
                    <>
                      <Divider />
                      <SectionLabel>Spaces</SectionLabel>
                      {filteredLocations.map((loc) => {
                        const clubsInLoc = CLUBS.filter(
                          (c) => c.location === loc,
                        );
                        return (
                          <button
                            key={loc}
                            onClick={() => setTab("Spaces")}
                            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left group transition-colors"
                            style={{ background: "transparent" }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background =
                                "rgba(255,255,255,0.05)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background = "transparent")
                            }
                          >
                            <div
                              className="w-11 h-11 rounded-xl shrink-0 flex items-center justify-center"
                              style={{ background: "rgba(255,255,255,0.08)" }}
                            >
                              <MapPin
                                size={20}
                                style={{ color: "rgba(255,255,255,0.5)" }}
                              />
                            </div>
                            <div className="flex flex-col min-w-0 flex-1">
                              <span className="text-[15px] font-bold text-white">
                                {loc}
                              </span>
                              <span className="text-sm text-white/40">
                                {clubsInLoc.length} club
                                {clubsInLoc.length !== 1 ? "s" : ""}
                              </span>
                            </div>
                            <ChevronRight
                              size={15}
                              className="shrink-0 opacity-0 group-hover:opacity-40 transition-opacity text-white"
                            />
                          </button>
                        );
                      })}
                    </>
                  )}

                  {/* Categories — only when searching */}
                  {q && filteredCategories.length > 0 && (
                    <>
                      <Divider />
                      <SectionLabel>Categories</SectionLabel>
                      <div className="grid grid-cols-2 gap-1 px-3">
                        {filteredCategories.map((cat) => (
                          <button
                            key={cat.name}
                            onClick={() => {
                              setTab("Clubs");
                              setActiveCategory(cat.name);
                            }}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors"
                            style={{
                              background: "rgba(255,255,255,0.04)",
                              border: "1px solid rgba(255,255,255,0.07)",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background =
                                "rgba(255,255,255,0.08)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background =
                                "rgba(255,255,255,0.04)")
                            }
                          >
                            <span className="text-2xl">{cat.emoji}</span>
                            <div className="flex flex-col min-w-0">
                              <span className="text-[14px] font-bold text-white">
                                {cat.name}
                              </span>
                              <span className="text-xs text-white/35">
                                {cat.count} clubs
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Members — only when searching */}
                  {allShowsMembers && filteredMembers.length > 0 && (
                    <>
                      <Divider />
                      <SectionLabel>Members</SectionLabel>
                      {filteredMembers.map((m) => (
                        <MemberRow key={m.id} member={m} />
                      ))}
                    </>
                  )}
                </>
              )}

              {/* ════ CLUBS tab ════ */}
              {tab === "Clubs" && (
                <>
                  <SectionLabel>{q ? "Clubs" : "All Clubs"}</SectionLabel>
                  {filteredClubs.length === 0 ? (
                    <EmptyState label={`No clubs match "${query}"`} />
                  ) : (
                    filteredClubs.map((c) => <ClubRow key={c.id} club={c} />)
                  )}
                </>
              )}

              {/* ════ SPACES tab — location search ════ */}
              {tab === "Spaces" && (
                <>
                  <SectionLabel>
                    {q ? "Locations" : "Browse by Location"}
                  </SectionLabel>
                  {filteredLocations.length === 0 ? (
                    <EmptyState label={`No locations match "${query}"`} />
                  ) : (
                    filteredLocations.map((loc) => {
                      const clubsInLoc = CLUBS.filter(
                        (c) => c.location === loc,
                      );
                      return (
                        <button
                          key={loc}
                          className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left group transition-colors"
                          style={{ background: "transparent" }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background =
                              "rgba(255,255,255,0.05)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "transparent")
                          }
                        >
                          <div
                            className="w-11 h-11 rounded-xl shrink-0 flex items-center justify-center"
                            style={{ background: "rgba(255,255,255,0.08)" }}
                          >
                            <MapPin
                              size={20}
                              style={{ color: "rgba(255,255,255,0.5)" }}
                            />
                          </div>
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-[15px] font-bold text-white">
                              {loc}
                            </span>
                            <span className="text-sm text-white/40">
                              {clubsInLoc.length} club
                              {clubsInLoc.length !== 1 ? "s" : ""}
                            </span>
                          </div>
                          <ChevronRight
                            size={15}
                            className="shrink-0 opacity-0 group-hover:opacity-40 transition-opacity text-white"
                          />
                        </button>
                      );
                    })
                  )}

                  {/* Clubs in filtered locations */}
                  {q && filteredClubs.length > 0 && (
                    <>
                      <Divider />
                      <SectionLabel>Clubs in these spaces</SectionLabel>
                      {filteredClubs.map((c) => (
                        <ClubRow key={c.id} club={c} />
                      ))}
                    </>
                  )}
                </>
              )}

              {/* ════ MEMBERS tab ════ */}
              {tab === "Members" && (
                <>
                  <SectionLabel>
                    {q ? "Members" : "Active Members"}
                  </SectionLabel>
                  {filteredMembers.length === 0 ? (
                    <EmptyState label={`No members match "${query}"`} />
                  ) : (
                    filteredMembers.map((m) => (
                      <MemberRow key={m.id} member={m} />
                    ))
                  )}
                </>
              )}

              {/* ════ CATEGORIES tab ════ */}
              {tab === "Categories" && (
                <>
                  <SectionLabel>
                    {q ? "Categories" : "Browse Categories"}
                  </SectionLabel>
                  {filteredCategories.length === 0 ? (
                    <EmptyState label={`No categories match "${query}"`} />
                  ) : (
                    <div className="grid grid-cols-2 gap-1 px-3">
                      {filteredCategories.map((cat) => (
                        <button
                          key={cat.name}
                          onClick={() => {
                            setTab("Clubs");
                            setActiveCategory(cat.name);
                          }}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl text-left group transition-colors"
                          style={{
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.07)",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background =
                              "rgba(255,255,255,0.08)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background =
                              "rgba(255,255,255,0.04)")
                          }
                        >
                          <span className="text-2xl">{cat.emoji}</span>
                          <div className="flex flex-col min-w-0">
                            <span className="text-[14px] font-bold text-white">
                              {cat.name}
                            </span>
                            <span className="text-xs text-white/35">
                              {cat.count} clubs
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* ── Keyboard hints footer ── */}
            <div
              className="flex items-center gap-5 px-5 py-2.5"
              style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
            >
              {[
                ["↵", "open"],
                ["↑↓", "navigate"],
                ["ESC", "close"],
              ].map(([key, hint]) => (
                <span
                  key={key}
                  className="flex items-center gap-1.5 text-[11px] text-white/25"
                >
                  <kbd
                    className="px-1.5 py-0.5 rounded text-[10px]"
                    style={{
                      background: "rgba(255,255,255,0.07)",
                      color: "rgba(255,255,255,0.35)",
                    }}
                  >
                    {key}
                  </kbd>
                  {hint}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
