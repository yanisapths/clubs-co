"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type {
  ReactNode,
  MouseEvent as ReactMouseEvent,
  ChangeEvent,
  JSX,
} from "react";
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
import { useMembershipSearch } from "@/hooks/use-membership-search";
import type {
  SearchClub,
  SearchMember,
  SearchSpace,
  SearchCategory,
} from "@/features/shared/api/api";

// ─── Types ────────────────────────────────────────────────────────────────────

type SidebarTab = "All" | "Clubs" | "Spaces" | "Members" | "Categories";

interface SidebarItem {
  tab: SidebarTab;
  icon: ReactNode;
  label: string;
}

interface TypeBadgeConfig {
  icon: ReactNode;
  label: string;
  bg: string;
  color: string;
  border: string;
}

type HoverableElement = HTMLButtonElement;

// ─── Static UI data (category chip icons — not from the API) ─────────────────

const CATEGORY_EMOJI: Record<string, string> = {
  Tennis: "🎾",
  Polo: "🏇",
  Swim: "🏊",
  Art: "🎨",
  Football: "⚽",
  Basketball: "🏀",
  Running: "🏃",
  Yoga: "🧘",
  "e-Sport": "🎮",
};

const KEYBOARD_HINTS: ReadonlyArray<readonly [string, string]> = [
  ["↵", "open"],
  ["↑↓", "navigate"],
  ["ESC", "close"],
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function clubTypeBadgeConfig(clubType: string): TypeBadgeConfig {
  switch (clubType.toLowerCase()) {
    case "private":
      return {
        icon: <Lock size={11} />,
        label: "Private",
        bg: "#f59e0b22",
        color: "#f59e0b",
        border: "#f59e0b44",
      };
    case "exclusive":
      return {
        icon: <Crown size={11} />,
        label: "Exclusive",
        bg: "#a855f722",
        color: "#a855f7",
        border: "#a855f744",
      };
    default:
      return {
        icon: <Globe size={11} />,
        label: "Public",
        bg: "#22c55e22",
        color: "#22c55e",
        border: "#22c55e44",
      };
  }
}

function initialsOf(name: string): string {
  return name.slice(0, 2).toUpperCase();
}

function onRowHoverEnter(e: ReactMouseEvent<HoverableElement>): void {
  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
}

function onRowHoverLeave(e: ReactMouseEvent<HoverableElement>): void {
  e.currentTarget.style.background = "transparent";
}

function onCellHoverEnter(e: ReactMouseEvent<HoverableElement>): void {
  e.currentTarget.style.background = "rgba(255,255,255,0.08)";
}

function onCellHoverLeave(e: ReactMouseEvent<HoverableElement>): void {
  e.currentTarget.style.background = "rgba(255,255,255,0.04)";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface TypeBadgeProps {
  clubType: string;
}

function TypeBadge({ clubType }: TypeBadgeProps): JSX.Element {
  const cfg: TypeBadgeConfig = clubTypeBadgeConfig(clubType);
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

interface ClubRowProps {
  club: SearchClub;
  onSelect: (club: SearchClub) => void;
}

function ClubRow({ club, onSelect }: ClubRowProps): JSX.Element {
  const handleClick = (): void => onSelect(club);

  return (
    <button
      type="button"
      className="w-full flex items-center gap-4 px-4 py-3 text-left rounded-xl group transition-colors"
      style={{ background: "transparent" }}
      onClick={handleClick}
      onMouseEnter={onRowHoverEnter}
      onMouseLeave={onRowHoverLeave}
    >
      <div
        className="w-11 h-11 rounded-xl shrink-0 flex items-center justify-center text-[11px] font-black text-white/70 uppercase tracking-widest"
        style={{
          background: club.imageUrl
            ? `url(${club.imageUrl}) center/cover`
            : "linear-gradient(135deg,#1a1a3e,#7c3aed 60%,#c2410c)",
        }}
      >
        {!club.imageUrl && initialsOf(club.name)}
      </div>
      <div className="flex flex-col min-w-0 flex-1 gap-0.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[15px] font-bold text-white leading-tight truncate">
            {club.name}
          </span>
          <TypeBadge clubType={club.clubType} />
        </div>
        <span className="text-sm text-white/50 truncate">
          {club.description}
        </span>
        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
          <span className="flex items-center gap-1 text-xs text-white/35">
            <Users size={11} />
            {club.memberCount.toLocaleString()} members
          </span>
          {club.category ? (
            <span
              className="text-[11px] px-2 py-0.5 rounded-full"
              style={{
                background: "rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.4)",
              }}
            >
              {club.category}
            </span>
          ) : null}
          {club.tags.map((tag: { id: number; name: string }) => (
            <span
              key={tag.id}
              className="text-[11px] px-2 py-0.5 rounded-full"
              style={{
                background: "rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.4)",
              }}
            >
              {tag.name}
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

interface MemberRowProps {
  member: SearchMember;
  onSelect: (member: SearchMember) => void;
}

function MemberRow({ member, onSelect }: MemberRowProps): JSX.Element {
  const handleClick = (): void => onSelect(member);
  const displayLabel: string = member.displayName || member.username;

  return (
    <button
      type="button"
      className="w-full flex items-center gap-4 px-4 py-3 text-left rounded-xl group transition-colors"
      style={{ background: "transparent" }}
      onClick={handleClick}
      onMouseEnter={onRowHoverEnter}
      onMouseLeave={onRowHoverLeave}
    >
      <div
        className="w-11 h-11 rounded-full shrink-0 flex items-center justify-center text-sm font-bold text-white"
        style={{
          background: member.imageUrl
            ? `url(${member.imageUrl}) center/cover`
            : "#7C3AED",
        }}
      >
        {!member.imageUrl && initialsOf(displayLabel)}
      </div>
      <div className="flex flex-col min-w-0 flex-1 gap-0.5">
        <span className="text-[15px] font-bold text-white">{displayLabel}</span>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm text-white/45">@{member.username}</span>
          <span className="flex items-center gap-1 text-xs text-white/35">
            <Users size={11} />
            {member.clubCount} club{member.clubCount !== 1 ? "s" : ""}
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

interface SpaceRowProps {
  space: SearchSpace;
  onSelect: (space: SearchSpace) => void;
}

function SpaceRow({ space, onSelect }: SpaceRowProps): JSX.Element {
  const handleClick = (): void => onSelect(space);

  return (
    <button
      type="button"
      className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left group transition-colors"
      style={{ background: "transparent" }}
      onClick={handleClick}
      onMouseEnter={onRowHoverEnter}
      onMouseLeave={onRowHoverLeave}
    >
      <div
        className="w-11 h-11 rounded-xl shrink-0 flex items-center justify-center"
        style={{ background: "rgba(255,255,255,0.08)" }}
      >
        <MapPin size={20} style={{ color: "rgba(255,255,255,0.5)" }} />
      </div>
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-[15px] font-bold text-white">{space.name}</span>
        <span className="text-sm text-white/40">
          {space.clubCount} club{space.clubCount !== 1 ? "s" : ""}
        </span>
      </div>
      <ChevronRight
        size={15}
        className="shrink-0 opacity-0 group-hover:opacity-40 transition-opacity text-white"
      />
    </button>
  );
}

interface CategoryCellProps {
  category: SearchCategory;
  onSelect: (category: SearchCategory) => void;
}

function CategoryCell({ category, onSelect }: CategoryCellProps): JSX.Element {
  const handleClick = (): void => onSelect(category);

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
      onMouseEnter={onCellHoverEnter}
      onMouseLeave={onCellHoverLeave}
    >
      <span className="text-2xl">{CATEGORY_EMOJI[category.name] ?? "🏷️"}</span>
      <div className="flex flex-col min-w-0">
        <span className="text-[14px] font-bold text-white">
          {category.name}
        </span>
      </div>
    </button>
  );
}

interface SectionLabelProps {
  children: ReactNode;
}

function SectionLabel({ children }: SectionLabelProps): JSX.Element {
  return (
    <p
      className="px-4 pt-1 pb-2 text-xs font-semibold tracking-[0.12em] uppercase"
      style={{ color: "rgba(255,255,255,0.28)" }}
    >
      {children}
    </p>
  );
}

function Divider(): JSX.Element {
  return (
    <div
      className="mx-4 my-3"
      style={{ height: 1, background: "rgba(255,255,255,0.07)" }}
    />
  );
}

interface EmptyStateProps {
  label: string;
}

function EmptyState({ label }: EmptyStateProps): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center py-14 gap-2">
      <Search size={28} style={{ color: "rgba(255,255,255,0.12)" }} />
      <p className="text-sm text-white/30">{label}</p>
    </div>
  );
}

function LoadingState(): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center py-14 gap-2">
      <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Optional navigation hooks — plug in router.push from the consuming page/component. */
  onSelectClub?: (club: SearchClub) => void;
  onSelectMember?: (member: SearchMember) => void;
  onSelectSpace?: (space: SearchSpace) => void;
  onSelectCategory?: (category: SearchCategory) => void;
}

const SIDEBAR: SidebarItem[] = [
  { tab: "All", icon: <LayoutGrid size={16} />, label: "All" },
  { tab: "Clubs", icon: <Users size={16} />, label: "Clubs" },
  { tab: "Spaces", icon: <MapPin size={16} />, label: "Spaces" },
  { tab: "Members", icon: <Users size={16} />, label: "Members" },
  { tab: "Categories", icon: <Tag size={16} />, label: "Categories" },
];

export function SearchModal({
  isOpen,
  onClose,
  onSelectClub,
  onSelectMember,
  onSelectSpace,
  onSelectCategory,
}: SearchModalProps): JSX.Element | null {
  const [query, setQuery] = useState<string>("");
  const [tab, setTab] = useState<SidebarTab>("All");
  const inputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading } = useMembershipSearch(query, { enabled: isOpen });
  const { clubs, members, spaces, categories } = data;

  const resetState = useCallback((): void => {
    setQuery("");
    setTab("All");
  }, []);

  useEffect((): void => {
    if (isOpen) {
      setTimeout((): void => inputRef.current?.focus(), 60);
    }
  }, [isOpen]);

  const wasOpenRef = useRef<boolean>(false);
  useEffect((): void => {
    if (wasOpenRef.current && !isOpen) {
      resetState();
    }
    wasOpenRef.current = isOpen;
  }, [isOpen, resetState]);

  useEffect((): (() => void) | void => {
    if (!isOpen) {
      return;
    }
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return (): void => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const q: string = query.trim();
  const allShowsMembers: boolean = q.length > 0;

  const handleQueryChange = (e: ChangeEvent<HTMLInputElement>): void =>
    setQuery(e.target.value);
  const handleClearQuery = (): void => setQuery("");
  const handleBackdropClick = (e: ReactMouseEvent<HTMLDivElement>): void => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const selectClub = (club: SearchClub): void => onSelectClub?.(club);
  const selectMember = (member: SearchMember): void => onSelectMember?.(member);
  const selectSpace = (space: SearchSpace): void => onSelectSpace?.(space);
  const selectCategory = (category: SearchCategory): void =>
    onSelectCategory?.(category);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-16"
      style={{ background: "rgba(0,0,0,0.78)", backdropFilter: "blur(8px)" }}
      onClick={handleBackdropClick}
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
            onChange={handleQueryChange}
            placeholder="Search clubs, spaces, members, or categories"
            className="bg-transparent text-white text-xl font-medium outline-none flex-1 placeholder:text-white/25"
          />
          {query ? (
            <button
              type="button"
              onClick={handleClearQuery}
              className="p-1.5 rounded-lg transition-colors hover:bg-white/10"
            >
              <X size={16} style={{ color: "rgba(255,255,255,0.5)" }} />
            </button>
          ) : null}
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
            {SIDEBAR.map((item: SidebarItem): JSX.Element => {
              const isActive: boolean = tab === item.tab;
              const handleTabClick = (): void => setTab(item.tab);
              return (
                <button
                  type="button"
                  key={item.tab}
                  onClick={handleTabClick}
                  className="flex items-center gap-3 mx-2 px-4 py-2.5 rounded-xl text-[15px] font-semibold text-left transition-colors"
                  style={{
                    background: isActive
                      ? "rgba(255,255,255,0.1)"
                      : "transparent",
                    color: isActive ? "#fff" : "rgba(255,255,255,0.42)",
                  }}
                >
                  <span style={{ opacity: isActive ? 1 : 0.65 }}>
                    {item.icon}
                  </span>
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* ── Right panel ── */}
          <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
            {/* ── Scrollable results ── */}
            <div className="overflow-y-auto flex-1 py-3">
              {isLoading ? (
                <LoadingState />
              ) : (
                <>
                  {/* ════ ALL tab ════ */}
                  {tab === "All" && (
                    <>
                      <SectionLabel>
                        {q ? "Clubs" : "Trending Clubs"}
                      </SectionLabel>
                      {clubs.length === 0 ? (
                        <EmptyState label={`No clubs match "${query}"`} />
                      ) : (
                        clubs.map(
                          (c: SearchClub): JSX.Element => (
                            <ClubRow
                              key={c.id}
                              club={c}
                              onSelect={selectClub}
                            />
                          ),
                        )
                      )}

                      {q && spaces.length > 0 && (
                        <>
                          <Divider />
                          <SectionLabel>Spaces</SectionLabel>
                          {spaces.map(
                            (s: SearchSpace): JSX.Element => (
                              <SpaceRow
                                key={s.id}
                                space={s}
                                onSelect={selectSpace}
                              />
                            ),
                          )}
                        </>
                      )}

                      {q && categories.length > 0 && (
                        <>
                          <Divider />
                          <SectionLabel>Categories</SectionLabel>
                          <div className="grid grid-cols-2 gap-1 px-3">
                            {categories.map(
                              (cat: SearchCategory): JSX.Element => (
                                <CategoryCell
                                  key={cat.id}
                                  category={cat}
                                  onSelect={selectCategory}
                                />
                              ),
                            )}
                          </div>
                        </>
                      )}

                      {allShowsMembers && members.length > 0 && (
                        <>
                          <Divider />
                          <SectionLabel>Members</SectionLabel>
                          {members.map(
                            (m: SearchMember): JSX.Element => (
                              <MemberRow
                                key={m.id}
                                member={m}
                                onSelect={selectMember}
                              />
                            ),
                          )}
                        </>
                      )}
                    </>
                  )}

                  {/* ════ CLUBS tab ════ */}
                  {tab === "Clubs" && (
                    <>
                      <SectionLabel>{q ? "Clubs" : "All Clubs"}</SectionLabel>
                      {clubs.length === 0 ? (
                        <EmptyState label={`No clubs match "${query}"`} />
                      ) : (
                        clubs.map(
                          (c: SearchClub): JSX.Element => (
                            <ClubRow
                              key={c.id}
                              club={c}
                              onSelect={selectClub}
                            />
                          ),
                        )
                      )}
                    </>
                  )}

                  {/* ════ SPACES tab ════ */}
                  {tab === "Spaces" && (
                    <>
                      <SectionLabel>
                        {q ? "Spaces" : "Browse by Location"}
                      </SectionLabel>
                      {spaces.length === 0 ? (
                        <EmptyState label={`No locations match "${query}"`} />
                      ) : (
                        spaces.map(
                          (s: SearchSpace): JSX.Element => (
                            <SpaceRow
                              key={s.id}
                              space={s}
                              onSelect={selectSpace}
                            />
                          ),
                        )
                      )}
                    </>
                  )}

                  {/* ════ MEMBERS tab ════ */}
                  {tab === "Members" && (
                    <>
                      <SectionLabel>
                        {q ? "Members" : "Active Members"}
                      </SectionLabel>
                      {members.length === 0 ? (
                        <EmptyState label={`No members match "${query}"`} />
                      ) : (
                        members.map(
                          (m: SearchMember): JSX.Element => (
                            <MemberRow
                              key={m.id}
                              member={m}
                              onSelect={selectMember}
                            />
                          ),
                        )
                      )}
                    </>
                  )}

                  {/* ════ CATEGORIES tab ════ */}
                  {tab === "Categories" && (
                    <>
                      <SectionLabel>
                        {q ? "Categories" : "Browse Categories"}
                      </SectionLabel>
                      {categories.length === 0 ? (
                        <EmptyState label={`No categories match "${query}"`} />
                      ) : (
                        <div className="grid grid-cols-2 gap-1 px-3">
                          {categories.map(
                            (cat: SearchCategory): JSX.Element => (
                              <CategoryCell
                                key={cat.id}
                                category={cat}
                                onSelect={selectCategory}
                              />
                            ),
                          )}
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>

            {/* ── Keyboard hints footer ── */}
            <div
              className="flex items-center gap-5 px-5 py-2.5"
              style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
            >
              {KEYBOARD_HINTS.map(
                ([key, hint]: readonly [string, string]): JSX.Element => (
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
                ),
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
