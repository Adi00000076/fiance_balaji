import { lazy } from "react";

// Lazy load components
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Main_personal_file = lazy(() =>
  import("./components/BalajiFinancial/PersonalInfo/Main_personal_file")
);
const Custmer = lazy(() =>
  import("./components/BalajiFinancial/PersonalInfo/Custmer/Custmer")
);
const Employe = lazy(() =>
  import("./components/BalajiFinancial/PersonalInfo/Employe/Employe")
);
const Partner = lazy(() =>
  import("./components/BalajiFinancial/PersonalInfo/Partner/Partner")
);
const Vender = lazy(() =>
  import("./components/BalajiFinancial/PersonalInfo/Vender/Vender")
);
const Login = lazy(() => import("./components/Authentication/Login"));

const routes = [
  {
    path: "/",
    element: Dashboard,
    exact: true,
  },
  {
    path: "/login",
    element: Login,
    exact: true,
  },
  {
    path: "/Main_personal_file",
    element: Main_personal_file,
    exact: true,
  },
  {
    path: "/customer",
    element: Custmer,
    exact: true,
  },
  {
    path: "/employee",
    element: Employe,
    exact: true,
  },
  {
    path: "/partner",
    element: Partner,
    exact: true,
  },
  {
    path: "/vendor",
    element: Vender,
    exact: true,
  },
];

export default routes;
