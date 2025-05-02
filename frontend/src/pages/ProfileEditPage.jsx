import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components";
import { toast } from "react-hot-toast";
import { MdSave, MdArrowBack } from "react-icons/md";
import { useNavigate } from "react-router";
import { FaUserCircle } from "react-icons/fa";
import api from "../services/api";

const ProfileEditPage = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    avatar: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user?.profile) {
      setFormData({
        name: user.profile.name || "",
        bio: user.profile.bio || "",
        avatar: user.profile.avatar || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.bio) {
      toast.error("Name and bio are required to complete your profile");
      return;
    }

    try {
      setIsLoading(true);
      await api.put("/profile/update", formData);

      if (!user.profileCompleted) {
        await api.post("/credits/award/profile");
        toast.success("Profile completed! You earned 10 credits!");
      } else {
        toast.success("Profile updated successfully!");
      }

      await refreshUser();
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="mx-auto max-w-2xl px-4">
        <Button
          onClick={() => navigate("/dashboard")}
          className="mb-6 flex items-center bg-slate-800 text-white hover:bg-slate-700"
          btnIcon={MdArrowBack}
        >
          Back
        </Button>

        <div className="rounded-lg bg-white p-8 shadow-md">
          <h1 className="mb-6 text-2xl font-bold text-gray-900">
            Edit Profile
          </h1>

          {!user.profileCompleted && (
            <div className="mb-6 rounded-md bg-yellow-50 p-4 text-yellow-800">
              Complete your profile to earn 10 credits!
            </div>
          )}

          <div className="mb-6 flex justify-center">
            {formData.avatar?.trim() ? (
              <div className="h-24 w-24 overflow-hidden rounded-full border border-gray-300">
                <img
                  src={formData.avatar}
                  alt="User avatar"
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full border border-gray-300">
                <FaUserCircle className="h-full w-full text-gray-400" />{" "}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Full Name*
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="mb-5">
              <label
                htmlFor="bio"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Bio*
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows="4"
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                placeholder="Tell us about yourself..."
                required
              />
            </div>

            <div className="mb-6">
              <label
                htmlFor="avatar"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Avatar URL
              </label>
              <input
                type="text"
                id="avatar"
                name="avatar"
                value={formData.avatar}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                placeholder="Enter avatar URL (optional)"
              />
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                btnIcon={MdSave}
                className="bg-indigo-600 text-white hover:bg-indigo-700"
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Save Profile"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditPage;
