import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  X,
  Package,
  ShoppingCart,
  Users,
  LineChart,
  Folder,
  Tv2,
} from "lucide-react";

type SidebarProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

type NavItem =
  | {
      title: string;
      icon: any;
      hasDropdown: false;
      to: string;
      badge?: number;
    }
  | {
      title: string;
      icon: any;
      hasDropdown: true;
      dropdownItems: {
        label: string;
        to: string;
        badge?: number;
        is_show?: boolean;
      }[];
    };

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const [activeDropdown, setActiveDropdown] = useState<string>("");
  const [isHovering, setIsHovering] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isExpanded = isOpen || isHovering;

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const navItems: NavItem[] = [
    {
      title: "Dashboard",
      icon: LineChart,
      hasDropdown: false,
      to: "/dashboard",
    },
    {
      title: "POS",
      icon: Tv2,
      hasDropdown: false,
      to: "/pos",
    },
    {
      title: "Orders",
      icon: ShoppingCart,
      hasDropdown: false,
      to: "/orders",
    },
    {
      title: "Customers",
      icon: Users,
      hasDropdown: false,
      to: "/customers",
    },
    {
      title: "Products",
      icon: Package,
      hasDropdown: true,
      dropdownItems: [
        { label: "All Products", to: "/products", is_show: true },
        { label: "Add Product", to: "/products/new", is_show: true },
      ],
    },
    {
      title: "Categories",
      icon: Folder,
      hasDropdown: true,
      dropdownItems: [
        { label: "All categories", to: "/categories", is_show: true },
        { label: "Add category", to: "/category/new", is_show: true },
        {
          label: "Category edit (hidden)",
          to: "/category/edit",
          is_show: false,
        },
        {
          label: "Category view (hidden)",
          to: "/category/view",
          is_show: false,
        },
      ],
    },
  ];

  // Auto-open dropdown that contains current route
  useEffect(() => {
    for (const item of navItems) {
      if (item.hasDropdown) {
        const match = item.dropdownItems.some(
          (dropdownItem) =>
            location.pathname === dropdownItem.to ||
            location.pathname.startsWith(dropdownItem.to + "/"),
        );
        if (match) {
          setActiveDropdown(item.title);
          return;
        }
      }
    }
    setActiveDropdown("");
  }, [location.pathname]);

  // Close sidebar when clicking on mobile
  const handleNavigation = (to: string) => {
    navigate(to);
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(false);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.querySelector("aside");
      if (
        sidebar &&
        !sidebar.contains(event.target as Node) &&
        window.innerWidth < 1024
      ) {
        setIsOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setIsOpen]);

  const renderBadge = (count?: number) => {
    if (!count) return null;
    return (
      <span className="bg-red-500 text-white text-xs rounded-full min-w-5 h-5 flex items-center justify-center px-1.5 transform transition-all duration-200 scale-100 hover:scale-110">
        {count > 99 ? "99+" : count}
      </span>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-all duration-300 ease-out ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible lg:invisible"
        } ${isMounted ? "transition-opacity" : ""}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700
          flex flex-col
          ${isExpanded ? "w-64" : "w-16"}
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          transition-all duration-300 ease-out
          shadow-xl lg:shadow-lg
          overflow-hidden
        `}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Header */}
        <div className="shrink-0 p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className={`flex items-center transition-all duration-300`}>
              <div className="w-8 h-8 bg-linear-to-br from-slate-900 to-blue-900 rounded-lg flex items-center justify-center shadow-sm transform transition-transform duration-200 hover:scale-105">
                <img
                  src="/brand-images/logo.jpg"
                  alt="SH.SALE"
                  className="w-6 h-6 rounded transform transition-transform duration-200 hover:rotate-12"
                />
              </div>
              <h1
                className={`
                  ml-3 font-bold text-xl text-slate-900 dark:text-white whitespace-nowrap 
                  transition-all duration-300 ease-out
                  ${isExpanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}
                  ${isExpanded ? "delay-150" : "delay-0"}
                `}
              >
                SH.SALE
              </h1>
            </div>

            {isOpen && (
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 transform hover:rotate-90 active:scale-95"
                aria-label="Toggle sidebar"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 transition-all duration-300">
          {navItems.map((item, index) => {
            const isActive = item.hasDropdown
              ? item.dropdownItems.some(
                  (dropdownItem) =>
                    location.pathname === dropdownItem.to ||
                    location.pathname.startsWith(dropdownItem.to + "/"),
                )
              : location.pathname === item.to ||
                location.pathname.startsWith(item.to + "/");

            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="mb-1"
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                {/* Main Nav Item */}
                <div
                  className={`
                    mx-2 rounded-lg cursor-pointer
                    transform transition-all duration-200 ease-out
                    ${
                      isActive
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    }
                    hover:scale-[1.02] active:scale-[0.98]
                    ${isExpanded ? "" : "hover:translate-x-1"}
                    ${isActive ? "shadow-sm" : ""}
                  `}
                >
                  <div
                    className="flex items-center justify-between p-3"
                    onClick={() => {
                      if (item.hasDropdown && isExpanded) {
                        setActiveDropdown(
                          activeDropdown === item.title ? "" : item.title,
                        );
                      } else if (!item.hasDropdown) {
                        handleNavigation(item.to);
                      } else if (!isExpanded) {
                        handleNavigation(item.dropdownItems[0].to);
                      }
                    }}
                  >
                    <div className="flex items-center min-w-0">
                      <Icon
                        size={20}
                        className={`
                          shrink-0 transform transition-all duration-200
                          ${
                            isActive
                              ? "text-blue-600 dark:text-blue-400 scale-110"
                              : "text-gray-600 dark:text-gray-400"
                          }
                          group-hover:scale-110
                        `}
                      />

                      <span
                        className={`
                          ml-3 font-medium whitespace-nowrap
                          transition-all duration-300 ease-out
                          ${
                            isExpanded
                              ? "opacity-100 translate-x-0"
                              : "opacity-0 -translate-x-4"
                          }
                          ${isExpanded ? "delay-100" : "delay-0"}
                        `}
                      >
                        {item.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {!item.hasDropdown && renderBadge(item.badge)}

                      {item.hasDropdown && isExpanded && (
                        <ChevronDown
                          size={16}
                          className={`
                            transition-all duration-200 ease-out
                            ${activeDropdown === item.title ? "rotate-180" : ""}
                            ${isExpanded ? "delay-100" : ""}
                          `}
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Dropdown Items */}
                {item.hasDropdown &&
                  isExpanded &&
                  activeDropdown === item.title && (
                    <div
                      className="mt-1 ml-4 overflow-hidden"
                      style={{
                        animation: "slideDown 0.3s ease-out",
                      }}
                    >
                      {item.dropdownItems
                        .filter((dropdownItem) => dropdownItem.is_show)
                        .map((dropdownItem, dropdownIndex) => {
                          const isDropdownItemActive =
                            location.pathname === dropdownItem.to;
                          return (
                            <div
                              key={dropdownItem.label}
                              className={`
                              mx-2 rounded-lg cursor-pointer mb-1
                              transform transition-all duration-200 ease-out
                              ${
                                isDropdownItemActive
                                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
                              }
                              hover:translate-x-1
                              hover:scale-[1.01]
                              opacity-0
                              animate-fadeInUp
                            `}
                              onClick={() => handleNavigation(dropdownItem.to)}
                              style={{
                                animationDelay: `${dropdownIndex * 50}ms`,
                                animationFillMode: "forwards",
                              }}
                            >
                              <div className="flex items-center justify-between p-2 pl-8">
                                <span className="text-sm font-medium whitespace-nowrap transition-colors duration-200">
                                  {dropdownItem.label}
                                </span>
                                {renderBadge(dropdownItem.badge)}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
              </div>
            );
          })}
        </nav>
      </aside>

      <style>{`
        @keyframes slideDown {
          from {
            max-height: 0;
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            max-height: 200px;
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out forwards;
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.2s ease-out forwards;
        }

        .animate-slideIn {
          animation: slideIn 0.3s ease-out forwards;
        }
      `}</style>
    </>
  );
}
