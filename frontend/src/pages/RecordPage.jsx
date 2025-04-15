import React, { useEffect, useState } from 'react';

export default function RecordPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('');
  const [studentIdFilter, setStudentIdFilter] = useState('');

  const fetchRecords = async () => {
    try {
      let url = "http://localhost:8000/api/combined-records/";
      const params = new URLSearchParams();

      if (dateFilter) params.append("date", dateFilter);
      if (studentIdFilter) params.append("studentId", studentIdFilter);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      setRecords(data);
    } catch (error) {
      console.error("Error fetching records:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
   }, );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-800 p-4">
      {/* Header */}
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Student Entry/Exit Records</h1>
        <p className="text-white/80">Activity logs of all registered students</p>
      </header>

      {/* Filters */}
      <div className="max-w-6xl mx-auto mb-6 flex flex-wrap gap-4 items-center justify-start">
        <input
          type="date"
          className="px-4 py-2 rounded-md text-black"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        />
        <input
          type="text"
          placeholder="Enter Student ID"
          className="px-4 py-2 rounded-md text-black"
          value={studentIdFilter}
          onChange={(e) => setStudentIdFilter(e.target.value)}
        />
        <button
          onClick={() => {
            setDateFilter('');
            setStudentIdFilter('');
          }}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
        >
          Clear Filters
        </button>
      </div>

      {/* Record Table */}
      <div className="max-w-6xl mx-auto bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20 overflow-x-auto">
        {loading ? (
          <p className="text-center text-white text-lg">Loading records...</p>
        ) : records.length === 0 ? (
          <p className="text-center text-white text-lg">No records found.</p>
        ) : (
          <table className="w-full text-sm text-white">
            <thead>
              <tr className="text-white uppercase text-xs border-b border-white/30">
                <th className="px-4 py-3 text-left">S.No.</th>
                <th className="px-4 py-3 text-left">Student ID</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Arrival Time</th>
                <th className="px-4 py-3 text-left">Departure Time</th>
                <th className="px-4 py-3 text-left">Entry No.</th>

              </tr>
            </thead>
            <tbody>
              {records.map((record, index) => (
                <tr key={index} className="border-b border-white/10 hover:bg-white/5 transition-all">
                  <td className="px-4 py-3">{index + 1}</td>
                  <td className="px-4 py-3">{record.studentId}</td>
                  <td className="px-4 py-3">{record.name}</td>
                  <td className="px-4 py-3">{record.date}</td>
                  <td className="px-4 py-3">{record.arrival || '—'}</td>
                  <td className="px-4 py-3">{record.departure || '—'}</td>
                  <td className="px-4 py-3">{record.entry_no}</td>

                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
