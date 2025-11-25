import { lazy } from "react";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Main_personal_file = lazy(() =>
  import(
    "./components/BalajiFinancial/Masterinfo/PersonalInfo/Main_personal_file"
  )
);
const Custmer = lazy(() =>
  import("./components/BalajiFinancial/Masterinfo/PersonalInfo/Custmer/Custmer")
);
const Employe = lazy(() =>
  import("./components/BalajiFinancial/Masterinfo/PersonalInfo/Employe/Employe")
);
const Partner = lazy(() =>
  import("./components/BalajiFinancial/Masterinfo/PersonalInfo/Partner/Partner")
);
const Vender = lazy(() =>
  import("./components/BalajiFinancial/Masterinfo/PersonalInfo/Vender/Vender")
);
const Login = lazy(() => import("./components/Authentication/Login"));
const Unauthorized = lazy(() => import("./components/Unauthorized"));

const LoanMainPage = lazy(() =>
  import("./components/BalajiFinancial/Masterinfo/Loans/Loan")
);

const MonthlyFinance = lazy(() =>
  import(
    "./components/BalajiFinancial/Masterinfo/Loans/MonthlyFinance/MonthlyFinance"
  )
);

const DailyFinance = lazy(() =>
  import(
    "./components/BalajiFinancial/Masterinfo/Loans/DailyFinance/DailyFinace"
  )
);

const routes = [
  { path: "/", element: Dashboard, roles: ["user", "admin"], exact: true },
  { path: "/login", element: Login, public: true, exact: true },
  { path: "/unauthorized", element: Unauthorized, public: true, exact: true },

  { path: "/Main_personal_file", element: Main_personal_file, exact: true },
  { path: "/customer", element: Custmer, exact: true },
  { path: "/employee", element: Employe, exact: true },
  { path: "/partner", element: Partner, exact: true },
  { path: "/vendor", element: Vender, exact: true },

  // ⭐ Added Path Param Here
  { path: "/Loan", element: LoanMainPage },

  { path: "/Monthly-Finance", element: MonthlyFinance },
  { path: "/Daily-Finace", element: DailyFinance },
];

export default routes;
