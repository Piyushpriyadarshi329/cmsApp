import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  LuLayoutDashboard,
  LuBuilding2,
  LuSettings,
  LuLogOut,
  LuX,
  LuBox,
  LuSignature,
} from "react-icons/lu";
import { useAuth } from "../../context/AuthContext.jsx";
import Button from "../Button/Button.jsx";
import Tabs from "../Tabs/Tabs.jsx";
import { IoMenu } from "react-icons/io5";

const NAV_ITEMS = {
  home: {
    to: "/",
    label: "Home",
    icon: LuLayoutDashboard,
    end: true,
  },

  client: {
    to: "client",
    label: "Client",
    icon: LuBuilding2,
    end: false,
  },

  proposal: {
    to: "proposal",
    label: "Proposal",
    icon: LuBuilding2,
    end: false,
  },

  contract: {
    to: "contract",
    label: "Contract",
    icon: LuBuilding2,
    end: false,
  },

  eSign: {
    to: "e-sign",
    label: "E-Sign",
    icon: LuSignature,
    end: false,
  },

  settings: {
    to: "/settings",
    label: "Settings",
    icon: LuSettings,
    end: false,
  },
};

const ROLE_NAVIGATION = {
  FINANCE: [
    "home",
    "client",
    "proposal",
    "contract",
    "settings",
  ],

  LEGAL: [
    "home",
    "client",
    "proposal",
    "contract",
    "eSign",
    "settings",
  ],

  MANAGER: [
    "home",
    "client",
    "proposal",
    "contract",
    "settings",
  ],

  SALES: [
    "home",
    "client",
    "proposal",
    "contract",
    "settings",
  ],
};

export default function Sidebar({
                                  isMobileOpen,
                                  setIsMobileOpen,
                                }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = useMemo(() => {
    const role = user?.role;

    const allowedItems = ROLE_NAVIGATION[role] || [];

    return allowedItems.map((item) => NAV_ITEMS[item]);
  }, [user?.role]);

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
    setIsMobileOpen(false);
  }

  function handleNavigation() {
    setIsMobileOpen(false);
  }

  return (
      <>
        {isMobileOpen && (
            <button
                type="button"
                aria-label="Close sidebar"
                onClick={() => setIsMobileOpen(false)}
                className="fixed inset-0 z-40 bg-black/30 lg:hidden"
            />
        )}

        <aside
            className={`fixed left-0 top-0 z-50 flex h-dvh w-[240px] flex-col overflow-y-auto border-r border-border bg-surface px-4 transition-transform duration-300 ease-in-out ${
                isMobileOpen
                    ? "translate-x-0"
                    : "-translate-x-full"
            } lg:translate-x-0`}
        >
          <div className="flex items-center justify-between px-2 pb-6 pt-5">
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
                <LuBox size={18} />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-text-primary">
                  {user?.firstName}
                </p>

                {user?.email && (
                    <p className="max-w-[170px] truncate text-xs text-text-secondary">
                      {user?.email}
                    </p>
                )}
              </div>
            </div>

            <button
                type="button"
                onClick={() => setIsMobileOpen(false)}
                aria-label="Close sidebar"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-text-secondary hover:bg-primary-light hover:text-primary-text lg:hidden"
            >
              <LuX size={20} />
            </button>
          </div>

          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-text-secondary/70">
            Menu ({user?.role})
          </p>

          <nav className="flex flex-1 flex-col gap-1">
            <Tabs
                tabs={navItems}
                variant="pill"
                fullWidth
                onTabClick={handleNavigation}
            />
          </nav>

          <Button
              variant="secondary"
              className="mb-4 flex w-full items-center justify-center gap-2 !border-primary !text-white"
              onClick={handleLogout}
          >
            <LuLogOut size={16} />
            Logout
          </Button>
        </aside>
        <Button
            className="sm:hidden !fixed !bottom-4 !right-2 !z-20 !w-12 !h-12 !p-0 !rounded-full flex items-center justify-center"
            onClick={() => setIsMobileOpen(true)}
        >
          <IoMenu size={26} />
        </Button>
      </>
  );
}