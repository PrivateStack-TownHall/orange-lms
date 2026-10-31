import React from "react";

const Avatar = ({ src, name = "", size = "md" }) => {
  const sizes = {
    xs: "h-8 w-8 text-xs",
    sm: "h-10 w-10 text-sm",
    md: "h-12 w-12 text-base",
    lg: "h-16 w-16 text-lg",
    xl: "h-24 w-24 text-2xl",
  };

  const initials = name
    ?.split(" ")
    ?.map((word) => word[0])
    ?.join("")
    ?.slice(0, 2)
    ?.toUpperCase();

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`
          rounded-full object-cover
          ${sizes[size]}
        `}
      />
    );
  }

  return (
    <div
      className={`
        flex items-center justify-center
        rounded-full
        bg-orange-100
        font-semibold
        text-orange-700
        ${sizes[size]}
      `}
    >
      {initials || "U"}
    </div>
  );
};

export default Avatar;
