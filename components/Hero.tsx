"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Hero() {
    return (
        <section className="relative min-h-[calc(100vh-80px)] md:min-h-screen flex flex-col items-center justify-center bg-[#0d0d0d] overflow-hidden px-6 pb-12 pt-16">

            {/* Subtle Glow Background */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <style>{`
                    @keyframes heroGlow {
                        0%, 100% { opacity: 0.3; transform: scale(1); }
                        50% { opacity: 0.5; transform: scale(1.05); }
                    }
                    .animated-glow-bg {
                        background: radial-gradient(circle at 50% 40%, rgba(201, 168, 76, 0.04) 0%, transparent 60%);
                        animation: heroGlow 8s ease-in-out infinite;
                    }
                `}</style>
                <div className="absolute inset-0 animated-glow-bg"></div>
            </div>

            <div className="max-w-4xl mx-auto w-full flex flex-col items-center justify-center text-center z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="flex flex-col items-center w-full"
                >
                    <span className="text-[#c9a84c] text-xs font-semibold tracking-[0.2em] uppercase mb-10 block">
                        EST. 2024 · INKWELL
                    </span>

                    <h1 className="font-serif text-[#f0ece4] leading-[1.1] tracking-tight mb-8 w-full flex flex-col items-center">
                        <span className="text-5xl md:text-7xl font-light mb-2 block">Ink Your</span>
                        <span className="text-6xl md:text-8xl font-black block relative">
                            World.
                            <span className="absolute -bottom-2 md:-bottom-4 left-0 w-full h-1 md:h-2 bg-[#c9a84c] rounded-full opacity-90"></span>
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-[#6b6b6b] mb-12 max-w-xl mx-auto font-light leading-relaxed">
                        A beautiful, distraction-free space to write, publish, and engage with a community of thoughtful readers.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 w-full max-w-sm sm:max-w-none">
                        <Link
                            href="/new"
                            className="bg-[#c9a84c] text-[#0a0a0a] px-10 py-4 rounded-[16px] font-bold hover:bg-[#e8c96a] transition-all w-full sm:w-auto text-center"
                        >
                            Start Writing
                        </Link>

                        <Link
                            href="#explore"
                            className="bg-transparent text-[#c9a84c] px-10 py-4 rounded-[16px] font-semibold hover:bg-[#c9a84c]/10 transition-all border border-[#c9a84c] w-full sm:w-auto text-center flex items-center justify-center group"
                        >
                            Read Stories
                            <ArrowRight className="ml-3 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </motion.div>
            </div>

            {/* Bottom Gold Line */}
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-[#c9a84c]/30"></div>
        </section>
    );
}
