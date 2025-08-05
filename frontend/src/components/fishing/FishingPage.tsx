import React, { useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import { FishingUI } from "./FishingUI";
import HorizontalHeader from "../horizontal-gallery/HorizontalHeader";
import AuthModal from "../auth/AuthModal";

export default function FishingPage() {
  const { user, loading, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  if (loading) {
    return (
      <p className="text-center mt-24 text-lg text-gray-400">Checking your session…</p>
    );
  }

  return (
    <>
  <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 9000 }}>
  <HorizontalHeader
    onLogoClick={() => window.location.assign("/")}
    onNavigate={(page) => window.location.assign(`/${page}`)}
  />
</div>


      <div className="flex flex-col justify-center items-center min-h-screen bg-blue-900 pt-20 px-4">
        {!user ? (
          <div className="text-center mt-24">
            <p className="mb-4 text-yellow-300">You must be logged in to fish.</p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Log in
            </button>
          </div>
        ) : (
          <>
            <FishingUI />
            <button
              onClick={logout}
              className="mt-6 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              Log Out
            </button>
          </>
        )}
      </div>

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          centered={true} // center modal on fishing page
        />
      )}
    </>
  );
}
