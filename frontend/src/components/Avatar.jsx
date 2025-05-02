import { FaUserCircle } from "react-icons/fa";

const Avatar = ({ src, alt = "User avatar", size = 32 }) => {
  const dimension = `${size}px`;

  const isValid = src?.trim();

  return isValid ? (
    <img
      src={src}
      alt={alt}
      className="rounded-full border border-gray-300 object-cover"
      style={{ width: dimension, height: dimension }}
      onError={(e) => {
        e.target.onerror = null;
        e.target.style.display = "none";
      }}
    />
  ) : (
    <FaUserCircle
      className="text-gray-400"
      style={{ width: dimension, height: dimension }}
    />
  );
};

export default Avatar;
