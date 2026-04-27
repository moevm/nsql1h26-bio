import { createBrowserRouter } from "react-router";
import Root from "./components/Root";
import Dashboard from "./components/Dashboard";
import Employees from "./components/Employees";
import Logs from "./components/Logs";
import FacilityMap from "./components/FacilityMap";
import ImportExport from "./components/ImportExport";
import Profile from "./components/Profile";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Dashboard },
      { path: "employees", Component: Employees },
      { path: "logs", Component: Logs },
      { path: "map", Component: FacilityMap },
      { path: "import-export", Component: ImportExport },
      { path: "profile", Component: Profile },
    ],
  },
]);