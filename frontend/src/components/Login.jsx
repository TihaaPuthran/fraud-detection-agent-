import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, ArrowRight, AlertCircle, Cpu, Zap, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const FloatingOrb = ({ delay, size, x, y, color }) => (
    <motion.div
        className={`absolute rounded-full blur-3xl opacity-30 ${color}`}
        style={{
            width: size,
            height: size,
            left: x,
            top: y,
        }}
        animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
            duration: 8,
            repeat: Infinity,
            delay,
            ease: "easeInOut",
        }}
    />
);

const NeuralNetwork = () => {
    const nodes = [
        { x: 15, y: 20 }, { x: 35, y: 15 }, { x: 55, y: 25 }, { x: 75, y: 18 }, { x: 85, y: 30 },
        { x: 25, y: 45 }, { x: 45, y: 40 }, { x: 65, y: 48 }, { x: 80, y: 55 },
        { x: 30, y: 70 }, { x: 50, y: 65 }, { x: 70, y: 75 },
    ];
    
    const connections = [
        [0, 5], [1, 5], [1, 6], [2, 6], [2, 7], [3, 7],
        [5, 9], [6, 9], [6, 10], [7, 10], [7, 11], [8, 11],
        [0, 1], [1, 2], [2, 3], [3, 4], [5, 6], [6, 7], [7, 8],
    ];
    
    return (
        <svg className="absolute inset-0 w-full h-full opacity-20">
            <defs>
                <linearGradient id="neuralGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="50%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#22D3EE" />
                </linearGradient>
            </defs>
            {connections.map(([start, end], i) => (
                <motion.line
                    key={i}
                    x1={`${nodes[start].x}%`}
                    y1={`${nodes[start].y}%`}
                    x2={`${nodes[end].x}%`}
                    y2={`${nodes[end].y}%`}
                    stroke="url(#neuralGradient)"
                    strokeWidth="1"
                    initial={{ opacity: 0, pathLength: 0 }}
                    animate={{ opacity: [0.3, 0.6, 0.3], pathLength: 1 }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: i * 0.1,
                    }}
                />
            ))}
            {nodes.map((node, i) => (
                <motion.circle
                    key={i}
                    cx={`${node.x}%`}
                    cy={`${node.y}%`}
                    r="4"
                    fill="#3B82F6"
                    initial={{ scale: 0 }}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{
                        duration: 2,
                        delay: i * 0.15,
                        repeat: Infinity,
                    }}
                />
            ))}
        </svg>
    );
};

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const getNameFromEmail = (email) => {
        if (!email) return 'User';
        const name = email.split('@')[0];
        return name.charAt(0).toUpperCase() + name.slice(1);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        if (email && password) {
            const userName = getNameFromEmail(email);
            login({
                name: userName,
                email: email,
                avatar: userName.charAt(0).toUpperCase()
            });
            navigate('/dashboard');
        } else {
            setError('Please fill in all fields');
            setIsLoading(false);
        }
    };

    const handleQuickLogin = async (name) => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        login({
            name,
            email: `${name.toLowerCase()}@example.com`,
            avatar: name.charAt(0).toUpperCase()
        });
        navigate('/dashboard');
    };

    return (
        <div className="min-h-screen flex bg-[#0B0F19] relative overflow-hidden">
            <FloatingOrb delay={0} size="400px" x="10%" y="20%" color="bg-blue-500" />
            <FloatingOrb delay={2} size="300px" x="60%" y="10%" color="bg-purple-500" />
            <FloatingOrb delay={4} size="250px" x="30%" y="60%" color="bg-cyan-500" />
            
            <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative z-10">
                <NeuralNetwork />
                
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative"
                >
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/30">
                            <Shield className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">
                                FRAUD<span className="text-blue-400">SENTINEL</span>
                            </h1>
                            <p className="text-xs text-white/40 uppercase tracking-[0.3em]">AI Fraud Intelligence Platform</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="relative space-y-8"
                >
                    <div className="space-y-4">
                        <h2 className="text-5xl font-bold text-white leading-tight">
                            Enterprise Fraud<br />
                            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                                Detection
                            </span>
                            <br />Powered by AI
                        </h2>
                        <p className="text-white/50 text-lg max-w-md leading-relaxed">
                            Advanced machine learning models analyze transaction patterns in real-time to detect and prevent fraudulent activity.
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { icon: Cpu, label: 'ML Models', value: '99.9%' },
                            { icon: Zap, label: 'Response', value: '<50ms' },
                            { icon: Lock, label: 'Encrypted', value: 'AES-256' },
                        ].map((stat, idx) => (
                            <motion.div 
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 + idx * 0.1 }}
                                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4"
                            >
                                <stat.icon className="w-5 h-5 text-blue-400 mb-2" />
                                <p className="text-2xl font-bold text-white">{stat.value}</p>
                                <p className="text-xs text-white/40">{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="relative text-sm text-white/30"
                >
                    © 2026 FraudSentinel. Enterprise AI security for modern finance.
                </motion.div>
            </div>

            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md"
                >
                    <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold text-white">FRAUD<span className="text-blue-400">SENTINEL</span></span>
                    </div>

                    <div className="text-center mb-8">
                        <motion.h2 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-3xl font-bold text-white mb-2"
                        >
                            Welcome back
                        </motion.h2>
                        <p className="text-white/50">Sign in to access your intelligence dashboard</p>
                    </div>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="space-y-3 mb-6"
                    >
                        <button
                            type="button"
                            onClick={() => handleQuickLogin('Admin')}
                            className="w-full py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl transition-all flex items-center justify-center gap-2 font-medium"
                        >
                            <div className="w-6 h-6 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center text-xs font-bold">A</div>
                            Continue as Admin
                        </button>
                        <button
                            type="button"
                            onClick={() => handleQuickLogin('Analyst')}
                            className="w-full py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl transition-all flex items-center justify-center gap-2 font-medium"
                        >
                            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-xs font-bold">S</div>
                            Continue as Analyst
                        </button>
                    </motion.div>

                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex-1 h-px bg-white/10" />
                        <span className="text-xs text-white/30 uppercase">or continue with</span>
                        <div className="flex-1 h-px bg-white/10" />
                    </div>

                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm mb-4"
                        >
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-2">Email</label>
                            <input 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@company.com"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-2">Password</label>
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                                required
                            />
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 cursor-pointer text-white/50 hover:text-white/70 transition-colors">
                                <input type="checkbox" className="w-4 h-4 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500/20" />
                                Remember me
                            </label>
                            <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors">Forgot password?</a>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full mt-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Signing in...</span>
                                </>
                            ) : (
                                <>
                                    <span>Sign in to Dashboard</span>
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-xs text-white/30 mt-8">
                        Protected by enterprise-grade security • SOC 2 Compliant
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;
