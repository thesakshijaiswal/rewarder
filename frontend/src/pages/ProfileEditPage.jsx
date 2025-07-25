import { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button, Header } from "../components";
import { toast } from "react-hot-toast";
import { MdSave, MdArrowBack, MdCameraAlt } from "react-icons/md";
import { useNavigate } from "react-router";
import { FaUserCircle } from "react-icons/fa";
import { RiDeleteBin6Line } from "react-icons/ri";
import axiosInstance from "../lib/axiosInstance";

const ProfileEditPage = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    avatar: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState("");

  const joiningDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  useEffect(() => {
    if (user?.profile) {
      setFormData({
        name: user.profile.name || "",
        bio: user.profile.bio || "",
        avatar: user.profile.avatar || "",
      });
      setImagePreview(user.profile.avatar || "");
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    try {
      setIsUploadingImage(true);
      const base64 = await convertToBase64(file);
      const response = await axiosInstance.post("/upload", {
        image: base64,
      });

      if (response.data.success !== false) {
        const imageUrl = response.data.image;
        setFormData((prev) => ({
          ...prev,
          avatar: imageUrl,
        }));
        setImagePreview(imageUrl);
        toast.success("Image uploaded successfully!");
      }
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error(error.response?.data?.message || "Failed to upload image");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      avatar: "",
    }));
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.bio) {
      toast.error("Name and bio are required to complete your profile");
      return;
    }

    try {
      setIsLoading(true);
      const response = await axiosInstance.put("/profile/update", formData);

      if (response.data.creditAwarded) {
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
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Button
          onClick={() => navigate("/dashboard")}
          className="mb-6 flex items-center bg-slate-800 text-white hover:bg-slate-700"
          btnIcon={MdArrowBack}
          aria-label="Go back to dashboard"
        >
          Back
        </Button>

        <div
          className="rounded-lg bg-white p-8 shadow-md"
          role="form"
          aria-labelledby="edit-profile-heading"
        >
          <h1
            id="edit-profile-heading"
            className="mb-6 text-2xl font-bold text-gray-900"
          >
            Edit Profile
          </h1>

          {!user.profileCompleted && (
            <div
              className="mb-6 rounded-md bg-yellow-50 p-4 text-yellow-800"
              role="alert"
              aria-live="polite"
            >
              Complete your profile to earn 10 credits!
            </div>
          )}

          <div className="mb-6 flex flex-col items-center">
            <div className="group relative">
              <div className="h-24 w-24 overflow-hidden rounded-full border-2 border-gray-300">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Profile avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gray-100">
                    <FaUserCircle className="h-full w-full text-gray-400" />
                  </div>
                )}
              </div>

              <div
                className="bg-opacity-50 absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black opacity-0 transition-opacity group-hover:opacity-100"
                onClick={handleImageClick}
              >
                <MdCameraAlt className="text-xl text-white" />
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <Button
                type="button"
                onClick={handleImageClick}
                disabled={isUploadingImage}
                className="bg-indigo-600 text-sm text-white hover:bg-indigo-700"
              >
                {isUploadingImage ? "Uploading..." : "Upload Photo"}
              </Button>

              {imagePreview && (
                <Button
                  type="button"
                  onClick={handleRemoveImage}
                  className="bg-red-600 text-white hover:bg-red-700"
                >
                  <RiDeleteBin6Line />
                </Button>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
              aria-label="Upload profile picture"
            />

            <p className="mt-2 text-xs text-gray-500">PNG, JPG up to 5MB</p>
          </div>

          <form onSubmit={handleSubmit} aria-describedby="edit-profile-heading">
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
                aria-required="true"
              />
            </div>

            <div className="mb-6">
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
                aria-required="true"
              />
            </div>

            <div className="mb-8 border-t-1 border-gray-300">
              <h4 className="mt-6 text-lg font-bold">Account Information</h4>
              <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
                <span className="font-medium">Member Since: </span>
                <span>{joiningDate || "N/A"}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
                <span className="font-medium">Account Status: </span>
                <span className="font-semibold text-emerald-600">Active</span>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                btnIcon={MdSave}
                className="bg-indigo-600 text-white hover:bg-indigo-700"
                disabled={isLoading || isUploadingImage}
                aria-disabled={isLoading || isUploadingImage}
                aria-busy={isLoading || isUploadingImage}
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
