import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const RegisterStudentPage = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    studentId: '',
    image: null
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [stream, setStream] = useState(null);

  // Camera controls
  useEffect(() => {
    if (isCameraActive) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isCameraActive]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' }, 
        audio: false 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
    } catch (err) {
      console.error("Camera error:", err);
      alert("Could not access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);
      setFormData(prev => ({ ...prev, image: canvasRef.current.toDataURL('image/jpeg') }));
      stopCamera();
      setIsCameraActive(false);
    }
  };

  // Form handling
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.studentId.trim()) newErrors.studentId = 'Student ID is required';
    if (!formData.image) newErrors.image = 'Photo is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
  
    setIsSubmitting(true);
    setErrors({});
  
    try {
      // Step 1: Send base64 image to face encoding API
      const encodeRes = await fetch('http://127.0.0.1:8000/api/face/encode/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: formData.image })
      });
  
      const encodeData = await encodeRes.json();
  
      if (!encodeRes.ok) {
        throw new Error(encodeData.error || 'Face encoding failed');
      }
  
      // Step 2: Send student details + encoding to register API
      const registerRes = await fetch('http://127.0.0.1:8000/api/register/student/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          studentId: formData.studentId,
          encoding: encodeData.encoding // from previous step
        })
      });
  
      const registerData = await registerRes.json();
  
      if (!registerRes.ok) {
        throw new Error(registerData.error || 'Registration failed');
      }
  
      // ✅ Success
      alert('Student registered successfully!');
      setIsSubmitting(false);
      navigate('/home');
    } catch (err) {
      console.error(err);
      alert(err.message || 'Something went wrong');
      setIsSubmitting(false);
    }
  };
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-800 p-4 flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-2xl w-full max-w-md p-8 border border-white/20">
        {/* Header */}
        <div className="text-center mb-8">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-12 w-12 mx-auto text-white mb-3" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          <h1 className="text-3xl font-bold text-white mb-1">Register Student</h1>
          <p className="text-white/80">Fill in the student details</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-3 bg-white/10 border ${errors.name ? 'border-red-400' : 'border-white/20'} rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30`}
              placeholder="John Doe"
              autoFocus
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-300">{errors.name}</p>
            )}
          </div>

          {/* Student ID Field */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-1">
              Student ID
            </label>
            <input
              type="text"
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              className={`w-full px-4 py-3 bg-white/10 border ${errors.studentId ? 'border-red-400' : 'border-white/20'} rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30`}
              placeholder="S12345678"
            />
            {errors.studentId && (
              <p className="mt-1 text-sm text-red-300">{errors.studentId}</p>
            )}
          </div>

          {/* Camera Section */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-1">
              Student Photo
            </label>
            
            {!formData.image ? (
              <div className="space-y-4">
                {isCameraActive ? (
                  <div className="relative bg-black rounded-lg overflow-hidden">
                    {/* Live Camera Feed */}
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      className="w-full h-48 object-cover"
                    />
                    
                    {/* Camera Controls - Now positioned BELOW the feed */}
                    <div className="flex justify-center space-x-4 mt-4">
                      <button
                        type="button"
                        onClick={capturePhoto}
                        className="bg-white/90 text-indigo-900 p-3 rounded-full hover:bg-white flex items-center justify-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsCameraActive(false)}
                        className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsCameraActive(true)}
                    className="w-full py-3 px-4 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 flex items-center justify-center space-x-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Open Camera</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-4">
                <div className="relative w-full">
                  <img 
                    src={formData.image} 
                    alt="Captured" 
                    className="w-full h-48 object-cover rounded-lg border-2 border-white/30"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, image: null }))}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCameraActive(true)}
                  className="text-sm text-white/80 hover:text-white"
                >
                  Retake Photo
                </button>
              </div>
            )}
            {errors.image && (
              <p className="mt-1 text-sm text-red-300">{errors.image}</p>
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-white text-indigo-900 rounded-lg font-bold hover:bg-white/90 disabled:opacity-70 flex justify-center items-center"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Registering...
              </>
            ) : 'Register Student'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterStudentPage;