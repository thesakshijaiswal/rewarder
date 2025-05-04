import { Branding, Avatar, Button } from "../components";
import { MdOutlineLogout } from "react-icons/md";
import { useAuth } from "../contexts/AuthContext";

const Header = () => {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === "admin";

  return (
    <header className="bg-white shadow">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-4 py-6 text-center sm:px-6 md:flex-row md:text-left lg:px-8">
        <Branding />
        <div className="flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
          <div className="flex items-center gap-2 text-gray-700 capitalize">
            <Avatar src={user?.profile?.avatar} size={32} />
            <span>
              Welcome, {user?.username}!
              {!isAdmin && ` (${user?.credits} credits)`}
            </span>
          </div>
          <Button
            className="w-full bg-indigo-600 text-white hover:bg-indigo-700 sm:w-auto"
            btnIcon={MdOutlineLogout}
            onClick={logout}
          >
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;