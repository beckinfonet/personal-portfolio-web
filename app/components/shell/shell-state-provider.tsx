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
  accentHue: string; /* default "145"; overridden by AccentBootstrapScript before paint */
}

// --- Action types ---
type ShellAction =
  | { type: "PALETTE_OPEN" }
  | { type: "PALETTE_CLOSE" }
  | { type: "PALETTE_TOGGLE" }
  | { type: "SET_HUE"; hue: string };

function shellReducer(state: ShellState, action: ShellAction): ShellState {
  switch (action.type) {
    case "PALETTE_OPEN":   return { ...state, paletteOpen: true };
    case "PALETTE_CLOSE":  return { ...state, paletteOpen: false };
    case "PALETTE_TOGGLE": return { ...state, paletteOpen: !state.paletteOpen };
    case "SET_HUE":        return { ...state, accentHue: action.hue };
    default:               return state;
  }
}

// --- Context ---
interface ShellContextValue {
  paletteOpen: boolean;
  setOpen: (v: boolean) => void;
  toggle: () => void;
  hue: string;
  setHue: (hue: string) => void;
}

const ShellStateContext = createContext<ShellContextValue | null>(null);

// --- Provider ---
export function ShellStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(shellReducer, {
    paletteOpen: false,
    accentHue: "145"
  });

  const setOpen = useCallback(
    (v: boolean) => dispatch({ type: v ? "PALETTE_OPEN" : "PALETTE_CLOSE" }),
    []
  );
  const toggle = useCallback(() => dispatch({ type: "PALETTE_TOGGLE" }), []);

  // setHue writes through to CSS variable AND localStorage (D-09)
  // localStorage key: "portfolio-accent" (D-09 — separate from "theme" which next-themes owns)
  const setHue = useCallback((hue: string) => {
    document.documentElement.style.setProperty("--accent-hue", hue);
    localStorage.setItem("portfolio-accent", hue);
    dispatch({ type: "SET_HUE", hue });
  }, []);

  return (
    <ShellStateContext.Provider
      value={{ paletteOpen: state.paletteOpen, setOpen, toggle, hue: state.accentHue, setHue }}
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

/** Returns { hue: string, setHue: (hue: string) => void }
 *  setHue writes through to --accent-hue CSS variable + localStorage["portfolio-accent"]
 */
export function useAccent() {
  const { hue, setHue } = useShellState();
  return { hue, setHue };
}
