import React from 'react';
import { motion } from 'framer-motion';

const Layout = ({ children }) => {
    return (
        <div className="relative min-h-screen w-full bg-[#0B0F19] overflow-hidden text-white font-sans">
            {/* Animated Mesh Background */}
            <div className="mesh-bg">
                <motion.div 
                    animate={{ 
                        x: [0, 100, 0], 
                        y: [0, 50, 0],
                        rotate: [0, 360]
                    }}
                    transition={{ 
                        duration: 30, 
                        repeat: Infinity, 
                        ease: "linear" 
                    }}
                    className="mesh-gradient top-[-20%] left-[-10%]" 
                />
                <motion.div 
                    animate={{ 
                        x: [0, -80, 0], 
                        y: [0, -100, 0],
                        rotate: [360, 0]
                    }}
                    transition={{ 
                        duration: 25, 
                        repeat: Infinity, 
                        ease: "linear" 
                    }}
                    className="mesh-gradient-2 bottom-[-10%] right-[-5%]" 
                />
            </div>

            {/* Content Wrapper */}
            <div className="relative z-10 flex min-h-screen">
                {children}
            </div>
        </div>
    );
};

export default Layout;
