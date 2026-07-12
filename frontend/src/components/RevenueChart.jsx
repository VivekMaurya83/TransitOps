import React from 'react';
import { motion } from 'framer-motion';

export default function RevenueChart({ data = [] }) {
  if (!data || data.length === 0) return null;

  // Find max and min to scale the data points into the SVG viewbox (100x100)
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  // Convert raw values into SVG coords (x: 0..100, y: 10..90 to leave padding)
  const padding = 15;
  const height = 100;
  const width = 100;

  const points = data.map((val, index) => {
    const x = (index / (data.length - 1)) * width;
    // In SVG, y=0 is at the top, so we invert it
    const y = height - padding - ((val - min) / range) * (height - 2 * padding);
    return { x, y };
  });

  // Construct the SVG path string
  // Using linear segments (L) or smooth curves (C)
  // Let's build a smooth line. A quick quadratic/cubic Bezier helper or simple line is nice.
  // Let's create a cubic bezier curve path for a very premium look:
  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const cpX1 = p0.x + (p1.x - p0.x) / 3;
    const cpY1 = p0.y;
    const cpX2 = p0.x + 2 * (p1.x - p0.x) / 3;
    const cpY2 = p1.y;
    pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
  }

  // Construct the filled area path (goes down to bottom corners)
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  return (
    <div className="w-full h-full relative min-h-[300px] flex items-end">
      {/* Background Grid Lines */}
      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 dark:opacity-10 py-6">
        <div className="border-b border-outline-variant w-full" />
        <div className="border-b border-outline-variant w-full" />
        <div className="border-b border-outline-variant w-full" />
        <div className="border-b border-outline-variant w-full" />
        <div className="border-b border-outline-variant w-full" />
      </div>

      {/* SVG Canvas */}
      <svg 
        className="w-full h-full z-10" 
        viewBox="0 0 100 100" 
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="revenue-chart-gradient" x1="0" y1="0" x2="0" y2="1">
            {/* Using brand primary/tertiary colors */}
            <stop offset="0%" stopColor="#714b67" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#4552c3" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Filled Gradient Area (Animated opacity) */}
        <motion.path
          d={areaD}
          fill="url(#revenue-chart-gradient)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        />

        {/* SVG Stroke Line (Animated draw in) */}
        <motion.path
          d={pathD}
          fill="none"
          stroke="#714b67"
          strokeWidth="1.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />

        {/* Data Point Dots (Animated delay fade-in) */}
        {points.map((pt, idx) => (
          <motion.circle
            key={idx}
            cx={pt.x}
            cy={pt.y}
            r="1.2"
            className="fill-secondary dark:fill-secondary-fixed stroke-surface dark:stroke-surface-dim"
            strokeWidth="0.5"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.8 + idx * 0.05 }}
            whileHover={{ r: 2 }}
          />
        ))}
      </svg>

      {/* X Axis labels placeholder */}
      <div className="absolute bottom-1 inset-x-0 flex justify-between px-2 text-[10px] text-on-surface-variant/70 font-semibold pointer-events-none z-20">
        <span>Start</span>
        <span>Mid</span>
        <span>End</span>
      </div>
    </div>
  );
}
