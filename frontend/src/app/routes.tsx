import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import Root from "./components/Root";
import Dashboard from "./components/Dashboard";
import Employees from "./components/Employees";
import Logs from "./components/Logs";
import FacilityMap from "./components/FacilityMap";
import ImportExport from "./components/ImportExport";
import Profile from "./components/Profile";
import Login from "./components/Login";
import { getToken } from "./api/client";

function ProtectedLayout() {
  if (!getToken()) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: <ProtectedLayout />,
    children: [
      {
        element: <Root />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: "people", element: <Employees /> },
          { path: "events", element: <Logs /> },
          { path: "map", element: <FacilityMap /> },
          { path: "import-export", element: <ImportExport /> },
          { path: "profile", element: <Profile /> },
        ],
      },
    ],
  },
]);
