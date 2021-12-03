import { Switch } from "@headlessui/react";
import cn from "clsx";
import { MoonIcon, SunIcon } from "@heroicons/react/outline";

import { useTheme } from "next-themes";

export default function Toggle() {
  const { setTheme, theme } = useTheme();

  const isLight = theme === "light";

  return (
    <Switch
      checked={isLight}
      onChange={(value) => setTheme(value ? "light" : "dark")}
      className={cn(
        isLight ? "bg-gray-200" : "bg-gray-500",
        "relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-gray-500"
      )}
    >
      <span className="sr-only">Change color mode</span>
      <span
        className={cn(
          isLight ? "translate-x-5" : "translate-x-0",
          "pointer-events-none relative inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200"
        )}
      >
        <span
          className={cn(
            isLight
              ? "opacity-0 ease-out duration-100"
              : "opacity-100 ease-in duration-200",
            "absolute inset-0 h-full w-full flex items-center justify-center transition-opacity"
          )}
          aria-hidden="true"
        >
          <MoonIcon className="h-3 w-3 text-gray-500" />
        </span>
        <span
          className={cn(
            isLight
              ? "opacity-100 ease-in duration-200"
              : "opacity-0 ease-out duration-100",
            "absolute inset-0 h-full w-full flex items-center justify-center transition-opacity"
          )}
          aria-hidden="true"
        >
          <SunIcon className="h-3 w-3 text-yellow-400" />
        </span>
      </span>
    </Switch>
  );
}
