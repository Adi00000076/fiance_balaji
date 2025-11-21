import React, { useEffect, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import "./css/style.css";

import "./charts/ChartjsConfig";
import "./App.css";

import routes from "./routes";
import PrivateRoute from "./components/PrivateRoute";
import Layout from "./components/Layout";

import LoadingSpinner from "./LoadingSpinner";

function App() {
  const location = useLocation();

  useEffect(() => {
    document.querySelector("html").style.scrollBehavior = "auto";
    window.scroll({ top: 0 });
    document.querySelector("html").style.scrollBehavior = "";
  }, [location.pathname]); // triggered on route change

  return (
    <Layout>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {routes.map((route, index) => {
            if (route.path === "/login") {
              return (
                <Route
                  key={index}
                  path={route.path}
                  element={<route.element />}
                  exact={route.exact}
                />
              );
            }
            return (
              <Route
                key={index}
                path={route.path}
                element={
                  <PrivateRoute>
                    <route.element />
                  </PrivateRoute>
                }
                exact={route.exact}
              />
            );
          })}
        </Routes>
      </Suspense>
    </Layout>
  );
}

export default App;
