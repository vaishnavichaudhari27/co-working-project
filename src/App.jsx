import { Routes, Route } from 'react-router-dom';
import Homepage from './home/Homepage';
import Navbar from './navbar/Navbar';

import AhmedabadPage from './pages/ahmedabad/Ahmedabad';
import BangalorePage from './pages/bangalore/Bangalore';
import BhubaneswarPage from './pages/bhubaneswar/Bhubaneswar';
import ChandigarhPage from './pages/chandigarh/Chandigarh';
import ChennaiPage from './pages/chennai/Chennai';
import CoimbatorePage from './pages/coimbatore/Coimbatore';
import DelhiPage from './pages/delhi/Delhi';
import GoaPage from './pages/goa/Goa';
import GurugramPage from './pages/gurugram/Gurugram';
import GurugramOfficeDetail from './pages/gurugram/OfficeDetail';
import HyderabadPage from './pages/hyderabad/Hyderabad';
import IndorePage from './pages/indore/Indore';
import JaipurPage from './pages/jaipur/Jaipur';
import KochiPage from './pages/kochi/Kochi';
import KolkataPage from './pages/kolkata/Kolkata';
import LucknowPage from './pages/lucknow/Lucknow';
import MumbaiPage from './pages/mumbai/Mumbai';
import NoidaPage from './pages/noida/Noida';
import PunePage from './pages/pune/Pune';
import PuneOfficeDetail from './pages/pune/OfficeDetail';

const App = () => {
  return (
    <div className="w-full min-h-screen overflow-x-hidden flex flex-col bg-white">
      <Navbar />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/coworking/ahmedabad" element={<AhmedabadPage />} />
        <Route path="/coworking/bangalore" element={<BangalorePage />} />
        <Route path="/coworking/bhubaneswar" element={<BhubaneswarPage />} />
        <Route path="/coworking/chandigarh" element={<ChandigarhPage />} />
        <Route path="/coworking/chennai" element={<ChennaiPage />} />
        <Route path="/coworking/coimbatore" element={<CoimbatorePage />} />
        <Route path="/coworking/delhi" element={<DelhiPage />} />
        <Route path="/coworking/goa" element={<GoaPage />} />
        <Route path="/coworking/gurugram" element={<GurugramPage />} />
        <Route path="/coworking/gurugram/:id" element={<GurugramOfficeDetail />} />
        <Route path="/coworking/hyderabad" element={<HyderabadPage />} />
        <Route path="/coworking/indore" element={<IndorePage />} />
        <Route path="/coworking/jaipur" element={<JaipurPage />} />
        <Route path="/coworking/kochi" element={<KochiPage />} />
        <Route path="/coworking/kolkata" element={<KolkataPage />} />
        <Route path="/coworking/lucknow" element={<LucknowPage />} />
        <Route path="/coworking/mumbai" element={<MumbaiPage />} />
        <Route path="/coworking/noida" element={<NoidaPage />} />
        <Route path="/coworking/pune" element={<PunePage />} />
        <Route path="/coworking/pune/:id" element={<PuneOfficeDetail />} />
        <Route path="*" element={<Homepage />} />
      </Routes>
    </div>
  );
};

export default App;