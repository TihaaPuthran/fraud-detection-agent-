import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { 
    Shield, ShieldAlert, ShieldCheck, AlertTriangle, 
    TrendingUp, Activity, Clock, Cpu, Brain, Zap,
    ChevronRight, Radar, Globe, Eye, Target, LogOut,
    Loader2, Scan, Database, Sparkles, Lock, Info
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, RadialBar, RadialBarChart } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useChatbot } from '../context/ChatbotContext';

const COUNTRY_CURRENCY = {
    "USA": { symbol: "$", name: "USD" },
    "UK": { symbol: "£", name: "GBP" },
    "EU": { symbol: "€", name: "EUR" },
    "India": { symbol: "₹", name: "INR" },
    "Japan": { symbol: "¥", name: "JPY" },
};

const COUNTRY_LOCATIONS = {
    "USA": ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Miami", "Seattle", "Unknown"],
    "UK": ["London", "Manchester", "Birmingham", "Edinburgh", "Unknown"],
    "EU": ["Paris", "Berlin", "Rome", "Madrid", "Amsterdam", "Unknown"],
    "India": ["Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Hyderabad", "Pune", "Unknown"],
    "Japan": ["Tokyo", "Osaka", "Kyoto", "Nagoya", "Unknown"],
};

const AnimatedCounter = ({ value, suffix = '', duration = 2000 }) => {
    const [count, setCount] = useState(0);
    
    useEffect(() => {
        const steps = 60;
        const increment = value / steps;
        let current = 0;
        const interval = setInterval(() => {
            current += increment;
            if (current >= value) {
                setCount(value);
                clearInterval(interval);
            } else {
                setCount(Math.floor(current));
            }
        }, duration / steps);
        return () => clearInterval(interval);
    }, [value, duration]);
    
    return <span>{count.toLocaleString()}{suffix}</span>;
};

const ProcessingStep = ({ step, label, isActive, isComplete }) => (
    <motion.div 
        className={`flex items-center gap-3 py-2 ${isComplete ? 'opacity-50' : ''}`}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
    >
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isComplete ? 'bg-green-500/20' : isActive ? 'bg-blue-500/20' : 'bg-white/5'
        }`}>
            {isComplete ? (
                <ShieldCheck className="w-4 h-4 text-green-400" />
            ) : isActive ? (
                <Loader2 className={`w-4 h-4 text-blue-400 animate-spin`} />
            ) : (
                <div className="w-2 h-2 rounded-full bg-white/20" />
            )}
        </div>
        <span className={`text-sm ${isActive ? 'text-blue-400' : isComplete ? 'text-green-400' : 'text-white/40'}`}>
            {label}
        </span>
    </motion.div>
);

const IntelligencePanel = ({ result }) => {
    const threatLevel = result?.risk_level || 'LOW';
    const pulseIntensity = threatLevel === 'HIGH' ? 'animate-pulse' : threatLevel === 'MEDIUM' ? 'animate-pulse-slow' : '';
    
    return (
        <div className="h-full flex flex-col">
            <div className="p-6 border-b border-white/5">
                <div className="flex items-center gap-3 mb-1">
                    <Brain className="w-5 h-5 text-blue-400" />
                    <h2 className="text-lg font-semibold text-white">AI Fraud Intelligence</h2>
                </div>
                <p className="text-xs text-white/50">Real-time anomaly detection powered by ML</p>
            </div>
            
            <div className="flex-1 p-6 space-y-6 overflow-auto">
                <div className="relative">
                    <div className={`absolute inset-0 bg-gradient-radial from-${threatLevel === 'HIGH' ? 'red' : threatLevel === 'MEDIUM' ? 'yellow' : 'green'}-500/20 rounded-3xl blur-3xl ${pulseIntensity}`} />
                    <div className="relative bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl p-6 border border-white/10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Radar className={`w-4 h-4 text-${threatLevel === 'HIGH' ? 'red' : threatLevel === 'MEDIUM' ? 'yellow' : 'green'}-400 ${threatLevel === 'HIGH' ? 'animate-spin' : ''}`} />
                                <span className="text-xs font-medium text-white/70 uppercase tracking-wider">Threat Level</span>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                                threatLevel === 'HIGH' ? 'bg-red-500/20 text-red-400' :
                                threatLevel === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-green-500/20 text-green-400'
                            }`}>
                                {threatLevel}
                            </span>
                        </div>
                        <div className="text-4xl font-bold text-white mb-1">
                            {result ? `${(result.anomaly_score * 100).toFixed(1)}%` : '—'}
                        </div>
                        <p className="text-xs text-white/50">Fraud Probability</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                    {[
                        { label: 'Transactions', value: 12847, icon: Activity, color: 'blue' },
                        { label: 'Threats', value: result?.risk_level === 'HIGH' ? 23 : result?.risk_level === 'MEDIUM' ? 12 : 3, icon: AlertTriangle, color: 'red' },
                        { label: 'Recall', value: result?.model_info?.recall?.toFixed(1) || 73.3, icon: Target, color: 'green', suffix: '%' },
                        { label: 'Confidence', value: result ? ((result.model_info?.confidence || 0) * 100).toFixed(1) : 50, icon: Eye, color: 'purple', suffix: '%' },
                    ].map((stat, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white/5 rounded-xl p-4 border border-white/5"
                        >
                            <stat.icon className={`w-4 h-4 text-${stat.color}-400 mb-2`} />
                            <div className="text-xl font-bold text-white">
                                <AnimatedCounter value={stat.value} suffix={stat.suffix || ''} />
                            </div>
                            <p className="text-xs text-white/50">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>
                
                <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-2xl p-4 border border-white/10">
                    <div className="flex items-center gap-2 mb-3">
                        <Zap className="w-4 h-4 text-cyan-400" />
                        <span className="text-sm font-medium text-white">Model Info</span>
                    </div>
                    <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                            <span className="text-white/50">Model</span>
                            <span className="text-white">{result?.model_info?.name || 'RandomForest'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-white/50">Version</span>
                            <span className="text-white">{result?.model_info?.version || '1.0.0'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-white/50">Mode</span>
                            <span className="text-green-400">Live Analysis</span>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                    <div className="flex items-center gap-2 mb-3">
                        <Globe className="w-4 h-4 text-purple-400" />
                        <span className="text-sm font-medium text-white">Global Activity</span>
                    </div>
                    <div className="relative h-24">
                        <svg viewBox="0 0 200 100" className="w-full h-full opacity-30">
                            <ellipse cx="100" cy="50" rx="90" ry="45" fill="none" stroke="#3B82F6" strokeWidth="0.5" />
                            <ellipse cx="100" cy="50" rx="60" ry="30" fill="none" stroke="#3B82F6" strokeWidth="0.5" />
                            <ellipse cx="100" cy="50" rx="30" ry="15" fill="none" stroke="#3B82F6" strokeWidth="0.5" />
                            <line x1="10" y1="50" x2="190" y2="50" stroke="#3B82F6" strokeWidth="0.5" />
                        </svg>
                        {[...Array(8)].map((_, i) => (
                            <motion.div
                                key={i}
                                className={`absolute w-1.5 h-1.5 rounded-full ${
                                    i % 3 === 0 ? 'bg-red-400' : i % 3 === 1 ? 'bg-yellow-400' : 'bg-green-400'
                                }`}
                                style={{
                                    left: `${15 + Math.random() * 70}%`,
                                    top: `${20 + Math.random() * 60}%`,
                                }}
                                animate={{
                                    scale: [1, 1.5, 1],
                                    opacity: [0.5, 1, 0.5],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    delay: i * 0.3,
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const DynamicCharts = ({ result, formData }) => {
    if (!result) return null;
    
    const fraudProb = result.anomaly_score;
    const confidence = result.model_info?.confidence || 0.5;
    const amount = parseFloat(formData.amount) || 0;
    const avgSpending = parseFloat(formData.avg_spending) || 1;
    
    const riskDistribution = [
        { name: 'Low Risk', value: Math.max(0, 100 - fraudProb * 100 - 15), color: '#22C55E' },
        { name: 'Medium Risk', value: 15, color: '#FACC15' },
        { name: 'High Risk', value: fraudProb * 100, color: '#EF4444' },
    ];
    
    const amountComparison = [
        { name: 'Transaction', value: Math.min(amount, 10000), fill: fraudProb > 0.5 ? '#EF4444' : fraudProb > 0.3 ? '#FACC15' : '#22C55E' },
        { name: 'Average', value: Math.min(avgSpending, 10000), fill: '#3B82F6' },
    ];
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                <h4 className="text-sm font-medium text-white/70 mb-3">Risk Distribution</h4>
                <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={riskDistribution}
                                cx="50%"
                                cy="50%"
                                innerRadius={45}
                                outerRadius={70}
                                paddingAngle={2}
                                dataKey="value"
                            >
                                {riskDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: '#111827', 
                                    border: '1px solid #2D3A4F',
                                    borderRadius: '8px',
                                    color: '#F8FAFC'
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 mt-2">
                    {riskDistribution.map((item, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-xs text-white/50">{item.name}</span>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                <h4 className="text-sm font-medium text-white/70 mb-3">Amount Analysis</h4>
                <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={amountComparison} layout="vertical">
                            <XAxis type="number" hide />
                            <YAxis type="category" dataKey="name" tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} width={80} />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: '#111827', 
                                    border: '1px solid #2D3A4F',
                                    borderRadius: '8px',
                                    color: '#F8FAFC'
                                }}
                                formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']}
                            />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                {amountComparison.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            
            <div className="bg-white/5 rounded-xl p-4 border border-white/5 md:col-span-2">
                <h4 className="text-sm font-medium text-white/70 mb-3">Confidence Gauge</h4>
                <div className="h-32">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart 
                            cx="50%" 
                            cy="50%" 
                            innerRadius="60%" 
                            outerRadius="90%" 
                            startAngle={180} 
                            endAngle={0}
                            data={[
                                { name: 'Confidence', value: confidence * 100, fill: '#3B82F6' },
                                { name: 'Remaining', value: 100 - confidence * 100, fill: '#1E293B' },
                            ]}
                        >
                            <RadialBar
                                dataKey="value"
                                cornerRadius={10}
                                background={{ fill: '#1E293B' }}
                            />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: '#111827', 
                                    border: '1px solid #2D3A4F',
                                    borderRadius: '8px',
                                    color: '#F8FAFC'
                                }}
                                formatter={(value) => [`${value.toFixed(1)}%`, 'Confidence']}
                            />
                        </RadialBarChart>
                    </ResponsiveContainer>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center mt-4">
                        <div className="text-2xl font-bold text-white">{(confidence * 100).toFixed(0)}%</div>
                        <div className="text-xs text-white/50">Model Confidence</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Dashboard = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { updateContext } = useChatbot();
    const [formData, setFormData] = useState({
        amount: '',
        location: '',
        time: '',
        avg_spending: ''
    });
    const [result, setResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [processingStep, setProcessingStep] = useState(0);
    const [error, setError] = useState(null);
    const [country, setCountry] = useState("USA");
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const currency = COUNTRY_CURRENCY[country];
    const locations = COUNTRY_LOCATIONS[country];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setResult(null);
        setProcessingStep(0);

        const steps = [
            'Analyzing transaction...',
            'Extracting behavioral features...',
            'Running fraud prediction model...',
            'Generating AI explanation...'
        ];

        for (let i = 0; i < steps.length; i++) {
            setProcessingStep(i);
            await new Promise(resolve => setTimeout(resolve, 600));
        }

        try {
            const response = await axios.post('/analyze', {
                user_id: "user_" + Math.floor(Math.random() * 1000),
                amount: parseFloat(formData.amount),
                location: formData.location,
                time: formData.time,
                avg_spending: parseFloat(formData.avg_spending)
            });
            setResult(response.data);
            updateContext(response.data);
        } catch (err) {
            console.error("API Error:", err);
            setError(err.response?.data?.detail || "Failed to connect to analysis service");
        } finally {
            setIsLoading(false);
            setProcessingStep(-1);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    return (
        <div className="min-h-screen bg-[#0B0F19] flex">
            <div className="w-80 bg-[#0D1117] border-r border-white/5 flex flex-col">
                <div className="p-6 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white">FRAUD<span className="text-blue-400">SENTINEL</span></h1>
                            <p className="text-[10px] text-white/40 uppercase tracking-widest">AI Core Engine v2.0</p>
                        </div>
                    </div>
                </div>
                <IntelligencePanel result={result} />
                <div className="p-4 border-t border-white/5 mt-auto">
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm font-medium">Terminate Session</span>
                    </button>
                </div>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="px-6 py-4 border-b border-white/5 bg-[#0D1117]/50 backdrop-blur-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-white/50">{getGreeting()}</p>
                            <h1 className="text-xl font-semibold text-white">{user?.name || 'User'}</h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                <span className="text-xs text-green-400 font-medium">System Online</span>
                            </div>
                            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-sm font-medium text-white">
                                {user?.avatar || 'U'}
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-auto p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-full">
                        <div className="lg:col-span-2 space-y-6">
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-[#161B22] rounded-2xl p-6 border border-white/5"
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-blue-500/15 rounded-xl flex items-center justify-center">
                                        <Scan className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">Transaction Analysis</h3>
                                        <p className="text-xs text-white/40">Enter transaction details</p>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2 block">Country</label>
                                        <select
                                            value={country}
                                            onChange={(e) => setCountry(e.target.value)}
                                            className="w-full bg-[#0D1117] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                                        >
                                            {Object.keys(COUNTRY_CURRENCY).map(c => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2 block">Amount</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">{currency.symbol}</span>
                                                <input
                                                    type="number"
                                                    name="amount"
                                                    value={formData.amount}
                                                    onChange={handleChange}
                                                    placeholder="0.00"
                                                    className="w-full bg-[#0D1117] border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2 block">Location</label>
                                            <select
                                                name="location"
                                                value={formData.location}
                                                onChange={handleChange}
                                                className="w-full bg-[#0D1117] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                                                required
                                            >
                                                <option value="">Select</option>
                                                {locations.map(l => (
                                                    <option key={l} value={l}>{l}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2 block">Time</label>
                                            <input
                                                type="time"
                                                name="time"
                                                value={formData.time}
                                                onChange={handleChange}
                                                className="w-full bg-[#0D1117] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2 block">Monthly Avg</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">{currency.symbol}</span>
                                                <input
                                                    type="number"
                                                    name="avg_spending"
                                                    value={formData.avg_spending}
                                                    onChange={handleChange}
                                                    placeholder="0.00"
                                                    className="w-full bg-[#0D1117] border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full mt-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 disabled:opacity-50"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                <span>Analyzing...</span>
                                            </>
                                        ) : (
                                            <>
                                                <ShieldAlert className="w-5 h-5" />
                                                <span>Analyze Transaction</span>
                                            </>
                                        )}
                                    </button>
                                </form>
                            </motion.div>

                            {result && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-[#161B22] rounded-2xl p-6 border border-white/5"
                                >
                                    <div className="flex items-center gap-2 mb-4">
                                        <Info className="w-4 h-4 text-blue-400" />
                                        <h4 className="text-sm font-medium text-white">Model Transparency</h4>
                                    </div>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-white/50">Model</span>
                                            <span className="text-white">{result.model_info?.name || 'RandomForest'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-white/50">Version</span>
                                            <span className="text-white">{result.model_info?.version || '1.0.0'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-white/50">Precision</span>
                                            <span className="text-blue-400">{result.model_info?.precision?.toFixed(1) || 11.9}%</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-white/50">Recall</span>
                                            <span className="text-green-400">{result.model_info?.recall?.toFixed(1) || 73.3}%</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-white/50">Confidence</span>
                                            <span className="text-purple-400">{((result.model_info?.confidence || 0) * 100).toFixed(0)}%</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-white/50">Prediction Mode</span>
                                            <span className="text-green-400">Live ML</span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        <div className="lg:col-span-3 space-y-6">
                            <AnimatePresence mode="wait">
                                {isLoading ? (
                                    <motion.div
                                        key="loading"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="bg-[#161B22] rounded-2xl p-8 border border-white/5"
                                    >
                                        <div className="flex items-center gap-3 mb-8">
                                            <Sparkles className="w-6 h-6 text-blue-400 animate-pulse" />
                                            <h3 className="text-lg font-semibold text-white">AI Processing</h3>
                                        </div>
                                        <div className="space-y-2 max-w-sm">
                                            {['Analyzing transaction...', 'Extracting behavioral features...', 'Running fraud prediction model...', 'Generating AI explanation...'].map((label, i) => (
                                                <ProcessingStep 
                                                    key={i} 
                                                    step={i} 
                                                    label={label} 
                                                    isActive={processingStep === i}
                                                    isComplete={processingStep > i}
                                                />
                                            ))}
                                        </div>
                                        <div className="mt-8">
                                            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                                <motion.div
                                                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                                                    initial={{ width: '0%' }}
                                                    animate={{ width: '100%' }}
                                                    transition={{ duration: 2.4, ease: 'easeInOut' }}
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : error ? (
                                    <motion.div
                                        key="error"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-red-500/10 rounded-2xl p-8 border border-red-500/20 text-center"
                                    >
                                        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                                        <p className="text-red-400">{error}</p>
                                    </motion.div>
                                ) : result ? (
                                    <motion.div
                                        key="result"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-6"
                                    >
                                        <div className={`bg-[#161B22] rounded-2xl p-6 border ${
                                            result.risk_level === 'HIGH' ? 'border-red-500/30 bg-red-500/5' :
                                            result.risk_level === 'MEDIUM' ? 'border-yellow-500/30 bg-yellow-500/5' :
                                            'border-green-500/30 bg-green-500/5'
                                        }`}>
                                            <div className="flex items-center justify-between mb-6">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                                        result.risk_level === 'HIGH' ? 'bg-red-500/20' :
                                                        result.risk_level === 'MEDIUM' ? 'bg-yellow-500/20' :
                                                        'bg-green-500/20'
                                                    }`}>
                                                        {result.risk_level === 'HIGH' ? (
                                                            <ShieldAlert className="w-6 h-6 text-red-400" />
                                                        ) : result.risk_level === 'MEDIUM' ? (
                                                            <AlertTriangle className="w-6 h-6 text-yellow-400" />
                                                        ) : (
                                                            <ShieldCheck className="w-6 h-6 text-green-400" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <span className={`text-2xl font-bold ${
                                                            result.risk_level === 'HIGH' ? 'text-red-400' :
                                                            result.risk_level === 'MEDIUM' ? 'text-yellow-400' :
                                                            'text-green-400'
                                                        }`}>
                                                            {result.risk_level} RISK
                                                        </span>
                                                        <p className="text-sm text-white/50">Analysis Complete</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-3xl font-bold text-white">
                                                        {(result.anomaly_score * 100).toFixed(1)}%
                                                    </div>
                                                    <p className="text-xs text-white/50">Fraud Probability</p>
                                                </div>
                                            </div>

                                            <div className="mb-6">
                                                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                                                    <motion.div
                                                        className={`h-full rounded-full ${
                                                            result.risk_level === 'HIGH' ? 'bg-gradient-to-r from-red-600 to-red-400' :
                                                            result.risk_level === 'MEDIUM' ? 'bg-gradient-to-r from-yellow-600 to-yellow-400' :
                                                            'bg-gradient-to-r from-green-600 to-green-400'
                                                        }`}
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${result.anomaly_score * 100}%` }}
                                                        transition={{ duration: 1, delay: 0.3 }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="bg-[#0D1117] rounded-xl p-4 mb-4">
                                                <p className="text-xs text-white/50 uppercase tracking-wider mb-2">AI Explanation</p>
                                                <p className="text-white leading-relaxed">{result.explanation}</p>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                {result.key_factors?.map((factor, i) => (
                                                    <span key={i} className="px-3 py-1.5 bg-white/5 rounded-lg text-xs text-white/70 border border-white/10">
                                                        {factor}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <DynamicCharts result={result} formData={formData} />

                                        <div className={`bg-[#161B22] rounded-2xl p-6 border border-white/5 ${
                                            result.risk_level === 'HIGH' ? 'border-red-500/30' :
                                            result.risk_level === 'MEDIUM' ? 'border-yellow-500/30' :
                                            'border-green-500/30'
                                        }`}>
                                            <div className="flex items-center gap-3 mb-4">
                                                <Lock className={`w-5 h-5 ${
                                                    result.risk_level === 'HIGH' ? 'text-red-400' :
                                                    result.risk_level === 'MEDIUM' ? 'text-yellow-400' :
                                                    'text-green-400'
                                                }`} />
                                                <h4 className="text-sm font-medium text-white">Recommendation</h4>
                                            </div>
                                            <p className={`text-xl font-semibold ${
                                                result.risk_level === 'HIGH' ? 'text-red-400' :
                                                result.risk_level === 'MEDIUM' ? 'text-yellow-400' :
                                                'text-green-400'
                                            }`}>
                                                {result.recommendation}
                                            </p>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="empty"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="bg-[#161B22] rounded-2xl p-12 border border-white/5 text-center"
                                    >
                                        <div className="w-20 h-20 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                            <Shield className="w-10 h-10 text-blue-400" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-white mb-2">Ready for Analysis</h3>
                                        <p className="text-white/50">Submit a transaction to begin fraud analysis</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
