import rewarderLogo from "../assets/rewarder.svg";
const Branding = ({ className = "justify-center" }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img src={rewarderLogo} alt="logo" className="h-10 w-10" />
      <h1 className="text-center text-3xl font-extrabold text-indigo-500">
        Rewarder
      </h1>
    </div>
  );
};

export default Branding;
