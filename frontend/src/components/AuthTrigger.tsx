import { useState } from 'react';
import AuthModal from './AuthModal';
import { useAuth } from './AuthContext';

const AuthTrigger = () => {
  const [showModal, setShowModal] = useState(false);
  const { user, loading, logout } = useAuth();

  if (loading) return null;

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-black">Hi, {user.email}</span>
        <button
          onClick={logout}
          className="text-blue-600 hover:underline"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="text-blue-600 hover:underline"
      >
        Login or Sign Up
      </button>
      {showModal && <AuthModal onClose={() => setShowModal(false)} />}
    </>
  );
};

export default AuthTrigger;