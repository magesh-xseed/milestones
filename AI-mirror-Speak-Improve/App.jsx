import React, { useState, useEffect } from 'react';
import { Award, Mic, Zap, BarChart3, Clock, PlayCircle, CheckCircle, TrendingUp, TrendingDown, BookOpen, Edit, AlertTriangle, Volume2, Pause, Shuffle, Info } from 'lucide-react';

// --- CONFIGURATION ---
const PRIMARY_COLOR = '#8a171d'; // Deep Crimson
const DARKER_COLOR = '#6d1116';
const DEFAULT_TOPIC = "A quality education goes beyond textbooks and videos!";

// --- MOCK DATA ---

// List of topics for randomization
const RANDOM_TOPICS = [
  "Describe your favorite invention and why it matters.",
  "What is the most pressing environmental issue today and how can technology help solve it?",
  "Analyze the challenges and benefits of remote work.",
  "If you could have dinner with any historical figure, who would it be and why?",
  "Explain a complex idea (like blockchain or gravity) in simple terms.",
];

// Mock data for multiple sessions
const sessionReports = [
  {
    id: 1,
    date: 'Oct 20, 2025',
    topic: DEFAULT_TOPIC,
    overallScore: 'A-',
    scorePercentage: 92,
    summaryTip: "Excellent presentation! Focus next time on substituting basic conjunctions for more complex transition phrases to elevate your academic tone.",
    metrics: [
      { title: 'Pronunciation', score: '88%', icon: Mic, color: 'text-yellow-600', detail: 'Mispronounced: comfortable, schedule' },
      { title: 'Grammar', score: '2 Errors', icon: Zap, color: 'text-red-600', detail: 'Tip: Try: "I have been watching movies" instead of "I watching movies".' },
      { title: 'Fluency', score: '1.2s Pause', icon: Clock, color: 'text-blue-600', detail: 'Goal: < 1.0s Pause Time' },
      { title: 'Expression', score: '85% Eyes', icon: Award, color: 'text-green-600', detail: 'Consistent eye contact maintained.' },
    ],
    color: 'bg-green-100/70'
  },
  {
    id: 2,
    date: 'Oct 19, 2025',
    topic: 'Future of Work Trends',
    overallScore: 'B+',
    scorePercentage: 86,
    summaryTip: "Strong content organization! To reach an 'A' grade, reduce your use of filler words ('um', 'like').",
    metrics: [
      { title: 'Pronunciation', score: '95%', icon: Mic, color: 'text-green-600', detail: 'Near perfect clarity.' },
      { title: 'Grammar', score: '1 Error', icon: Zap, color: 'text-green-600', detail: 'Tip: Watch subject-verb agreement.' },
      { title: 'Fluency', score: '2.5s Pause', icon: Clock, color: 'text-red-600', detail: 'Goal: < 1.0s Pause Time (major focus area).' },
      { title: 'Expression', score: '60% Hands', icon: Award, color: 'text-yellow-600', detail: 'Overuse of hand gestures (distracting).' },
    ],
    color: 'bg-yellow-100/70'
  },
  {
    id: 3,
    date: 'Oct 18, 2025',
    topic: 'Weekend Plans Summary',
    overallScore: 'C+',
    scorePercentage: 74,
    summaryTip: "Start with a stronger hook and maintain a consistent pace. Your speed fluctuated too much.",
    metrics: [
      { title: 'Pronunciation', score: '70%', icon: Mic, color: 'text-red-600', detail: 'Several common words mispronounced.' },
      { title: 'Grammar', score: '5 Errors', icon: Zap, color: 'text-red-600', detail: 'Focus on sentence structure.' },
      { title: 'Fluency', score: '1.0s Pause', icon: Clock, color: 'text-blue-600', detail: 'Acceptable pause time.' },
      { title: 'Expression', score: '90% Eyes', icon: Award, color: 'text-green-600', detail: 'Excellent eye contact.' },
    ],
    color: 'bg-orange-100/70'
  },
];

// Helper to determine the latest report shown
const initialReport = sessionReports[0];

// --- COMPONENTS ---

// Transcript Modal Component (UPDATED FOR CLARITY)
const TranscriptModal = ({ report, onClose }) => {
  // Mock detailed transcript (Refactored to use IDs for cleaner display)
  const mockTranscript = [
    { text: "A quality education ", highlight: null, tipId: null },
    { text: "goes beyond textbooks", highlight: 'red', tipId: 1, issue: 'Grammar' },
    { text: " and videos, it includes interactive training and real-time feedback. ", highlight: null, tipId: null },
    { text: "For example, [Pause 1.5s] ", highlight: 'blue', tipId: 2, issue: 'Fluency' },
    { text: "I believe that using an AI mirror system", highlight: null, tipId: null },
    { text: "is the better way to learn pronunciation and reduce my filler words.", highlight: 'yellow', tipId: 3, issue: 'Pronunciation' },
    { text: "It's a fantastic tool.", highlight: null, tipId: null },
  ];

  // List of tips, linked by ID
  const tipsList = [
      { id: 1, type: 'Grammar', detail: 'Error: Use a singular verb "goes" with the singular subject "education". The subject-verb agreement is incorrect here.' },
      { id: 2, type: 'Fluency', detail: 'Excessive pause detected (1.5s). Maintain pace by planning transitions or using a transition phrase.' },
      { id: 3, type: 'Pronunciation', detail: 'Mispronounced "mirror" and "filler". Focus on the long "i" sound in "mirror" and reducing the harsh "r" in "filler".' },
  ];


  const getHighlightClass = (highlight) => {
    if (highlight === 'red') return 'bg-red-200 border-red-500 font-semibold text-red-800 rounded-sm px-1 transition-all duration-100';
    if (highlight === 'blue') return 'bg-blue-200 border-blue-500 font-semibold text-blue-800 rounded-sm px-1 transition-all duration-100';
    if (highlight === 'yellow') return 'bg-yellow-200 border-yellow-500 font-semibold text-yellow-800 rounded-sm px-1 transition-all duration-100';
    return '';
  };

  const getColorClassForTip = (type) => {
    if (type === 'Grammar') return 'text-red-600 bg-red-100 border-red-300';
    if (type === 'Fluency') return 'text-blue-600 bg-blue-100 border-blue-300';
    if (type === 'Pronunciation') return 'text-yellow-600 bg-yellow-100 border-yellow-300';
    return 'text-gray-600 bg-gray-100 border-gray-300';
  };
  
  // Find the top issue for the summary
  const topIssueMetric = report.metrics.find(m => m.color.includes('red')) || report.metrics.find(m => m.title === 'Fluency');


  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md h-full max-h-[700px] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className={`p-5 bg-[${PRIMARY_COLOR}] text-white flex justify-between items-center shadow-lg`}>
          <h2 className="text-xl font-bold flex items-center">
            <BookOpen className="h-5 w-5 mr-2"/>
            Full Transcript Review
          </h2>
          <button onClick={onClose} className="text-white hover:text-gray-300 font-bold text-2xl leading-none">
            &times;
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 overflow-y-auto flex-1">
          <p className="text-sm font-semibold text-gray-600 mb-3 border-b pb-2">Topic: {report.topic}</p>

          {/* Key Issue Summary */}
          <div className="bg-red-50 border-l-4 border-red-400 p-3 mb-4 rounded-lg">
            <p className="text-red-700 font-bold flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Top Focus Area: {topIssueMetric.title}
            </p>
            <p className="text-red-600 text-sm mt-1">{topIssueMetric.detail}</p>
          </div>
          
          {/* Legend/Key */}
          <div className="flex justify-between items-center text-xs text-gray-600 p-2 bg-gray-100 rounded-lg mb-4 shadow-inner">
            <span className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-red-500 mr-1"></span> Grammar
            </span>
            <span className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-blue-500 mr-1"></span> Fluency
            </span>
            <span className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-yellow-500 mr-1"></span> Pronunciation
            </span>
          </div>

          {/* Annotated Transcript */}
          <h3 className='text-lg font-bold text-gray-800 mb-2'>Annotated Transcript</h3>
          <div className="leading-relaxed text-gray-700 text-base mb-6">
            <div className="inline">
            {mockTranscript.map((item, index) => (
              <span key={index} className={`inline transition-colors duration-100 ${getHighlightClass(item.highlight)}`}>
                  {item.text}
                  {item.tipId && (
                      <a href={`#tip-${item.tipId}`} className={`inline-flex items-center justify-center w-5 h-5 ml-1 text-xs font-bold text-white rounded-full bg-[${DARKER_COLOR}] hover:bg-[${PRIMARY_COLOR}] leading-none shadow-md transition duration-150`}>
                          {item.tipId}
                      </a>
                  )}
              </span>
            ))}
            </div>
            <p className="text-xs text-gray-400 mt-4 text-center border-t pt-2">--- End of Recorded Speech ---</p>
          </div>
          
          {/* Summary of Tips */}
          <h3 className='text-lg font-bold text-gray-800 mb-3 mt-4 border-t pt-4'>Summary of Tips ({tipsList.length} Issues Found)</h3>
          <div className="space-y-3">
            {tipsList.map((tip) => (
              <div key={tip.id} id={`tip-${tip.id}`} className="p-3 border rounded-xl shadow-sm bg-white">
                <div className="flex items-start">
                    <div className={`flex items-center justify-center w-6 h-6 mr-3 text-xs font-bold rounded-full border-2 ${getColorClassForTip(tip.type)}`}>
                        {tip.id}
                    </div>
                    <div className="flex-1">
                        <p className={`font-bold text-sm ${getColorClassForTip(tip.type)} leading-none`}>
                           {tip.type}
                        </p>
                        <p className="text-sm text-gray-700 mt-1">{tip.detail}</p>
                    </div>
                </div>
              </div>
            ))}
          </div>


        </div>
        
        {/* Footer/Close Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className={`w-full py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-lg`}
          >
            Close Review
          </button>
        </div>
      </div>
    </div>
  );
};


const TrendCard = ({ title, value, change }) => (
  <div className="flex flex-col items-start p-4 bg-white rounded-xl shadow-lg w-full">
    <div className={`text-sm font-semibold ${change > 0 ? 'text-green-600' : 'text-red-600'} flex items-center`}>
      {change > 0 ? (
        <TrendingUp className="h-4 w-4 mr-1" />
      ) : (
        <TrendingDown className="h-4 w-4 mr-1" />
      )}
      {Math.abs(change)}%
    </div>
    <div className="text-3xl font-bold mt-1 text-gray-800">{value}</div>
    <div className="text-gray-500 text-xs mt-1">{title}</div>
  </div>
);

// Mock Chart Component (Simulated)
const MockChart = () => (
    <div className="h-48 bg-gray-100 p-4 rounded-xl flex flex-col justify-end relative shadow-inner">
      <span className="absolute top-2 left-3 text-lg font-bold text-gray-700">Fluency Score (%)</span>
      <div className="flex justify-between items-end h-full pt-6">
        {[40, 55, 60, 80, 75, 90, 85, 92, 95, 90].map((height, index) => (
          <div
            key={index}
            style={{ height: `${height}%`, width: '8%', backgroundColor: PRIMARY_COLOR }}
            className={`rounded-t-lg transition-all duration-500 ease-out hover:opacity-80`}
            title={`Session ${index + 1}: ${height}%`}
          ></div>
        ))}
      </div>
      <div className="text-xs text-gray-500 mt-2 flex justify-between">
        <span>S1</span><span>S3</span><span>S5</span><span>S7</span><span>S9</span>
      </div>
    </div>
  );
  
// --- DEDICATED CAMERA/PROCESSING SCREENS ---

// Screen B: Camera Simulation - Full Screen Mirror
const CameraScreen = ({ setView, topic, focusMode }) => { // ADDED focusMode PROP
  const handleStop = () => {
    // Trigger the parent component to switch to the 'processing' view
    setView(); 
  };
  
  return (
    <div className="relative h-full bg-black flex flex-col items-center justify-end p-8">
      {/* Camera Preview Area (Simulated) - Base layer */}
      <div className="absolute inset-0 bg-gray-800/90 flex items-center justify-center z-0">
        <span className="text-white text-3xl font-bold border border-white p-4">Camera Feed Active (Mirror)</span>
      </div>

      {/* Top Prompt Overlay - Z-index added for clickability */}
      <div className="absolute top-0 w-full p-4 bg-black/40 text-center z-10">
        <p className="text-white text-sm opacity-80">
            {/* Display focus mode if set, otherwise display 'Prompt:' */}
            {focusMode ? `FOCUSED DRILL: ${focusMode}` : 'Prompt:'}
        </p>
        <p className="text-white font-medium">{topic}</p>
      </div>

      {/* Real-time Metrics - Z-index added for clickability */}
      <div className="w-full flex justify-around p-4 mb-8 bg-black/40 rounded-xl relative z-10">
        <div className="flex flex-col items-center">
          <p className="text-4xl font-black text-red-400">01:45</p>
          <p className="text-xs text-white opacity-80">Timer (Max 2:00)</p>
        </div>
        <div className="flex flex-col items-center">
          <p className="text-4xl font-black text-white">217</p>
          <p className="text-xs text-white opacity-80">Words Spoken</p>
        </div>
      </div>

      {/* Stop Button - Z-index added for clickability */}
      <button
        onClick={handleStop}
        className={`w-20 h-20 bg-[${PRIMARY_COLOR}] hover:bg-[${DARKER_COLOR}] rounded-full shadow-2xl transition duration-150 flex items-center justify-center border-4 border-white/50 relative z-10`}
      >
        <span className="w-8 h-8 bg-white rounded-md"></span>
      </button>
      <p className="text-white text-sm mt-3 relative z-10">Tap to End Session</p>
    </div>
  );
};

// Screen C: Processing Simulation - Full Screen Loading
const ProcessingScreen = () => (
    <div className="flex flex-col h-full items-center justify-center bg-gray-900 text-white p-6">
      <svg className="animate-spin h-12 w-12 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <h2 className="text-2xl font-bold mt-4">Analyzing Performance...</h2>
      <p className="text-sm mt-2 opacity-75">Processing video, audio, and body language via AI Engine.</p>
    </div>
);


// --- DASHBOARD SECTIONS ---

// --- 1. INTRODUCTION & START SECTION ---
const IntroductionSection = ({ handleStartSession, currentTopic, setCurrentTopic, overallScore }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempTopic, setTempTopic] = useState(currentTopic);

    // Sync tempTopic with currentTopic if currentTopic changes (e.g., via randomization)
    useEffect(() => {
        setTempTopic(currentTopic);
    }, [currentTopic]);

    const handleSaveTopic = () => {
        setCurrentTopic(tempTopic);
        setIsEditing(false);
    };
    
    // Function to randomize the topic
    const handleRandomizeTopic = () => {
        setIsEditing(false); // Exit editing mode
        const randomIndex = Math.floor(Math.random() * RANDOM_TOPICS.length);
        const newTopic = RANDOM_TOPICS[randomIndex];
        setCurrentTopic(newTopic);
    };

    return (
        <div className="p-6 pb-8 bg-gray-50">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-6">AI Mirror Dashboard</h1>
            
            {/* Overall Score */}
            <div className={`bg-[${PRIMARY_COLOR}] text-white p-6 rounded-2xl shadow-xl mb-6 relative`}>
                
                {/* 2. Grade Info Icon and Tooltip (NEW) */}
                <div className="absolute top-4 right-4 group">
                    <Info className="h-5 w-5 text-white cursor-pointer opacity-70 hover:opacity-100 transition-opacity" />
                    <div className="absolute right-0 top-7 w-72 bg-white text-gray-800 p-4 rounded-xl shadow-2xl text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20 transform translate-x-1">
                        <h4 className="font-bold border-b pb-1 mb-2 text-md">Overall Grade Breakdown</h4>
                        <div className="space-y-1">
                            <div className="flex justify-between font-semibold"><span>A/A+</span><span className="text-green-600">93% - 100%</span></div>
                            <div className="flex justify-between"><span>B+ / B</span><span className="text-yellow-600">83% - 89%</span></div>
                            <div className="flex justify-between"><span>C+ / C</span><span className="text-red-600">70% - 82%</span></div>
                            <div className="flex justify-between"><span>D / F</span><span className="text-red-700"> &lt; 70%</span></div>
                        </div>
                        <p className="mt-2 text-xs italic text-gray-500 border-t pt-2">
                            Your **{overallScore}** average indicates above-average performance with room for improvement in specific metrics like Fluency.
                        </p>
                    </div>
                </div>
                {/* End Grade Info */}

                <p className="text-sm font-light opacity-80">Overall Speaking Average</p>
                <p className="text-6xl font-black mt-1">{overallScore}</p>
                <p className="text-sm font-light mt-2">Current Grade (Based on last 5 sessions)</p>
            </div>

            {/* Topic Card (Editable) */}
            <div className="bg-white p-5 rounded-xl shadow-md border-t-4 border-gray-300 mb-8">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-lg font-semibold text-gray-700">Practice Topic</h2>
                    
                    {/* Button Group for Randomize and Edit */}
                    <div className='flex space-x-3'>
                        <button 
                            onClick={handleRandomizeTopic} 
                            className={`text-gray-500 hover:text-[${DARKER_COLOR}] text-sm font-medium flex items-center transition duration-150 ${isEditing ? 'opacity-50 cursor-not-allowed' : 'text-[${PRIMARY_COLOR}]'}`}
                            title="Generate Random Topic"
                            disabled={isEditing}
                        >
                            {/* 1. Practice Topic Icon Change (NEW: Shuffle) */}
                            <Shuffle className="h-4 w-4"/>
                        </button>
                        <button 
                            onClick={() => setIsEditing(!isEditing)} 
                            className={`text-[${PRIMARY_COLOR}] hover:text-[${DARKER_COLOR}] text-sm font-medium flex items-center`}
                        >
                            <Edit className="h-4 w-4 mr-1"/>
                            {isEditing ? 'Cancel' : 'Edit'}
                        </button>
                    </div>
                </div>
                
                {isEditing ? (
                    <>
                        <textarea
                            value={tempTopic}
                            onChange={(e) => setTempTopic(e.target.value)}
                            className="w-full text-gray-900 text-xl font-medium leading-relaxed border border-gray-300 rounded p-2 focus:ring-2 focus:ring-[${PRIMARY_COLOR}] resize-none"
                            rows="3"
                        />
                        <button
                            onClick={handleSaveTopic}
                            className={`mt-3 w-full py-2 bg-[${PRIMARY_COLOR}] text-white font-bold rounded-lg hover:bg-[${DARKER_COLOR}]`}
                        >
                            Save Topic
                        </button>
                    </>
                ) : (
                    <p className="text-gray-900 text-xl font-medium leading-relaxed">{currentTopic}</p>
                )}
            </div>

            {/* Start Button */}
            <button
                onClick={handleStartSession}
                className={`w-full py-4 bg-[${PRIMARY_COLOR}] hover:bg-[${DARKER_COLOR}] text-white font-bold text-lg rounded-full shadow-2xl transition duration-150 transform hover:scale-[1.01] flex items-center justify-center`}
            >
                <PlayCircle className="mr-2 h-6 w-6" />
                Start New Speaking Session
            </button>
        </div>
    );
};

// --- 2a. IMPROVEMENT FOCUS SECTION (Updated UI) ---
const FocusAreaSection = ({ latestReport, handleStartDrill }) => { // ACCEPTED handleStartDrill
    // Determine the top area for improvement (mock logic: the metric with the 'text-red-600' color)
    const fluencyMetric = latestReport.metrics.find(m => m.title === 'Fluency');
    const worstMetric = latestReport.metrics.reduce((min, current) => {
        // If the current metric has a 'red' color, prioritize it.
        if (current.color.includes('red')) return current;
        return min;
    }, fluencyMetric); // Default to fluency if no clear red

    return (
        <div className="p-6 bg-gray-100 border-t border-gray-100">
            <h1 className="text-2xl font-extrabold text-gray-900 mb-4 flex items-center">
                <AlertTriangle className={`h-6 w-6 mr-2 text-red-600`} />
                Your Improvement Focus
            </h1>
            
            {/* Redesigned Focus Card for High Impact */}
            <div className={`bg-white p-5 rounded-xl shadow-lg border-l-8 border-[${PRIMARY_COLOR}]`}>
                <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
                    <p className="text-xl font-bold text-gray-800 flex items-center">
                        <Zap className="h-6 w-6 mr-2 text-red-600"/>
                        {worstMetric.title}
                    </p>
                    <span className="text-sm font-semibold text-red-600 px-3 py-1 rounded-full bg-red-100 shadow-sm">
                        CRITICAL
                    </span>
                </div>
                
                <p className="text-gray-700 leading-relaxed mb-4 text-sm">
                    Based on your last session score of <span className="font-bold text-lg text-red-700">{latestReport.overallScore}</span>, <span className="font-bold">{worstMetric.title}</span> remains your weakest area.
                </p>

                <div className="p-3 bg-red-50 rounded-lg">
                    <p className={`font-bold text-red-700 text-base`}>
                        Actionable Step:
                    </p>
                    <p className="text-red-700 font-medium text-sm mt-1">
                        {worstMetric.detail}
                    </p>
                </div>
            </div>
            
            {/* Prominent Action Button - NOW CLICKABLE */}
            <button
                onClick={() => handleStartDrill(worstMetric.title)}
                className={`mt-6 w-full py-3 bg-[${PRIMARY_COLOR}] hover:bg-[${DARKER_COLOR}] text-white font-bold text-lg rounded-full shadow-lg transition duration-150 transform hover:scale-[1.01]`}
            >
                Start Focused Practice Drill
            </button>
        </div>
    );
};

// --- 2b. AI FEEDBACK REPORT SECTION (Updated to take props) ---
const ReportSection = ({ report, openTranscriptModal }) => {
    // UPDATED HANDLER: Now opens the modal passed from App
    const handleViewTranscript = () => {
        openTranscriptModal(report);
    };

    return (
        <div id="report-section" className="p-6 bg-white border-t border-gray-100 shadow-inner">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
        {/* Using sessionReports[0].id for simplicity to check if it's the latest session report based on mock data init */}
        {report.id === sessionReports[0].id ? 'Latest Session Report' : 'Session Review'} 
      </h1>
      <p className="text-gray-500 mb-6">Topic: {report.topic} <span className="font-semibold ml-2">({report.date})</span></p>

      {/* Overall Score Block */}
      <div className={`bg-[${PRIMARY_COLOR}] text-white p-6 rounded-2xl shadow-xl mb-6 flex justify-between items-center`}>
        <div>
          <p className="text-sm font-light opacity-80">Final Performance Score</p>
          <p className="text-7xl font-black mt-1">{report.overallScore}</p>
        </div>
        <div className="flex flex-col items-end">
           <CheckCircle className="h-10 w-10 text-white" />
           <p className="text-lg mt-1 font-semibold">{report.scorePercentage}%</p>
        </div>
      </div>

      {/* Summary Tip */}
      <div className="bg-gray-50 p-4 rounded-xl shadow-md border-l-4 border-indigo-500 mb-6">
        <p className={`text-sm font-semibold text-[${DARKER_COLOR}] mb-1`}>AI Summary:</p>
        <p className="text-gray-700 italic leading-relaxed">"{report.summaryTip}"</p>
      </div>

      {/* Detailed Metrics */}
      <h2 className="text-xl font-bold text-gray-800 mb-4">Detailed Breakdown</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {report.metrics.map((metric, index) => (
          <div key={index} className="bg-white p-5 rounded-xl shadow-lg flex items-center space-x-4 border border-gray-100">
            <metric.icon className={`h-8 w-8 ${metric.color}`} />
            <div>
              <p className="text-sm font-semibold text-gray-600">{metric.title}</p>
              <p className="text-2xl font-black text-gray-900">{metric.score}</p>
              <p className="text-xs text-gray-500 mt-1">{metric.detail}</p>
            </div>
          </div>
        ))}
      </div>
       {/* Transcript Button - Now opens the detailed review modal */}
       <button
        onClick={handleViewTranscript}
        className={`mt-6 w-full py-3 font-bold text-lg rounded-full transition duration-150 shadow-sm flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-gray-800`}
      >
        <BookOpen className="mr-2 h-5 w-5" />
        View Full Transcript & Tips
      </button>
    </div>
    );
};

// --- 3. PROGRESS DASHBOARD SECTION (Updated for Review functionality) ---
const ProgressSection = ({ history, onReview }) => (
    <div className="p-6 bg-gray-50 border-t border-gray-200">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Long-Term Progress</h1>
      
      {/* Trends */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <TrendCard title="Overall Score" value="B+" change={5} />
        <TrendCard title="Unique Words" value="↑ 15%" change={15} />
      </div>

      {/* Chart Section */}
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
        <BarChart3 className={`w-5 h-5 mr-2 text-[${PRIMARY_COLOR}]`} />
        Last 10 Sessions Performance
      </h2>
      <div className="bg-white p-4 rounded-xl shadow-lg mb-8">
        <MockChart />
      </div>

      {/* History */}
      <h2 className="text-xl font-bold text-gray-800 mb-4">Session History</h2>
      <div className="space-y-3 pb-4">
        {history.map((session, index) => (
          <div key={session.id} className="flex items-center p-4 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className={`w-12 h-12 flex items-center justify-center rounded-full font-bold text-xl ${session.color} border border-gray-200`}>
              {session.overallScore}
            </div>
            <div className="ml-4 flex-1">
              <p className="font-semibold text-gray-900 line-clamp-1">{session.topic}</p>
              <p className="text-sm text-gray-500">{session.date}</p>
            </div>
            <button 
                onClick={() => onReview(session)} 
                className={`text-[${PRIMARY_COLOR}] text-sm font-medium hover:opacity-80 flex items-center`}
            >
                Review Report
            </button>
          </div>
        ))}
      </div>

    </div>
);


// --- MAIN APPLICATION COMPONENT (State Management) ---
const App = () => {
  // view: 'dashboard', 'camera', 'processing'
  const [view, setView] = useState('dashboard'); 
  const [sessionHistory, setSessionHistory] = useState(sessionReports);
  const [latestReport, setLatestReport] = useState(initialReport);
  const [currentTopic, setCurrentTopic] = useState(DEFAULT_TOPIC);
  const [focusMode, setFocusMode] = useState(null); // State to track if session is a drill
  const [showTranscriptModal, setShowTranscriptModal] = useState(false); // NEW: Modal visibility
  const [transcriptReport, setTranscriptReport] = useState(null); // NEW: Data for the modal
  const overallScore = 'B+'; 

  // Scrolls to the report section
  const scrollToReport = () => {
    // Use a small delay to ensure the DOM has updated before scrolling
    setTimeout(() => {
        document.getElementById('report-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100); 
  }

  // NEW: Handlers for Transcript Modal
  const openTranscriptModal = (report) => {
      setTranscriptReport(report);
      setShowTranscriptModal(true);
  };

  const closeTranscriptModal = () => {
      setShowTranscriptModal(false);
      setTranscriptReport(null);
  };


  // Handles clicking Review on a past session
  const handleViewReport = (report) => {
    setLatestReport(report);
    scrollToReport();
  };


  // Function to start a general session flow
  const handleStartSession = () => {
    setFocusMode(null); // Clear focus mode for a general session
    setLatestReport(sessionHistory[0]);
    setView('camera');
  };
  
  // Function to start a focused drill session
  const handleStartDrill = (drillMetric) => {
    setFocusMode(drillMetric); // Set the metric to focus on
    setLatestReport(sessionHistory[0]); // Reset report view
    setView('camera');
  };

  // Function called after stopping the recording
  const handleStopRecording = () => {
      setView('processing');
      
      // Simulate new session report generation
      setTimeout(() => {
        const newReport = {
            id: Date.now(),
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            topic: currentTopic, // Uses the user-set topic
            overallScore: focusMode ? 'A+' : 'A', // Simulate better score for focus drill
            scorePercentage: focusMode ? 98 : 96,
            summaryTip: focusMode 
                ? `Outstanding focus on ${focusMode}! You successfully integrated all practice tips.`
                : "Phenomenal delivery! You hit all targets. Next, explore using complex rhetorical questions to engage the audience deeper.",
            metrics: [
                { title: 'Pronunciation', score: '99%', icon: Mic, color: 'text-green-600', detail: 'Perfect clarity.' },
                { title: 'Grammar', score: '0 Errors', icon: Zap, color: 'text-green-600', detail: 'Flawless structure.' },
                { title: 'Fluency', score: '0.8s Pause', icon: Clock, color: 'text-green-600', detail: 'Met pause time goal.' },
                { title: 'Expression', score: '95% Energy', icon: Award, color: 'text-green-600', detail: 'Dynamic and engaging tone.' },
            ],
            color: 'bg-green-100/70'
        };

        // Add new report to the history (at the beginning) and update the display
        setSessionHistory([newReport, ...sessionHistory]);
        setLatestReport(newReport);
        setFocusMode(null); // Clear focus mode after session ends

        setView('dashboard');
        scrollToReport();
      }, 2500); // 2.5 seconds processing time
  }

  // Conditional Rendering Logic
  const renderView = () => {
      if (view === 'camera') {
          // PASS focusMode PROP
          return <CameraScreen setView={handleStopRecording} topic={currentTopic} focusMode={focusMode} />; 
      }
      
      if (view === 'processing') {
          return <ProcessingScreen />;
      }
      
      // Default: Dashboard View (scrolling page)
      return (
        <main className="flex-1 overflow-y-auto">
            <IntroductionSection 
              handleStartSession={handleStartSession} 
              currentTopic={currentTopic}
              setCurrentTopic={setCurrentTopic} // Feature 1: Pass topic updater
              overallScore={overallScore}
            />
            
            {/* Report and Progress Sections are always rendered after initial load */}
            <>
            {/* Feature 3: Improvement Focus Area - PASS HANDLER */}
            <FocusAreaSection latestReport={latestReport} handleStartDrill={handleStartDrill} />

            {/* Feature 2: Dynamic Report Viewer - PASS MODAL HANDLER */}
            <ReportSection report={latestReport} openTranscriptModal={openTranscriptModal} />
            
            {/* Feature 2: History List */}
            <ProgressSection history={sessionHistory} onReview={handleViewReport} />
            </>

            {/* Spacer for bottom padding */}
            <div className="h-10"></div>
        </main>
      )
  }


  return (
    // Outer container simulating a mobile device screen
    <div className="min-h-screen bg-gray-200 p-4 flex items-center justify-center font-sans">
      <div className="w-full max-w-sm h-[800px] bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col relative">
        
        {renderView()}

        {/* RENDER MODAL CONDITIIONALLY */}
        {showTranscriptModal && transcriptReport && (
          <TranscriptModal report={transcriptReport} onClose={closeTranscriptModal} />
        )}

      </div>
    </div>
  );
};

export default App;
