import React, { useState, useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Close,
  Dashboard,
  CheckCircle,
  Group,
  ExpandMore,
  ChevronRight,
  Person,
  People,
  Work,
  Handshake,
  LocalShipping,
} from "@mui/icons-material";

import SidebarLinkGroup from "./SidebarLinkGroup";
import logoSrc from "../images/shri-balaji-finance.png";

function Sidebar({ sidebarOpen, setSidebarOpen, variant = "default" }) {
  const location = useLocation();
  const { pathname } = location;

  const trigger = useRef(null);
  const sidebar = useRef(null);

  const storedSidebarExpanded = localStorage.getItem("sidebar-expanded");
  const [sidebarExpanded, setSidebarExpanded] = useState(
    storedSidebarExpanded === null ? false : storedSidebarExpanded === "true"
  );

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!sidebar.current || !trigger.current) return;
      if (
        !sidebarOpen ||
        sidebar.current.contains(target) ||
        trigger.current.contains(target)
      )
        return;
      setSidebarOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  });

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!sidebarOpen || keyCode !== 27) return;
      setSidebarOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  });

  useEffect(() => {
    localStorage.setItem("sidebar-expanded", sidebarExpanded);
    if (sidebarExpanded) {
      document.querySelector("body").classList.add("sidebar-expanded");
    } else {
      document.querySelector("body").classList.remove("sidebar-expanded");
    }
  }, [sidebarExpanded]);

  return (
    <div className="min-w-fit">
      {/* Sidebar backdrop (mobile only) */}
      <div
        className={`fixed inset-0 bg-gray-900/30 backdrop-blur-sm z-40 lg:hidden lg:z-auto transition-opacity duration-200 ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
      ></div>

      {/* Sidebar */}
      <div
        id="sidebar"
        ref={sidebar}
        className={`flex flex-col absolute z-40 left-0 top-0 lg:static lg:left-auto lg:top-auto lg:translate-x-0 h-dvh overflow-y-scroll lg:overflow-y-auto no-scrollbar w-64 lg:w-20 lg:sidebar-expanded:w-64! 2xl:w-64! shrink-0 bg-linear-to-b from-[#F7F6FF] to-white dark:from-[#071126] dark:to-[#0f1724] p-4 rounded-none shadow-md transition-all duration-200 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-64"
        } ${
          variant === "v2"
            ? "border-r border-gray-200 dark:border-gray-700/60"
            : ""
        }`}
      >
        {/* Sidebar header */}
        <div className="flex flex-col items-center justify-between mb-6 pr-3 sm:px-2">
          <div className="w-full flex items-center justify-between">
            {/* Close button */}
            <button
              ref={trigger}
              className="lg:hidden text-gray-500 hover:text-teal-600 p-2 rounded-none hover:bg-teal-50 dark:hover:bg-teal-900/30 focus:outline-none focus:ring-2 focus:ring-teal-400"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-controls="sidebar"
              aria-expanded={sidebarOpen}
            >
              <span className="sr-only">Close sidebar</span>
              <Close className="w-6 h-6" />
            </button>
            <div className="flex-1 text-center">
              <NavLink end to="/" className="block">
                <span className="hidden lg:sidebar-expanded:inline-block 2xl:inline-block text-lg font-semibold text-gray-700 dark:text-gray-100">
                  SRI BALAJI FINANCE
                </span>
              </NavLink>
            </div>
          </div>

          {/* Centered logo below heading */}
          <div className="w-full mt-3 flex justify-center lg:hidden lg:sidebar-expanded:flex">
            <div className="bg-white/90 dark:bg-gray-800/80 rounded-none p-3 flex items-center justify-center shadow-sm">
              <img
                src={logoSrc}
                alt="Shri Balaji Finance"
                width={100}
                height={100}
                className="object-cover rounded-none"
              />
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="space-y-8">
          {/* Pages group */}

          <div>
            <h3 className="text-xs uppercase text-gray-400 dark:text-gray-500 font-semibold pl-3">
              <span
                className="hidden lg:block lg:sidebar-expanded:hidden 2xl:hidden text-center w-6"
                aria-hidden="true"
              >
                •••
              </span>
              <span className="lg:hidden lg:sidebar-expanded:block 2xl:block">
                More
              </span>
            </h3>
            <ul className="mt-3">
              {/* Authentication */}
              <SidebarLinkGroup>
                {(handleClick, open) => {
                  return (
                    <React.Fragment>
                      <a
                        href="#0"
                        className={`group block text-gray-800 dark:text-gray-100 truncate transition duration-150 rounded-none px-2 py-2 ${
                          open
                            ? "bg-teal-50 dark:bg-teal-900/30 text-teal-600"
                            : "hover:bg-teal-50 dark:hover:bg-teal-900/30"
                        } focus:outline-none focus:ring-2 focus:ring-teal-400`}
                        onClick={(e) => {
                          e.preventDefault();
                          handleClick();
                          setSidebarExpanded(true);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <CheckCircle className="w-5 h-5 shrink-0 text-gray-400 dark:text-gray-500" />
                            <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                              Dashboard
                            </span>
                          </div>
                          <ExpandMore
                            className={`w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform ${
                              open && "rotate-180"
                            }`}
                          />
                        </div>
                      </a>
                      <div className="lg:hidden lg:sidebar-expanded:block 2xl:block">
                        <ul
                          className={`pl-8 mt-2 space-y-1 ${!open && "hidden"}`}
                        >
                          <li className="mb-1 last:mb-0">
                            <NavLink
                              end
                              to="/login"
                              className="text-gray-600 hover:text-teal-600 dark:text-gray-300 dark:hover:text-teal-300 transition duration-150 truncate px-2 py-1 rounded-none hover:bg-teal-50 dark:hover:bg-teal-900/30 focus:outline-none focus:ring-2 focus:ring-teal-400"
                            >
                              <span className="text-sm font-medium lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                                Sign in
                              </span>
                            </NavLink>
                          </li>
                          <li className="mb-1 last:mb-0">
                            <NavLink
                              end
                              to="#"
                              className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-200 transition duration-150 truncate"
                            >
                              <span className="text-sm font-medium lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                                Sign up
                              </span>
                            </NavLink>
                          </li>
                          <li className="mb-1 last:mb-0">
                            <NavLink
                              end
                              to="#"
                              className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-200 transition duration-150 truncate"
                            >
                              <span className="text-sm font-medium lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                                Reset Password
                              </span>
                            </NavLink>
                          </li>
                        </ul>
                      </div>
                    </React.Fragment>
                  );
                }}
              </SidebarLinkGroup>
              {/* Onboarding */}
            </ul>

            <ul className="mt-3">
              {/* Authentication */}
              <SidebarLinkGroup>
                {(handleClick, open) => {
                  return (
                    <React.Fragment>
                      <a
                        href="#0"
                        className={`group block text-gray-800 dark:text-gray-100 truncate transition duration-150 rounded-none px-2 py-2 ${
                          open
                            ? "bg-teal-50 dark:bg-teal-900/30 text-teal-600"
                            : "hover:bg-teal-50 dark:hover:bg-teal-900/30"
                        } focus:outline-none focus:ring-2 focus:ring-teal-400`}
                        onClick={(e) => {
                          e.preventDefault();
                          handleClick();
                          setSidebarExpanded(true);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Group className="w-5 h-5 shrink-0 text-gray-400 dark:text-gray-500" />
                            <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                              Master Info
                            </span>
                          </div>
                          <div className="flex shrink-0 ml-2">
                            <ExpandMore
                              className={`w-3 h-3 shrink-0 ml-1 text-gray-400 dark:text-gray-500 transition-transform ${
                                open && "rotate-180"
                              }`}
                            />
                          </div>
                        </div>
                      </a>
                      <div className="lg:hidden lg:sidebar-expanded:block 2xl:block">
                        <ul className={`pl-8 mt-1 ${!open && "hidden"}`}>
                          <li className="mb-1 last:mb-0">
                            <NavLink
                              to="/Main_personal_file"
                              className={({ isActive }) =>
                                `flex items-center ${
                                  isActive
                                    ? "bg-teal-50 dark:bg-teal-900/30 text-teal-600"
                                    : "text-gray-600 dark:text-gray-300"
                                } hover:text-teal-600 transition duration-150 truncate py-1 rounded-none px-2 hover:bg-teal-50 dark:hover:bg-teal-900/30 focus:outline-none focus:ring-2 focus:ring-teal-400`
                              }
                            >
                              <Person className="w-4 h-4 mr-3 text-gray-500" />
                              <span className="text-sm font-medium lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                                Personal Info
                              </span>
                            </NavLink>
                          </li>
                          <li className="mb-1 last:mb-0">
                            <NavLink
                              to="/customer"
                              className={({ isActive }) =>
                                `flex items-center ${
                                  isActive
                                    ? "bg-teal-50 dark:bg-teal-900/30 text-teal-600"
                                    : "text-gray-600 dark:text-gray-300"
                                } hover:text-teal-600 transition duration-150 truncate py-1 rounded-none px-2 hover:bg-teal-50 dark:hover:bg-teal-900/30 focus:outline-none focus:ring-2 focus:ring-teal-400`
                              }
                            >
                              <People className="w-4 h-4 mr-3 text-gray-500" />
                              <span className="text-sm font-medium lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                                Customer
                              </span>
                            </NavLink>
                          </li>
                          <li className="mb-1 last:mb-0">
                            <NavLink
                              to="/employee"
                              className={({ isActive }) =>
                                `flex items-center ${
                                  isActive
                                    ? "bg-teal-50 dark:bg-teal-900/30 text-teal-600"
                                    : "text-gray-600 dark:text-gray-300"
                                } hover:text-teal-600 transition duration-150 truncate py-1 rounded-none px-2 hover:bg-teal-50 dark:hover:bg-teal-900/30 focus:outline-none focus:ring-2 focus:ring-teal-400`
                              }
                            >
                              <Work className="w-4 h-4 mr-3 text-gray-500" />
                              <span className="text-sm font-medium lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                                Employee
                              </span>
                            </NavLink>
                          </li>
                          <li className="mb-1 last:mb-0">
                            <NavLink
                              to="/partner"
                              className={({ isActive }) =>
                                `flex items-center ${
                                  isActive
                                    ? "bg-teal-50 dark:bg-teal-900/30 text-teal-600"
                                    : "text-gray-600 dark:text-gray-300"
                                } hover:text-teal-600 transition duration-150 truncate py-1 rounded-none px-2 hover:bg-teal-50 dark:hover:bg-teal-900/30 focus:outline-none focus:ring-2 focus:ring-teal-400`
                              }
                            >
                              <Handshake className="w-4 h-4 mr-3 text-gray-500" />
                              <span className="text-sm font-medium lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                                Partner
                              </span>
                            </NavLink>
                          </li>
                          <li className="mb-1 last:mb-0">
                            <NavLink
                              to="/vendor"
                              className={({ isActive }) =>
                                `flex items-center ${
                                  isActive
                                    ? "bg-teal-50 dark:bg-teal-900/30 text-teal-600"
                                    : "text-gray-600 dark:text-gray-300"
                                } hover:text-teal-600 transition duration-150 truncate py-1 rounded-none px-2 hover:bg-teal-50 dark:hover:bg-teal-900/30 focus:outline-none focus:ring-2 focus:ring-teal-400`
                              }
                            >
                              <LocalShipping className="w-4 h-4 mr-3 text-gray-500" />
                              <span className="text-sm font-medium lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                                Vendor
                              </span>
                            </NavLink>
                          </li>
                          <li className="mb-1 last:mb-0">
                            <NavLink
                              end
                              to="#"
                              className={({ isActive }) =>
                                `text-sm font-medium ${
                                  isActive
                                    ? "bg-teal-50 dark:bg-teal-900/30 text-teal-600"
                                    : "text-gray-600 dark:text-gray-300"
                                } transition duration-150 truncate px-2 py-1 rounded-none hover:bg-teal-50 dark:hover:bg-teal-900/30 focus:outline-none focus:ring-2 focus:ring-teal-400`
                              }
                            >
                              <span className="text-sm font-medium lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                                Account
                              </span>
                            </NavLink>
                          </li>
                        </ul>

                        <ul
                          className={`pl-8 mt-2 space-y-1 ${!open && "hidden"}`}
                        >
                          <li className="mb-1 last:mb-0">
                            <NavLink
                              to="/login"
                              className={({ isActive }) =>
                                `flex items-center ${
                                  isActive
                                    ? "bg-teal-50 dark:bg-teal-900/30 text-teal-600"
                                    : "text-gray-600 dark:text-gray-300"
                                } hover:text-teal-600 transition duration-150 truncate py-1 rounded-none px-2 hover:bg-teal-50 dark:hover:bg-teal-900/30 focus:outline-none focus:ring-2 focus:ring-teal-400`
                              }
                            >
                              <Person className="w-4 h-4 mr-3 text-gray-500" />
                              <span className="text-sm font-medium lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                                Login
                              </span>
                            </NavLink>
                          </li>
                        </ul>
                      </div>
                    </React.Fragment>
                  );
                }}
              </SidebarLinkGroup>
              {/* Onboarding */}
            </ul>
          </div>
        </div>

        {/* Expand / collapse button */}
        <div className="pt-3 hidden lg:inline-flex 2xl:hidden justify-end mt-auto">
          <div className="w-12 pl-4 pr-3 py-2">
            <button
              className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
              onClick={() => setSidebarExpanded(!sidebarExpanded)}
            >
              <span className="sr-only">Expand / collapse sidebar</span>
              <ChevronRight
                className={`w-4 h-4 shrink-0 text-gray-400 dark:text-gray-500 transition-transform sidebar-expanded:rotate-180`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
