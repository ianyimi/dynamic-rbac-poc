import { Moon, Sun, SunMoon } from "lucide-react";
import { type ComponentPropsWithRef } from "react";

import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "~/components/ui/dropdown-menu";
import { useTheme } from "~/lib/theme";

export function ThemeToggle({ ...divProps }: ComponentPropsWithRef<"div">) {
  const { setTheme, userTheme } = useTheme()

  return (
    <div {...divProps}>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button size="icon" variant="outline" />}>
          {userTheme === "system" ? (
            <SunMoon className="h-[1.2rem] w-[1.2rem]" />
          ) : (
            <>
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </>
          )}
          <span className="sr-only">Toggle theme</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem
            checked={userTheme === "light"}
            disabled={userTheme === "light"}
            onCheckedChange={(val) => {
              if (val) {
                setTheme("light")
              }
            }}
          >
            Light
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={userTheme === "dark"}
            disabled={userTheme === "dark"}
            onCheckedChange={(val) => {
              if (val) {
                setTheme("dark")
              }
            }}
          >
            Dark
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={userTheme === "system"}
            disabled={userTheme === "system"}
            onCheckedChange={(val) => {
              if (val) {
                setTheme("system")
              }
            }}
          >
            System
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div >
  )
}
