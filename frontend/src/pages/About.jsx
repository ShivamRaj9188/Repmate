import React from "react";
import dev1 from "../assets/images/shadow architect.jpg";
import dev2 from "../assets/images/synth whisper.jpg";

const About = () => {
  return (
    <div className="m-0 bg-[#10141a] text-[#e4e6eb] font-inter">
      <main className="max-w-3xl mx-auto mt-16 px-8 text-[#c8ccd4]">
        <h1 className="text-center text-3xl font-bold text-[#3ECF8E] font-orbitron mb-8">
          About RepMate
        </h1>
        <p>
          RepMate is your futuristic fitness companion - an AI-powered system
          that understands your goals, analyzes your inputs, and generates
          smart, personalized workout and diet plans.
        </p>
        <p>
          Whether you are just starting out or pushing through advanced
          training, RepMate adapts to your journey, offering gamified motivation,
          progress tracking, and expert-like feedback.
        </p>
        <p>We believe fitness should be smart, simple, and exciting.</p>
      </main>

      <section className="bg-[#12171e] py-16 text-center px-8">
        <h2 className="text-3xl font-bold text-[#3ECF8E] font-orbitron mb-12">
          Meet the Developers
        </h2>
        <div className="flex flex-wrap justify-center gap-8">
          <div className="group bg-[#1a1f27] border border-[#2c3340] rounded-lg p-6 max-w-xs text-center shadow-[0_0_10px_rgba(0,255,170,0.1)] transition-transform hover:-translate-y-1.5 hover:shadow-[0_0_20px_rgba(0,255,170,0.2)]">
            <img
              src={dev1}
              alt="Shadow Architect"
              className="w-20 h-20 mx-auto rounded-full object-cover mb-4 border-2 border-[#3ECF8E] shadow-[0_0_6px_rgba(62,207,142,0.3)] transition-transform group-hover:scale-150 group-hover:animate-[pulseGlow_1.5s_infinite_ease-in-out]"
            />
            <h3 className="text-[#3ECF8E] font-orbitron font-bold text-xl mb-2">
              Shadow Architect
            </h3>
            <p className="text-[#c8ccd4] text-sm leading-relaxed">
              Silent yet unmistakable, the Shadow Architect moves through code
              the way an artist moves through ink - fluid, focused, and
              deliberate. Calm in presence and bold in thought, he builds
              worlds in silence and lets results speak.
            </p>
          </div>

          <div className="group bg-[#1a1f27] border border-[#2c3340] rounded-lg p-6 max-w-xs text-center shadow-[0_0_10px_rgba(0,255,170,0.1)] transition-transform hover:-translate-y-1.5 hover:shadow-[0_0_20px_rgba(0,255,170,0.2)]">
            <img
              src={dev2}
              alt="Synth Whisper"
              className="w-20 h-20 mx-auto rounded-full object-cover mb-4 border-2 border-[#3ECF8E] shadow-[0_0_6px_rgba(62,207,142,0.3)] transition-transform group-hover:scale-150 group-hover:animate-[pulseGlow_1.5s_infinite_ease-in-out]"
            />
            <h3 className="text-[#3ECF8E] font-orbitron font-bold text-xl mb-2">
              Synth Whisper
            </h3>
            <p className="text-[#c8ccd4] text-sm leading-relaxed">
              Beneath his cozy hoodie and warm smile lives a sharp, curious
              thinker. He connects with ideas, always finding the human
              heartbeat inside the algorithm, bringing clarity and warmth to
              every challenge.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
