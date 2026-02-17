import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import OCB from "./pages/OCB";
import OMI from "./pages/OMI";
import Login from "./pages/Login";
import UserOption from "./accountsettings/Useroption";
import UserMapping from "./accountsettings/UserMapping";
import Entities from "./accountsettings/Entities";
import Group from "./accountsettings/Group";
import Role from "./accountsettings/Role";
import Customer from "./accountsettings/CustomerManagement";
import LandingOCB from "./pages/LandingOCB";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login Page */}
        <Route path="/login" element={<Login />} />

        {/* Landing Page after login */}
        <Route path="/landing-ocb" element={<LandingOCB />} />

        {/* Protected Routes (after login) */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="ocb" element={<OCB />} />
          {/* <Route path="omi" element={<OMI />} /> */}
          <Route path="accountsettings/user-option" element={<UserOption />} />
          <Route path="accountsettings/user-mapping" element={<UserMapping />} />
          <Route path="accountsettings/entities" element={<Entities />} />
          <Route path="accountsettings/group" element={<Group />} />
          <Route path="accountsettings/role" element={<Role />} />
          <Route path="accountsettings/customer" element={<Customer />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
