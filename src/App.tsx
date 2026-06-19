import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import SeedList from "@/pages/SeedList";
import SeedDetail from "@/pages/SeedDetail";
import SeedNew from "@/pages/SeedNew";
import ExchangeHall from "@/pages/ExchangeHall";
import MyExchange from "@/pages/MyExchange";
import PlantingList from "@/pages/PlantingList";
import PlantingDetail from "@/pages/PlantingDetail";
import PlantingNew from "@/pages/PlantingNew";
import Statistics from "@/pages/Statistics";
import Profile from "@/pages/Profile";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/seeds" element={<SeedList />} />
          <Route path="/seeds/:id" element={<SeedDetail />} />
          <Route path="/seeds/new" element={<SeedNew />} />
          <Route path="/exchange" element={<ExchangeHall />} />
          <Route path="/exchange/my" element={<MyExchange />} />
          <Route path="/planting" element={<PlantingList />} />
          <Route path="/planting/:id" element={<PlantingDetail />} />
          <Route path="/planting/new" element={<PlantingNew />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </Router>
  );
}
