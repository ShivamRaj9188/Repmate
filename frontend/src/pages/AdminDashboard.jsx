import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col font-inter bg-[#0d0d0d] text-white">
      <div className="flex flex-1">
        <aside className="w-[260px] bg-white/5 border-t border-r border-b border-[#42f5b940] p-5 h-screen sticky top-0 flex flex-col justify-between">
          <ul className="flex-1 p-0 m-0">
            <li className="mb-5 text-white font-orbitron text-lg hover:text-[#3ECF8E]">
              Dashboard
            </li>
            <li className="mb-5 text-white font-orbitron text-lg hover:text-[#3ECF8E]">
              Trainee List
            </li>
            <li className="mb-5 text-white font-orbitron text-lg hover:text-[#3ECF8E]">
              Progress
            </li>
            <li className="mb-5 text-white font-orbitron text-lg hover:text-[#3ECF8E]">
              Plans Library
            </li>
            <li className="mb-5 text-white font-orbitron text-lg hover:text-[#3ECF8E]">
              Messages
            </li>
          </ul>
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="text-[#ff4f4f] border-2 border-[#ff4f4f] font-bold rounded-tl-[15px] rounded-br-[15px] rounded-tr-[8px] rounded-bl-[8px] p-3 mt-auto mb-2 w-full hover:bg-[#ff4f4f] hover:text-black font-orbitron transition"
          >
            Logout
          </button>
        </aside>

        <main className="flex-1 p-8 overflow-y-auto">
          <section className="mb-10">
            <h2 className="font-orbitron text-xl font-bold text-[#3ECF8E] mb-4">
              Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#1a1f27] p-6 rounded-xl border-2 border-[#2c3340] shadow-md hover:-translate-y-1.5 hover:shadow-[0_12px_24px_rgba(0,255,170,0.15)] hover:border-[#3ECF8E] transition">
                <h3 className="font-orbitron text-lg text-[#0066FF]">Total Trainees</h3>
                <p className="text-3xl font-bold mt-2">25</p>
              </div>
              <div className="bg-[#1a1f27] p-6 rounded-xl border-2 border-[#2c3340] shadow-md hover:-translate-y-1.5 hover:shadow-[0_12px_24px_rgba(0,255,170,0.15)] hover:border-[#3ECF8E] transition">
                <h3 className="font-orbitron text-lg text-[#0066FF]">Active Plans</h3>
                <p className="text-3xl font-bold mt-2">18</p>
              </div>
              <div className="bg-[#1a1f27] p-6 rounded-xl border-2 border-[#2c3340] shadow-md hover:-translate-y-1.5 hover:shadow-[0_12px_24px_rgba(0,255,170,0.15)] hover:border-[#3ECF8E] transition">
                <h3 className="font-orbitron text-lg text-[#0066FF]">Avg Streak</h3>
                <p className="text-3xl font-bold mt-2">12 days</p>
              </div>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="font-orbitron text-xl font-bold text-[#3ECF8E] mb-4">
              Trainee List
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-2 border-[#2c3340] rounded-xl overflow-hidden shadow-md">
                <thead className="bg-[#1a1f27] text-[#3ECF8E]">
                  <tr>
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">Age</th>
                    <th className="px-4 py-3 text-left">Weight</th>
                    <th className="px-4 py-3 text-left">Goal</th>
                    <th className="px-4 py-3 text-left">Progress</th>
                    <th className="px-4 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2c3340]">
                  <tr className="hover:bg-[#1f252e] transition">
                    <td className="px-4 py-2">Rahul Sharma</td>
                    <td className="px-4 py-2">24</td>
                    <td className="px-4 py-2">70kg</td>
                    <td className="px-4 py-2">Muscle Gain</td>
                    <td className="px-4 py-2">15-day streak</td>
                    <td className="px-4 py-2 text-center">
                      <button className="cta-btn bg-[#0066FF] hover:bg-[#0052cc] px-3 py-1 rounded-md text-xs font-semibold">
                        Update Plan
                      </button>
                    </td>
                  </tr>
                  <tr className="hover:bg-[#1f252e] transition">
                    <td className="px-4 py-2">Sneha Patel</td>
                    <td className="px-4 py-2">27</td>
                    <td className="px-4 py-2">60kg</td>
                    <td className="px-4 py-2">Fat Loss</td>
                    <td className="px-4 py-2">80% adherence</td>
                    <td className="px-4 py-2 text-center">
                      <button className="cta-btn bg-[#0066FF] hover:bg-[#0052cc] px-3 py-1 rounded-md text-xs font-semibold">
                        Update Plan
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="font-orbitron text-xl font-bold text-[#3ECF8E] mb-4">
              Plans Library
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-[#1a1f27] p-6 rounded-xl border-2 border-[#2c3340] shadow-md hover:-translate-y-1.5 hover:shadow-[0_12px_24px_rgba(0,255,170,0.2)] hover:bg-[#1f252e] hover:border-[#3ECF8E] transition">
                <h3 className="font-orbitron text-lg text-[#0066FF]">Beginner Fat Loss</h3>
                <p className="text-sm mt-2">
                  A 4-week plan focusing on cardio, light weights, and balanced meals.
                </p>
                <button className="mt-4 cta-btn bg-[#0066FF] hover:bg-[#0052cc] px-3 py-1 rounded-md text-xs font-semibold">
                  Assign
                </button>
              </div>
              <div className="bg-[#1a1f27] p-6 rounded-xl border-2 border-[#2c3340] shadow-md hover:-translate-y-1.5 hover:shadow-[0_12px_24px_rgba(0,255,170,0.2)] hover:bg-[#1f252e] hover:border-[#3ECF8E] transition">
                <h3 className="font-orbitron text-lg text-[#0066FF]">Muscle Gain Pro</h3>
                <p className="text-sm mt-2">
                  A 6-week strength-focused plan with progressive overload routines.
                </p>
                <button className="mt-4 cta-btn bg-[#0066FF] hover:bg-[#0052cc] px-3 py-1 rounded-md text-xs font-semibold">
                  Assign
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
