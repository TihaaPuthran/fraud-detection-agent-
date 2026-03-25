import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, BarChart, Send, ShieldCheck, Info, Globe } from 'lucide-react';

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

const InputField = ({ icon: Icon, label, name, value, onChange, type = "text", options = [], placeholder, required, step }) => (
    <div className="flex flex-col">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 ml-1">{label}</label>
        <div className="relative">
            {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />}
            {type === "select" ? (
                <select
                    name={name}
                    value={value}
                    onChange={onChange}
                    className={`w-full bg-gray-900/80 border border-gray-700/50 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all duration-300 appearance-none cursor-pointer ${Icon ? 'pl-12' : ''}`}
                    required={required}
                >
                    <option value="" disabled className="bg-gray-900">Select {label}</option>
                    {options.map(opt => (
                        <option key={opt} value={opt} className="bg-gray-900">{opt}</option>
                    ))}
                </select>
            ) : (
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={`w-full bg-gray-900/80 border border-gray-700/50 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all duration-300 ${Icon ? 'pl-12' : ''}`}
                    required={required}
                    min={type === "number" ? 0 : undefined}
                    step={step}
                />
            )}
        </div>
    </div>
);

const TransactionForm = ({ formData, handleChange, handleSubmit, isLoading }) => {
    const [country, setCountry] = React.useState("USA");
    const currency = COUNTRY_CURRENCY[country];
    const locations = COUNTRY_LOCATIONS[country];

    const handleCountryChange = (e) => {
        const newCountry = e.target.value;
        setCountry(newCountry);
        handleChange({ target: { name: "country", value: newCountry } });
        handleChange({ target: { name: "location", value: "" } });
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gray-900/60 backdrop-blur-xl border border-gray-800/50 rounded-2xl shadow-2xl overflow-hidden"
        >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 px-8 py-6 border-b border-gray-800/50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/20 rounded-xl border border-blue-500/30">
                            <ShieldCheck className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Transaction Analysis</h3>
                            <p className="text-xs text-gray-400">Enter transaction details below</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 rounded-full border border-green-500/20">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs font-medium text-green-400">System Ready</span>
                    </div>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8">
                <div className="grid grid-cols-2 gap-6">
                    {/* Country */}
                    <InputField
                        icon={Globe}
                        label="Country"
                        name="country"
                        value={country}
                        onChange={handleCountryChange}
                        type="select"
                        options={Object.keys(COUNTRY_CURRENCY)}
                        required
                    />

                    {/* Amount */}
                    <InputField
                        icon={() => <span className="text-lg font-bold text-gray-500">{currency.symbol}</span>}
                        label={`Amount (${currency.name})`}
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        type="number"
                        placeholder="0.00"
                        required
                        step="any"
                    />

                    {/* Location */}
                    <InputField
                        icon={MapPin}
                        label="Location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        type="select"
                        options={locations}
                        required
                    />

                    {/* Time */}
                    <InputField
                        icon={Clock}
                        label="Time"
                        name="time"
                        value={formData.time}
                        onChange={handleChange}
                        type="time"
                        required
                    />

                    {/* Avg Spending */}
                    <div className="col-span-2">
                        <InputField
                            icon={BarChart}
                            label={`User's Monthly Average (${currency.name})`}
                            name="avg_spending"
                            value={formData.avg_spending}
                            onChange={handleChange}
                            type="number"
                            placeholder="0.00"
                            required
                            step="any"
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <div className="mt-8">
                    <motion.button 
                        type="submit" 
                        disabled={isLoading}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-white rounded-full animate-bounce" />
                                <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.15s]" />
                                <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.3s]" />
                                <span>Analyzing...</span>
                            </div>
                        ) : (
                            <>
                                <Send className="w-5 h-5" />
                                <span className="tracking-wide">Analyze Transaction</span>
                            </>
                        )}
                    </motion.button>
                </div>
            </form>

            {/* Footer Info */}
            <div className="px-8 pb-6">
                <div className="flex items-center gap-2 p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                    <Info className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <p className="text-xs text-blue-300/80">
                        System will analyze across 128+ data points for fraud detection
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

export default TransactionForm;
