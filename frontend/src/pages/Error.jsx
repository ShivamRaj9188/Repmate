import React from "react";
import { Link } from "react-router-dom";

const Error = () => {
  return (
    <div className="m-0 bg-[#10141a] text-[#e4e6eb] font-inter min-h-[60vh] flex items-center justify-center">
      <main className="text-center py-24 px-8 max-w-2xl mx-auto">
        <h1 className="text-5xl font-bold text-[#3ECF8E] font-orbitron mb-4">
          404: Page Not Found
        </h1>
        <p className="text-xl text-[#c8ccd4] mb-10">
          This page wandered off. Let's get you back on track.
        </p>
        <Link
          to="/"
          className="inline-block bg-[#0066FF] text-white px-6 py-3 font-semibold font-orbitron border border-white/5 shadow-[0_0_6px_rgba(0,102,255,0.3)] rounded-tl-[15px] rounded-br-[15px] rounded-tr-[8px] rounded-bl-[8px] transition-all hover:bg-[#0052cc] hover:text-[#3ECF8E] hover:-translate-y-0.5"
        >
          Back to Home
        </Link>
      </main>
    </div>
  );
};

export default Error;
