import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home            from "./pages/Home";
import Auth            from "./pages/Auth";
import Profile         from "./pages/Profile";
import Achievements    from "./pages/Achievements";
import CharacterSelect from "./pages/CharacterSelect";
import Admin           from "./pages/Admin";
import Stats           from "./pages/Stats";

import ProtectedRoute from "./ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/character-select" element={<CharacterSelect />} />

        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/achievements" element={<ProtectedRoute><Achievements /></ProtectedRoute>} />
        <Route path="/stats" element={<ProtectedRoute><Stats /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
