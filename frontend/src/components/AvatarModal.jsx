import React from "react";
import avatar1 from "../assets/avatars/avatar1.jpeg";
import avatar2 from "../assets/avatars/avatar2.png";
import avatar3 from "../assets/avatars/avatar3.png";
import avatar4 from "../assets/avatars/avatar4.png";

const avatars = [avatar1, avatar2, avatar3, avatar4];

const AvatarModal = ({ setAvatar, closeModal }) => {
  return (
    <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50">
      <div className="bg-[#1a1a1a] p-8 rounded-lg shadow-[0_0_12px_#29f5a6] text-center max-w-lg">
        <h3 className="font-orbitron text-xl mb-4">Select Your Avatar</h3>
        <div className="flex flex-wrap justify-center gap-4">
          {avatars.map((src, i) => (
            <img
              key={i}
              src={src}
              onClick={() => {
                setAvatar(src);
                closeModal();
              }}
              className="w-24 h-24 rounded-lg cursor-pointer object-cover border-2 border-transparent hover:scale-110 hover:border-[#3ECF8E] transition"
            />
          ))}
        </div>
        <button
          onClick={closeModal}
          className="mt-6 bg-[#0066FF] text-white px-4 py-2 rounded-tl-[15px] rounded-br-[15px] rounded-tr-[8px] rounded-bl-[8px] font-orbitron hover:bg-[#0052cc] transition"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default AvatarModal;
