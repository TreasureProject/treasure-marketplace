import type { ReactNode } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import classNames from "clsx";

type InventoryLayoutProps = {
  children: ReactNode;
  drawer: ReactNode;
};

const tabs = [
  { name: "Collected", href: "/inventory" },
  { name: "Listed", href: "/inventory/listed" },
  { name: "Sold", href: "#" },
];

const InventoryLayout = ({ children, drawer }: InventoryLayoutProps) => {
  const router = useRouter();

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 flex items-stretch overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <div className="pt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="flex-1 text-2xl font-bold text-gray-900">
              Inventory
            </h1>

            <div className="mt-3 sm:mt-2">
              <div className="sm:hidden">
                <label htmlFor="tabs" className="sr-only">
                  Select a tab
                </label>
                <select
                  id="tabs"
                  name="tabs"
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
                  defaultValue="Collected"
                >
                  <option>Collected</option>
                  <option>Listed</option>
                  <option>Sold</option>
                </select>
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center border-b border-gray-200">
                  <nav
                    className="flex-1 -mb-px flex space-x-6 xl:space-x-8"
                    aria-label="Tabs"
                  >
                    {tabs.map((tab) => {
                      const isCurrentTab = router.pathname === tab.href;

                      return (
                        <Link key={tab.name} href={tab.href} passHref>
                          <a
                            aria-current={isCurrentTab ? "page" : undefined}
                            className={classNames(
                              isCurrentTab
                                ? "border-red-500 text-red-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
                              "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
                            )}
                          >
                            {tab.name}
                          </a>
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              </div>
            </div>

            {children}
          </div>
        </main>

        {drawer}
      </div>
    </div>
  );
};

export default InventoryLayout;
