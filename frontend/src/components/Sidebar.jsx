import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    LayoutDashboard, History, ShieldAlert, Settings, LogOut, 
    ShieldCheck, ChevronRight, Zap, Activity, Target, Radar,
    Cpu, Globe, TrendingUp, Eye
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

const AnimatedStats = () => {
    const [stats, setStats] = useState([
        { label: 'Detection Rate', value: 0, target: 99.4 },
        { label: 'Transactions', value: 0, target: 12847 },
        { label: 'Risk Alerts', value: 0, target: 23 },
    ]);

    useEffect(() => {
        const timers = stats.map((stat, idx) => {
            return setTimeout(() => {
                const duration = 2000;
                const steps = 60;
                let current = 0;
                const increment = stat.target / steps;
                const interval = setInterval(() => {
                    current += increment;
                    if (current >= stat.target) {
                        current = stat.target;
                        clearInterval(interval);
                    }
                    setStats(prev => prev.map((s, i) => 
                        i === idx ? { ...s, value: Math.round(current) } : s
                    ));
                }, duration / steps);
                return interval;
            }, idx * 300);
        });
        return () => timers.forEach(clearInterval);
    }, []);

    return (
        <div className="space-y-3">
            {stats.map((stat, idx) => (
                <div key={idx} className="relative">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                            {stat.label}
                        </span>
                        <span className="text-xs font-bold text-blue-400">
                            {stat.value.toLocaleString()}{stat.label === 'Detection Rate' ? '%' : ''}
                        </span>
                    </div>
                    <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(stat.value / stat.target) * 100}%` }}
                            transition={{ duration: 1.5, delay: idx * 0.3 }}
                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};

const FloatingDots = () => {
    const dots = Array.from({ length: 12 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 2,
        delay: Math.random() * 2,
    }));

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {dots.map((dot) => (
                <motion.div
                    key={dot.id}
                    className="absolute rounded-full bg-blue-500/30"
                    style={{
                        left: `${dot.x}%`,
                        top: `${dot.y}%`,
                        width: dot.size,
                        height: dot.size,
                    }}
                    animate={{
                        y: [0, -20, 0],
                        opacity: [0.3, 0.8, 0.3],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: dot.delay,
                        ease: "easeInOut",
                    }}
                />
            ))}
        </div>
    );
};

const NeuralNetwork = () => {
    const nodes = [
        { x: 20, y: 30 }, { x: 50, y: 20 }, { x: 80, y: 30 },
        { x: 35, y: 50 }, { x: 65, y: 50 },
        { x: 50, y: 70 },
    ];

    const connections = [
        [0, 1], [1, 2], [0, 3], [1, 3], [1, 4], [2, 4], [3, 5], [4, 5]
    ];

    return (
        <svg className="absolute inset-0 w-full h-full opacity-20">
            {connections.map(([start, end], i) => (
                <motion.line
                    key={i}
                    x1={`${nodes[start].x}%`}
                    y1={`${nodes[start].y}%`}
                    x2={`${nodes[end].x}%`}
                    y2={`${nodes[end].y}%`}
                    stroke="url(#gradient)"
                    strokeWidth="1"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, delay: i * 0.1 }}
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
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }}
                />
            ))}
            <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#8B5CF6" />
                </linearGradient>
            </defs>
        </svg>
    );
};

const WorldMap = () => {
    const locations = [
        { x: 25, y: 35 }, { x: 30, y: 40 },
        { x: 48, y: 32 }, { x: 52, y: 38 },
        { x: 72, y: 45 }, { x: 78, y: 55 },
        { x: 65, y: 65 }, { x: 68, y: 70 },
    ];

    return (
        <div className="relative w-full h-32 mb-4 opacity-60">
            <svg viewBox="0 0 100 60" className="w-full h-full" preserveAspectRatio="none">
                <defs>
                    <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#1E293B" />
                        <stop offset="100%" stopColor="#0F172A" />
                    </linearGradient>
                </defs>
                <path
                    d="M15,25 Q25,20 35,25 T55,22 T75,28 T85,35 Q80,45 70,48 T50,45 T30,42 T15,35 Z"
                    fill="url(#mapGradient)"
                    stroke="#334155"
                    strokeWidth="0.5"
                    opacity="0.8"
                />
            </svg>
            {locations.map((loc, i) => (
                <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full"
                    style={{
                        left: `${loc.x}%`,
                        top: `${loc.y}%`,
                        boxShadow: i % 2 === 0 ? '0 0 8px #3B82F6' : '0 0 8px #8B5CF6',
                    }}
                    animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.2,
                    }}
                />
            ))}
            <motion.div
                className="absolute top-1/2 left-1/2 w-8 h-8 -translate-x-1/2 -translate-y-1/2"
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
            >
                <div className="w-full h-full rounded-full border-2 border-cyan-500/30" />
            </motion.div>
        </div>
    );
};

const RiskDistribution = () => {
    const [distribution, setDistribution] = useState({ low: 0, medium: 0, high: 0 });
    
    useEffect(() => {
        setTimeout(() => {
            setDistribution({ low: 65, medium: 25, high: 10 });
        }, 500);
    }, []);

    return (
        <div className="flex items-center gap-2">
            <div className="flex-1">
                <div className="flex h-2 rounded-full overflow-hidden bg-white/[0.05]">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${distribution.low}%` }}
                        transition={{ duration: 1 }}
                        className="bg-green-500"
                    />
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${distribution.medium}%` }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="bg-yellow-500"
                    />
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${distribution.high}%` }}
                        transition={{ duration: 1, delay: 0.6 }}
                        className="bg-red-500"
                    />
                </div>
            </div>
            <span className="text-[10px] text-gray-400 font-mono">
                {distribution.low}/{distribution.medium}/{distribution.high}
            </span>
        </div>
    );
};

const Sidebar = () => {
    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: History, label: 'History', path: '/history' },
        { icon: Zap, label: 'Real-time Alerts', path: '/alerts' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    return (
        <motion.aside 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-80 h-screen glass-card-premium border-r border-white/[0.05] flex flex-col z-20 sticky top-0 overflow-hidden"
        >
            <div className="relative p-6 mb-2">
                <FloatingDots />
                <NeuralNetwork />
                
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4 group cursor-pointer">
                        <div className="p-2.5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.4)] group-hover:scale-110 transition-transform duration-500">
                            <ShieldCheck className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black tracking-tight">
                                <span className="text-white">FRAUD</span>
                                <span className="text-blue-500">SENTINEL</span>
                            </h2>
                            <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-gray-500">Core Engine v2.0</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-6 pb-4">
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/[0.08]"
                >
                    <div className="flex items-center gap-2 mb-3">
                        <Cpu className="w-4 h-4 text-cyan-400" />
                        <span className="text-xs font-bold text-white tracking-wide">AI Fraud Intelligence</span>
                    </div>
                    <p className="text-[10px] text-gray-400 leading-relaxed">
                        Real-time anomaly detection powered by machine learning and AI reasoning
                    </p>
                </motion.div>
            </div>

            <div className="px-6 mb-4">
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-4 rounded-2xl bg-[#0A0F1C] border border-white/[0.05]"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Radar className="w-4 h-4 text-purple-400 animate-pulse" />
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Global Activity</span>
                        </div>
                        <div className="flex gap-1">
                            {[...Array(3)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="w-1 h-1 rounded-full bg-blue-500"
                                    animate={{ opacity: [0.3, 1, 0.3] }}
                                    transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
                                />
                            ))}
                        </div>
                    </div>
                    <WorldMap />
                </motion.div>
            </div>

            <div className="px-6 mb-4">
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="p-4 rounded-2xl bg-[#0A0F1C] border border-white/[0.05]"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-blue-400" />
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Live Statistics</span>
                        </div>
                        <Eye className="w-3 h-3 text-gray-500" />
                    </div>
                    <AnimatedStats />
                </motion.div>
            </div>

            <div className="px-6 mb-4">
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="p-4 rounded-2xl bg-[#0A0F1C] border border-white/[0.05]"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-green-400" />
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Risk Distribution</span>
                        </div>
                        <Target className="w-3 h-3 text-gray-500" />
                    </div>
                    <RiskDistribution />
                </motion.div>
            </div>

            <nav className="flex-grow px-6 space-y-2">
                {menuItems.map((item, idx) => (
                    <NavLink
                        key={idx}
                        to={item.path}
                        className={({ isActive }) => `
                            flex items-center justify-between p-3.5 rounded-xl transition-all duration-500 group
                            ${isActive 
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]' 
                                : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.03] border border-transparent'}
                        `}
                    >
                        <div className="flex items-center gap-3">
                            <item.icon className={`w-4 h-4 transition-colors duration-500 group-hover:text-blue-400`} />
                            <span className="text-xs font-semibold uppercase tracking-wider">{item.label}</span>
                        </div>
                        <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-blue-400" />
                    </NavLink>
                ))}
            </nav>

            <div className="p-6 mt-auto border-t border-white/[0.05]">
                <div className="p-4 bg-gradient-to-r from-green-500/10 to-cyan-500/10 rounded-2xl border border-green-500/20 mb-4">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-green-500">System Nominal</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-medium text-gray-500 uppercase">AI Performance</span>
                        <span className="text-xs font-bold text-gray-300">98.4%</span>
                    </div>
                    <div className="w-full bg-white/[0.05] h-1.5 rounded-full overflow-hidden">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: '98.4%' }}
                            transition={{ duration: 1.5, delay: 0.5 }}
                            className="h-full bg-gradient-to-r from-green-500 to-cyan-500" 
                        />
                    </div>
                </div>

                <button className="w-full p-3.5 rounded-xl flex items-center gap-3 text-red-500/70 hover:text-red-500 hover:bg-red-500/10 transition-all duration-500 group border border-transparent hover:border-red-500/20">
                    <LogOut className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Terminate Session</span>
                </button>
            </div>
        </motion.aside>
    );
};

export default Sidebar;