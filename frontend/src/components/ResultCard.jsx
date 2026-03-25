import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ShieldAlert, Info, Cpu, Search, Fingerprint, BrainCircuit, AlertCircle, CheckCircle2, Zap } from 'lucide-react';

const ResultCard = ({ result, isLoading, error }) => {
    const [step, setStep] = useState(0);
    const steps = [
        { icon: Search, text: "Analyzing transaction context..." },
        { icon: Cpu, text: "Running anomaly detection models..." },
        { icon: Fingerprint, text: "Verifying digital signature patterns..." },
        { icon: BrainCircuit, text: "Generating AI-powered explanation..." }
    ];

    useEffect(() => {
        if (isLoading) {
            setStep(0);
            const interval = setInterval(() => {
                setStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
            }, 1200);
            return () => clearInterval(interval);
        }
    }, [isLoading]);

    if (isLoading) {
        return (
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card-premium p-10 lg:p-12 h-full flex flex-col items-center justify-center text-center space-y-10 border-blue-500/20"
            >
                <div className="relative">
                    <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="w-32 h-32 rounded-full border-t-2 border-b-2 border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.3)]"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Cpu className="w-10 h-10 text-blue-400 animate-pulse" />
                    </div>
                </div>
                
                <div className="space-y-4 w-full max-w-sm">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex items-center justify-center gap-4 py-3 px-6 bg-white/[0.03] rounded-2xl border border-white/[0.05]"
                        >
                            {React.createElement(steps[step].icon, { className: "w-5 h-5 text-blue-400" })}
                            <span className="text-sm font-bold tracking-tight text-gray-300">{steps[step].text}</span>
                        </motion.div>
                    </AnimatePresence>
                    
                    <div className="w-full bg-white/[0.05] h-1.5 rounded-full overflow-hidden">
                        <motion.div 
                            className="h-full bg-blue-500"
                            initial={{ width: "0%" }}
                            animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                </div>
            </motion.div>
        );
    }

    if (error) {
        return (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card-premium p-10 h-full flex flex-col items-center justify-center text-center border-red-500/20"
            >
                <div className="p-4 bg-red-400/10 rounded-3xl mb-6">
                    <AlertCircle className="w-12 h-12 text-red-500" />
                </div>
                <h3 className="text-xl font-black font-heading mb-3 text-red-400">Analysis Interrupted</h3>
                <p className="text-gray-500 max-w-xs font-bold leading-relaxed">{error}</p>
            </motion.div>
        );
    }

    if (!result) {
        return (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card-premium p-10 h-full flex flex-col items-center justify-center text-center border-white/[0.05]"
            >
                <div className="p-6 bg-white/[0.02] rounded-[2.5rem] mb-8 border border-white/[0.05]">
                    <Cpu className="w-16 h-16 text-gray-700" />
                </div>
                <h3 className="text-2xl font-black font-heading mb-4 text-gray-400">Ready for Analysis</h3>
                <p className="text-gray-600 max-w-sm font-bold">Initiate a transaction verification to see real-time AI results.</p>
            </motion.div>
        );
    }

    const isHighRisk = result.risk_level === 'HIGH';
    const isMediumRisk = result.risk_level === 'MEDIUM';

    return (
        <motion.div 
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`glass-card-premium p-10 lg:p-12 h-full flex flex-col border-2 transition-colors duration-1000 ${
                isHighRisk ? 'border-red-500/30 shadow-[0_0_80px_rgba(239,68,68,0.15)] animate-risk-pulse' : 
                isMediumRisk ? 'border-yellow-500/20 shadow-[0_0_60px_rgba(250,204,21,0.1)]' : 
                'border-green-500/20 shadow-[0_0_60px_rgba(34,197,94,0.1)]'
            }`}
        >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-8 mb-12">
                <div className="text-center sm:text-left">
                    <p className="text-[11px] font-black text-gray-500 uppercase tracking-[0.3em] mb-3">Threat Assessment</p>
                    <div className="flex items-center gap-4 justify-center sm:justify-start">
                        <div className={`px-8 py-3 rounded-full font-black text-xl tracking-tighter ${
                            isHighRisk ? 'bg-red-500/20 text-red-500 border border-red-500/30' : 
                            isMediumRisk ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' : 
                            'bg-green-500/20 text-green-500 border border-green-500/30'
                        }`}>
                            {result.risk_level} RISK
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-center sm:items-end">
                    <p className="text-[11px] font-black text-gray-500 uppercase tracking-[0.3em] mb-3">Anomaly Score</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-black font-heading tracking-tighter leading-none">
                            {(result.anomaly_score * 100).toFixed(1)}
                        </span>
                        <span className="text-sm font-black text-gray-500 uppercase tracking-widest">%</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <BrainCircuit className="w-6 h-6 text-blue-400" />
                        <h4 className="text-lg font-black font-heading tracking-tight">AI Reasoning</h4>
                    </div>
                    <div className="p-6 bg-white/[0.03] rounded-3xl border border-white/[0.05] leading-relaxed text-gray-300 text-sm font-medium">
                        {result.explanation}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <Zap className="w-6 h-6 text-yellow-400" />
                        <h4 className="text-lg font-black font-heading tracking-tight">Recommendation</h4>
                    </div>
                    <div className={`p-6 rounded-3xl border flex items-start gap-4 ${
                        isHighRisk ? 'bg-red-500/10 border-red-500/20 text-red-100' :
                        isMediumRisk ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-100' :
                        'bg-green-500/10 border-green-500/20 text-green-100'
                    }`}>
                        {isHighRisk ? <ShieldAlert className="w-6 h-6 shrink-0 mt-0.5" /> : 
                         isMediumRisk ? <Info className="w-6 h-6 shrink-0 mt-0.5" /> : 
                         <ShieldCheck className="w-6 h-6 shrink-0 mt-0.5" />}
                        <p className="font-bold tracking-tight uppercase text-xs sm:text-sm">{result.recommendation}</p>
                    </div>
                </div>
            </div>

            <div className="mt-auto pt-10 border-t border-white/[0.05] flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {isHighRisk ? <AlertCircle className="w-5 h-5 text-red-500" /> : <CheckCircle2 className="w-5 h-5 text-green-400" />}
                    <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest">
                        {isHighRisk ? 'Security Protocol: Lockdown' : 'Security Protocol: Clear'}
                    </span>
                </div>
                <div className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">
                    ID: {Math.random().toString(36).substring(2, 10).toUpperCase()}
                </div>
            </div>
        </motion.div>
    );
};

export default ResultCard;
