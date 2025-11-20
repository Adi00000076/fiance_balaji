import React, { useEffect, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import "./css/style.css";

import "./charts/ChartjsConfig";
import "./App.css"

import routes from "./routes";
import Layout from "./components/Layout";

function App() {
  const location = useLocation();

  useEffect(() => {
    document.querySelector("html").style.scrollBehavior = "auto";
    window.scroll({ top: 0 });
    document.querySelector("html").style.scrollBehavior = "";
  }, [location.pathname]); // triggered on route change

  return (
    <Layout>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          {routes.map((route, index) => (
            <Route
              key={index}
              path={route.path}
              element={<route.element />}
              exact={route.exact}
            />
          ))}
        </Routes>
      </Suspense>
    </Layout>
  );
}

export default App;
