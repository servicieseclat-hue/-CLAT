/**
 * ERP ÉCLAT - Official Brand Logo Component
 * Servicios Integrales de Limpieza y Catering ÉCLAT
 * Primary Brand Colors: #004346 & #D6F3F4
 */

import React from 'react';

interface LogoProps {
  variant?: 'full' | 'compact' | 'symbol';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  darkBg?: boolean;
}

export const LogoEclat: React.FC<LogoProps> = ({ variant = 'full', size = 'md', darkBg = false }) => {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-11',
    lg: 'h-16',
    xl: 'h-24'
  };

  const textColorClass = darkBg ? 'text-white' : 'text-[#004346]';
  const subtitleColorClass = darkBg ? 'text-[#D6F3F4]' : 'text-slate-700';

  return (
    <div className="flex items-center gap-3 select-none">
      {/* ÉCLAT Brand Symbol (Swirl 'e' with star) */}
      <div className={`relative flex items-center justify-center shrink-0 ${sizeClasses[size]}`}>
        <svg
          viewBox="0 0 200 200"
          className="h-full w-auto drop-shadow-sm"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Light Blue Outer Ribbon Gradient */}
            <linearGradient id="eclatLightBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9ccde1" />
              <stop offset="40%" stopColor="#76b3cc" />
              <stop offset="100%" stopColor="#4f91b0" />
            </linearGradient>

            {/* Main Dark Teal Calligraphic Ribbon Gradient */}
            <linearGradient id="eclatDeepTealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#084a56" />
              <stop offset="50%" stopColor="#00373d" />
              <stop offset="100%" stopColor="#022127" />
            </linearGradient>

            {/* Mid Teal Shadow Ribbon Gradient */}
            <linearGradient id="eclatMidTealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2c788a" />
              <stop offset="100%" stopColor="#0b4854" />
            </linearGradient>

            {/* Bottom Right Wave Spiral Gradient */}
            <linearGradient id="eclatSpiralGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#96cae0" />
              <stop offset="60%" stopColor="#5d9ebb" />
              <stop offset="100%" stopColor="#1e6475" />
            </linearGradient>
          </defs>

          {/* Layer 1: Left Tail & Top Outer Loop (Light Blue Sky Swoosh) */}
          <path
            d="M 6 182 C 28 145 75 110 112 80 C 138 58 172 26 156 8 C 140 -8 88 12 52 54 C 20 92 8 138 28 174 C 48 208 98 214 142 198 C 172 188 188 162 182 138 C 172 158 142 180 108 182 C 68 184 40 165 38 135 C 36 102 56 68 88 40 C 118 16 152 6 160 18 C 166 28 138 52 110 75 C 70 108 28 140 6 182 Z"
            fill="url(#eclatLightBlueGrad)"
          />

          {/* Layer 2: Main Dark Navy-Teal Inner Calligraphic Spine */}
          <path
            d="M 52 136 C 48 108 68 72 100 48 C 128 28 160 12 165 22 C 168 30 144 50 118 70 C 80 98 42 122 28 142 C 38 128 72 102 108 78 C 136 58 164 42 162 28 C 160 16 138 22 110 40 C 72 65 38 102 40 134 C 42 162 70 180 106 180 C 146 180 178 156 186 136 C 170 158 134 172 100 172 C 68 172 52 154 52 136 Z"
            fill="url(#eclatDeepTealGrad)"
          />

          {/* Layer 3: Mid-Teal Secondary Sweep Line (Crossbar of the 'e') */}
          <path
            d="M 58 126 C 72 108 102 85 132 66 C 152 54 168 44 166 50 C 162 58 138 74 112 92 C 82 112 62 128 58 126 Z"
            fill="url(#eclatMidTealGrad)"
          />

          {/* Layer 4: Bottom Right Wave Spiral Curl */}
          <path
            d="M 148 114 C 142 138 158 168 184 162 C 196 160 196 142 184 134 C 170 126 154 134 160 150 C 164 160 178 156 180 144 C 180 135 170 135 168 142 C 165 148 174 152 178 146 C 172 152 162 144 162 135 C 162 122 178 118 188 132 C 196 145 192 168 172 172 C 144 178 130 144 148 114 Z"
            fill="url(#eclatSpiralGrad)"
          />

          {/* Layer 5: 4-Point Concave Diamond Sparkle Star */}
          <path
            d="M 174 84 Q 174 96 186 96 Q 174 96 174 108 Q 174 96 162 96 Q 174 96 174 84 Z"
            fill="#0d93a1"
          />
        </svg>
      </div>

      {variant !== 'symbol' && (
        <div className="flex flex-col justify-center leading-none">
          <div className={`font-black tracking-tight ${textColorClass} ${
            size === 'sm' ? 'text-lg' : size === 'md' ? 'text-2xl' : size === 'lg' ? 'text-4xl' : 'text-5xl'
          }`}>
            ÉCLAT
          </div>
          {variant === 'full' && (
            <div className={`font-semibold tracking-wider text-[10px] sm:text-xs uppercase mt-0.5 border-t border-slate-300 pt-0.5 ${subtitleColorClass}`}>
              Servicios de Limpieza y Catering
            </div>
          )}
        </div>
      )}
    </div>
  );
};
