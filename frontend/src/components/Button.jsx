const Button = ({
  onClick = () => {},
  btnIcon: Icon = null,
  children = "",
  className = "",
}) => {
  return (
    <>
      {(children || Icon) && (
        <button
          onClick={onClick}
          className={`flex items-center justify-center gap-2 rounded-md px-4 py-[6px] text-base shadow-md ${className}`}
        >
          {Icon && <Icon className="text-xl" />}
          {children}
        </button>
      )}
    </>
  );
};

export default Button;
