import { type ComponentPropsWithRef } from 'react'
import { Moon, Sun, SunMoon } from 'lucide-react'

import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { useTheme } from '~/lib/theme'

export function ThemeToggle({ ...divProps }: ComponentPropsWithRef<'div'>) {
  const { setTheme, userTheme } = useTheme()

  return (
    <div {...divProps}>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button size="icon" variant="outline" />}>
          {userTheme === 'system' ? (
            <SunMoon className="h-[1.2rem] w-[1.2rem]" />
          ) : (
            <>
              <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
            </>
          )}
          <span className="sr-only">Toggle theme</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem
            checked={userTheme === 'light'}
            disabled={userTheme === 'light'}
            onCheckedChange={(val) => {
              if (val) {
                setTheme('light')
              }
            }}
          >
            Light
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={userTheme === 'dark'}
            disabled={userTheme === 'dark'}
            onCheckedChange={(val) => {
              if (val) {
                setTheme('dark')
              }
            }}
          >
            Dark
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={userTheme === 'system'}
            disabled={userTheme === 'system'}
            onCheckedChange={(val) => {
              if (val) {
                setTheme('system')
              }
            }}
          >
            System
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
