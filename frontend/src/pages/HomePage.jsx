import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
  };


  // Card data for actions
  const actionCards = [
    {
      title: "Register Student",
      description: "Add new students to the system",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      ),
      color: "bg-blue-100 text-blue-800",
      path: "/register"
    },
    {
      title: "Live Monitoring",
      description: "Real-time gate access tracking",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      color: "bg-green-100 text-green-800",
      path: "/monitor"
    },
    {
      title: "View Records",
      description: "Access historical gate activity",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: "bg-purple-100 text-purple-800",
      path: "/records"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-800 p-4">
      {/* Header */}
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Gate Monitoring System</h1>
        <p className="text-white/80">Welcome back, Admin</p>
      </header>

      {/* Action Cards Grid */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {actionCards.map((card, index) => (
          <div 
            key={index}
            onClick={() => handleNavigate(card.path)}
            className={`${card.color} p-6 rounded-xl shadow-lg cursor-pointer transition-all hover:scale-105 hover:shadow-xl flex flex-col items-center text-center`}
          >
            <div className="mb-4 p-3 rounded-full bg-white/20">
              {card.icon}
            </div>
            <h3 className="text-xl font-semibold mb-2">{card.title}</h3>
            <p className="text-sm opacity-80 mb-4">{card.description}</p>
            <button className="mt-auto px-4 py-2 bg-white/20 rounded-lg text-sm font-medium hover:bg-white/30">
              Access Now
            </button>
          </div>
        ))}
      </div>
    </div>
    
  );

}