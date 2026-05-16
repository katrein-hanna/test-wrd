import { useState } from "react";
import Splash from "./components/Splash";
import HomePage from "./pages/HomePage";
import { Route, Routes } from "react-router-dom";
import MenuSectionPage from "./pages/MenuSectionPage";

function App() {
  const [ready, setReady] = useState(false);
  return (
    <>
      {!ready && (
        <Splash logoSrc="/assets/logo.webp" onFinish={() => setReady(true)} />
      )}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/menu/:sectionId" element={<MenuSectionPage />} />
        <Route path="*" element={<div className="p-6">Not Found</div>} />
      </Routes>
    </>
  );
}

export default App;
