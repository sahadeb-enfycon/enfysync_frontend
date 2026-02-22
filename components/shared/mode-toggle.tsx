"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={cn(
        "rounded-[50%] text-neutral-900 sm:w-10 sm:h-10 w-8 h-8 bg-gray-200/75 hover:bg-gray-200 focus-visible:ring-0 dark:bg-slate-700 dark:hover:bg-slate-600 border-0 cursor-pointer data-[state=open]:bg-gray-300 dark:data-[state=open]:bg-slate-600"
      )}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
