import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import Root from "./components/Root";
import Dashboard from "./components/Dashboard";
import Employees from "./components/Employees";
import Logs from "./components/Logs";
import FacilityMap from "./components/FacilityMap";
import ImportExport from "./components/ImportExport";
import Profile from "./components/Profile";
import Login from "./components/Login";
import Groups from "./components/Groups";
import Zones from "./components/Zones";
import Devices from "./components/Devices";
import PersonDetail from "./components/PersonDetail";
import ZoneDetail from "./components/ZoneDetail";
import DeviceDetail from "./components/DeviceDetail";
import GroupDetail from "./components/GroupDetail";
import Policies from "./components/Policies";
import { getToken } from "./api/client";

function ProtectedLayout() {
  if (!getToken()) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  {
    path: "/",
    element: <ProtectedLayout />,
    children: [
      {
        element: <Root />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: "people", element: <Employees /> },
          { path: "people/:id", element: <PersonDetail /> },
          { path: "groups", element: <Groups /> },
          { path: "groups/:id", element: <GroupDetail /> },
          { path: "zones", element: <Zones /> },
          { path: "zones/:id", element: <ZoneDetail /> },
          { path: "devices", element: <Devices /> },
          { path: "devices/:id", element: <DeviceDetail /> },
          { path: "policies", element: <Policies /> },
          { path: "events", element: <Logs /> },
          { path: "map", element: <FacilityMap /> },
          { path: "import-export", element: <ImportExport /> },
          { path: "profile", element: <Profile /> },
        ],
      },
    ],
  },
]);