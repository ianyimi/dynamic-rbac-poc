import { createServerFn } from "@tanstack/react-start"
import { getCookie, setCookie } from "@tanstack/react-start/server"
import { z } from "zod"
import { ScriptOnce, useRouter } from "@tanstack/react-router";
import { ComponentPropsWithRef, createContext, use, useEffect } from "react";

export type UserTheme = "light" | "dark" | "system"
export type AppTheme = Exclude<UserTheme, "system">

function getSystemTheme(): AppTheme {
  if (typeof window === 'undefined') return "light"
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

function handleThemeChange(userTheme: UserTheme) {
  const root = document.documentElement
  root.classList.remove("light", "dark", "system")
  const newTheme = userTheme === "system" ? getSystemTheme() : userTheme
  root.classList.add(newTheme)
  if (userTheme === "system") {
    root.classList.add("system")
  }
}

function setupPreferredThemeListener() {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
  const handler = () => handleThemeChange("system")
  mediaQuery.addEventListener("change", handler)
  return () => mediaQuery.removeEventListener("change", handler)
}

const postThemeValidator = z.union([z.literal("light"), z.literal("dark"), z.literal("system")])
type SavedTheme = z.infer<typeof postThemeValidator>
const storageKey = "_preffered-theme"

export const getThemeServerFn = createServerFn().handler(
  async () => (getCookie(storageKey) || "light") as SavedTheme
)

export const setThemeServerFn = createServerFn({ method: "POST" })
  .inputValidator(postThemeValidator)
  .handler(
    async ({ data }) => (setCookie(storageKey, data))
  )

type ThemeContextValue = { appTheme: AppTheme; userTheme: UserTheme; setTheme: (value: UserTheme) => void }
const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children, theme: userTheme }: { theme: UserTheme } & ComponentPropsWithRef<"div">) {
  const router = useRouter()

  function setTheme(value: UserTheme) {
    handleThemeChange(value)
    setThemeServerFn({ data: value }).then(() => router.invalidate())
  }

  useEffect(() => {
    if (userTheme !== "system") return
    return setupPreferredThemeListener()
  }, [userTheme])

  return (
    <ThemeContext value={{ appTheme: userTheme === "system" ? getSystemTheme() : userTheme, userTheme, setTheme }}>
      <ScriptOnce children={themeScript} />
      {children}
    </ThemeContext>
  )
}

export function useTheme() {
  const val = use(ThemeContext)
  if (!val) throw new Error("useTheme called outside of ThemeProvider!")
  return val
}

const themeScript: string = (function () {
  function themeFn() {
    try {
      // Read from cookie to match server-side behavior
      function getCookie(name: string) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
        return undefined
      }

      const storedTheme = getCookie('_preffered-theme') ?? 'light';
      const validTheme = ['light', 'dark', 'system'].includes(storedTheme) ? storedTheme : 'light';

      if (validTheme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        document.documentElement.classList.add(systemTheme, 'system');
      } else {
        document.documentElement.classList.add(validTheme);
      }
    } catch (e) {
      // Fallback to light theme on error
      document.documentElement.classList.add('light');
    }
  }
  return `(${themeFn.toString()})();`;
})();
