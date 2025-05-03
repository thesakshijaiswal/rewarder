import { useState } from "react";
import PropTypes from "prop-types";
import { Button } from "../components";
import { LuUserRoundSearch } from "react-icons/lu";

const UserCreditsForm = ({ users = [], onAdjustCredits }) => {
  const [selectedUserId, setSelectedUserId] = useState("");
  const [creditAmount, setCreditAmount] = useState(0);
  const [description, setDescription] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredUsers = (users || []).filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedUserId) {
      alert("Please select a user");
      return;
    }

    if (creditAmount === 0) {
      alert("Credit amount cannot be zero");
      return;
    }

    setIsSubmitting(true);
    try {
      await onAdjustCredits(selectedUserId, creditAmount, description);
      setCreditAmount(0);
      setDescription("");
    } catch (error) {
      console.error("Error in credit adjustment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedUser = users.find((user) => user._id === selectedUserId);

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <div className="rounded-lg bg-gray-50 p-4 md:col-span-1">
        <h3 className="mb-3 font-medium">Select User</h3>

        <div className="relative mb-4">
          <LuUserRoundSearch className="absolute top-3 left-2 text-gray-500" />
          <input
            type="text"
            placeholder="Search users..."
            className="w-full rounded border px-8 py-2"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="max-h-96 overflow-y-auto rounded border bg-white">
          {filteredUsers.map((user) => (
            <div
              key={user._id}
              className={`cursor-pointer border-b p-3 ${
                selectedUserId === user._id
                  ? "bg-indigo-50"
                  : "hover:bg-gray-50"
              }`}
              onClick={() => setSelectedUserId(user._id)}
            >
              <div className="font-medium">{user.username}</div>
              <div className="text-sm text-gray-600">{user.email}</div>
              <div className="mt-1 text-sm">
                Credits: <span className="font-semibold">{user.credits}</span>
              </div>
            </div>
          ))}
          {filteredUsers.length === 0 && (
            <div className="p-4 text-center text-gray-500">No users found</div>
          )}
        </div>
      </div>

      <div className="md:col-span-2">
        <h3 className="mb-4 font-medium">Adjust Credits</h3>

        {selectedUser ? (
          <div className="mb-6 rounded-lg border bg-indigo-50 p-4">
            <div className="mb-1 font-medium">{selectedUser.username}</div>
            <div className="mb-1 text-sm text-gray-600">
              {selectedUser.email}
            </div>
            <div>
              Current Credits:{" "}
              <span className="font-semibold">{selectedUser.credits}</span>
            </div>
          </div>
        ) : (
          <div className="mb-6 rounded-lg bg-gray-50 p-4 text-center text-gray-500">
            Select a user to adjust their credits
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="mb-1 block text-gray-700">Credit Amount</label>
            <div className="flex items-center">
              <select
                className="w-16 rounded-l border p-2"
                value={creditAmount >= 0 ? "+" : "-"}
                onChange={(e) =>
                  setCreditAmount(
                    e.target.value === "+"
                      ? Math.abs(creditAmount)
                      : -Math.abs(creditAmount),
                  )
                }
              >
                <option value="+">+</option>
                <option value="-">-</option>
              </select>
              <input
                type="number"
                className="flex-1 rounded-r border-y border-r p-2"
                value={Math.abs(creditAmount)}
                onChange={(e) => {
                  const absValue = Math.abs(parseInt(e.target.value) || 0);
                  setCreditAmount(creditAmount >= 0 ? absValue : -absValue);
                }}
                min="0"
                required
              />
            </div>
            <div className="mt-1 text-sm text-gray-500">
              {selectedUser ? (
                <span>
                  New balance will be:{" "}
                  <span className="font-medium">
                    {selectedUser.credits + (parseInt(creditAmount) || 0)}
                  </span>
                </span>
              ) : null}
            </div>
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-gray-700">
              Description (optional)
            </label>
            <textarea
              className="w-full rounded border p-2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Reason for credit adjustment"
              rows="3"
            ></textarea>
          </div>

          <Button
            type="submit"
            onClick={(e) => {
              e.preventDefault();
              handleSubmit(e);
            }}
            className="bg-slate-800 text-white hover:bg-slate-700"
            disabled={!selectedUserId || isSubmitting || creditAmount === 0}
          >
            {isSubmitting ? "Processing..." : "Adjust Credits"}
          </Button>
        </form>
      </div>
    </div>
  );
};

UserCreditsForm.propTypes = {
  users: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      username: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
      credits: PropTypes.number.isRequired,
    }),
  ),
  onAdjustCredits: PropTypes.func.isRequired,
};

UserCreditsForm.defaultProps = {
  users: [],
};

export default UserCreditsForm;
