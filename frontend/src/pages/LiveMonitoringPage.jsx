import React, { useState, useEffect } from "react";

const LiveMonitoringPage = () => {
  const [isArrivalActive, setIsArrivalActive] = useState(false);
  const [isDepartureActive, setIsDepartureActive] = useState(false);
  const [studentCount, setStudentCount] = useState(0);

  const arrivalFeedUrl = "http://localhost:8000/api/arrival-feed/";
  const departureFeedUrl = "http://localhost:8000/api/departure-feed/";

  // 🔁 Poll student count every 5 seconds
  useEffect(() => {
    const fetchStudentCount = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/student-count/");
        const data = await response.json();
        setStudentCount(data.count);
      } catch (error) {
        console.error("Error fetching student count:", error);
      }
    };

    fetchStudentCount(); // initial fetch
    const interval = setInterval(fetchStudentCount, 5000); // poll every 5s

    return () => clearInterval(interval); // cleanup
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-800 p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Live Gate Monitoring
        </h1>
        <p className="text-white/80">Real-time student tracking</p>
      </div>

      {/* Camera Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Arrival Feed */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-2xl p-6 border border-white/20">
          <h2 className="text-xl font-semibold text-white mb-4 text-center">
            Gate Entrance
          </h2>
          <div className="relative bg-black rounded-lg overflow-hidden w-full h-64">
            {isArrivalActive ? (
              <img
                src={arrivalFeedUrl}
                alt="Arrival Camera Feed"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/50">
                Camera Offline
              </div>
            )}
          </div>
          <div className="flex justify-center mt-4 space-x-4">
            <button
              onClick={() => setIsArrivalActive(!isArrivalActive)}
              className={`px-4 py-2 rounded-lg ${
                isArrivalActive
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-green-500 hover:bg-green-600"
              } text-white`}
            >
              {isArrivalActive ? "Stop Feed" : "Start Feed"}
            </button>
          </div>
        </div>

        {/* Departure Feed */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-2xl p-6 border border-white/20">
          <h2 className="text-xl font-semibold text-white mb-4 text-center">
            Gate Exit
          </h2>
          <div className="relative bg-black rounded-lg overflow-hidden w-full h-64">
            {isDepartureActive ? (
              <img
                src={departureFeedUrl}
                alt="Departure Camera Feed"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/50">
                Mobile Not Connected
              </div>
            )}
          </div>
          <div className="flex justify-center mt-4 space-x-4">
            <button
              onClick={() => setIsDepartureActive(!isDepartureActive)}
              className={`px-4 py-2 rounded-lg ${
                isDepartureActive
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-blue-500 hover:bg-blue-600"
              } text-white`}
            >
              {isDepartureActive ? "Disconnect" : "Connect Mobile"}
            </button>
          </div>
        </div>
      </div>

      {/* Student Count */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-2xl p-6 max-w-md mx-auto border border-white/20">
        <h2 className="text-xl font-semibold text-white mb-2 text-center">
          Current Student Count
        </h2>
        <div className="text-center">
          <span className="text-5xl font-bold text-white">{studentCount}</span>
        </div>
      </div>
    </div>
  );
};

export default LiveMonitoringPage;
