"use client";

import {
  createContext,
  useCallback,
  useContext,
  useReducer,
  type ReactNode
} from "react";

// --- State shape ---
interface ShellState {
  paletteOpen: boolean;
  drawerOpen: boolean;
  accentHue: string; /* default "145"; overridden by AccentBootstrapScript before paint */
}

// --- Action types ---
type ShellAction =
  | { type: "PALETTE_OPEN" }
  | { type: "PALETTE_CLOSE" }
  | { type: "PALETTE_TOGGLE" }
  | { type: "DRAWER_OPEN" }
  | { type: "DRAWER_CLOSE" }
  | { type: "DRAWER_TOGGLE" }
  | { type: "SET_HUE"; hue: string };

function shellReducer(state: ShellState, action: ShellAction): ShellState {
  switch (action.type) {
    case "PALETTE_OPEN":   return { ...state, paletteOpen: true, drawerOpen: false };
    case "PALETTE_CLOSE":  return { ...state, paletteOpen: false };
    case "PALETTE_TOGGLE": {
      const next = !state.paletteOpen;
      return { ...state, paletteOpen: next, drawerOpen: next ? false : state.drawerOpen };
    }
    case "DRAWER_OPEN":   return { ...state, drawerOpen: true, paletteOpen: false };
    case "DRAWER_CLOSE":  return { ...state, drawerOpen: false };
    case "DRAWER_TOGGLE": {
      const next = !state.drawerOpen;
      return { ...state, drawerOpen: next, paletteOpen: next ? false : state.paletteOpen };
    }
    case "SET_HUE":        return { ...state, accentHue: action.hue };
    default:               return state;
  }
}

// --- Context ---
interface ShellContextValue {
  paletteOpen: boolean;
  drawerOpen: boolean;
  setOpen: (v: boolean) => void;
  toggle: () => void;
  setDrawerOpen: (v: boolean) => void;
  toggleDrawer: () => void;
  hue: string;
  setHue: (hue: string) => void;
}

const ShellStateContext = createContext<ShellContextValue | null>(null);

// --- Provider ---
export function ShellStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(shellReducer, {
    paletteOpen: false,
    drawerOpen: false,
    accentHue: "145"
  });

  const setOpen = useCallback(
    (v: boolean) => dispatch({ type: v ? "PALETTE_OPEN" : "PALETTE_CLOSE" }),
    []
  );
  const toggle = useCallback(() => dispatch({ type: "PALETTE_TOGGLE" }), []);

  const setDrawerOpen = useCallback(
    (v: boolean) => dispatch({ type: v ? "DRAWER_OPEN" : "DRAWER_CLOSE" }),
    []
  );
  const toggleDrawer = useCallback(() => dispatch({ type: "DRAWER_TOGGLE" }), []);

  // setHue writes through to CSS variable AND localStorage (D-09)
  // localStorage key: "portfolio-accent" (D-09 — separate from "theme" which next-themes owns)
  const setHue = useCallback((hue: string) => {
    document.documentElement.style.setProperty("--accent-hue", hue);
    localStorage.setItem("portfolio-accent", hue);
    dispatch({ type: "SET_HUE", hue });
  }, []);

  return (
    <ShellStateContext.Provider
      value={{
        paletteOpen: state.paletteOpen,
        drawerOpen: state.drawerOpen,
        setOpen,
        toggle,
        setDrawerOpen,
        toggleDrawer,
        hue: state.accentHue,
        setHue
      }}
    >
      {children}
    </ShellStateContext.Provider>
  );
}

// --- Hooks ---
function useShellState(): ShellContextValue {
  const ctx = useContext(ShellStateContext);
  if (!ctx) throw new Error("useShellState must be used inside ShellStateProvider");
  return ctx;
}

/** Returns { open: boolean, setOpen: (v: boolean) => void, toggle: () => void } */
export function usePalette() {
  const { paletteOpen, setOpen, toggle } = useShellState();
  return { open: paletteOpen, setOpen, toggle };
}

/** Returns { open: boolean, setOpen: (v: boolean) => void, toggle: () => void } */
export function useDrawer() {
  const { drawerOpen, setDrawerOpen, toggleDrawer } = useShellState();
  return { open: drawerOpen, setOpen: setDrawerOpen, toggle: toggleDrawer };
}

/** Returns { hue: string, setHue: (hue: string) => void }
 *  setHue writes through to --accent-hue CSS variable + localStorage["portfolio-accent"]
 */
export function useAccent() {
  const { hue, setHue } = useShellState();
  return { hue, setHue };
}
