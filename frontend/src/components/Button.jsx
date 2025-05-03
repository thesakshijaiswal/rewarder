const Button = ({
  onClick = () => {},
  btnIcon: Icon = null,
  children = "",
  className = "",
  disabled = false,
  type = "button",
}) => {
  return (
    <>
      {(children || Icon) && (
        <button
          type={type}
          onClick={onClick}
          className={`flex items-center justify-center gap-2 rounded-md px-4 py-[6px] text-base shadow-md ${className} ${
            disabled ? "cursor-not-allowed opacity-50" : ""
          }`}
        >
          {Icon && <Icon className="text-xl" />}
          {children}
        </button>
      )}
    </>
  );
};

export default Button;
