import React from "react";

const Button = ({ as: Comp = "button", className = "", ...props }) => {
  return (
    <Comp
      className={
        "btn-primary rounded-tl-[15px] rounded-br-[15px] rounded-tr-[8px] rounded-bl-[8px] transition " +
        className
      }
      {...props}
    />
  );
};

export default Button;
