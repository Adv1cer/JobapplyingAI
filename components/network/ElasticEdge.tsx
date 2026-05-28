'use client';

import { memo } from 'react';
import { BaseEdge, type EdgeProps } from '@xyflow/react';

function ElasticEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
}: EdgeProps) {
  if (Math.hypot(targetX - sourceX, targetY - sourceY) < 1) return null;

  const path = `M ${sourceX},${sourceY} L ${targetX},${targetY}`;

  // Stagger particle speed per edge so they don't all sync up
  const charSum = id.split('').reduce((s, c) => s + c.charCodeAt(0), 0);
  const dur = (2.2 + (charSum % 5) * 0.5).toFixed(1);

  return (
    <>
      {/* Volumetric Neon Glow Layer ด้วย WebGL Glow SVG Filter จากไฟล์ LandingPage */}
      <path 
        d={path} 
        fill="none" 
        stroke="rgba(59,130,246,0.38)" 
        strokeWidth={2.2} 
        filter="url(#webgl-glow)" 
      />

      {/* Core Fine Line (เส้นแสงผ่ากลางคมๆ) */}
      <path 
        d={path} 
        fill="none" 
        stroke="rgba(219,234,254,0.75)" 
        strokeWidth={1.1} 
      />

      {/* Traveling light particle: วิ่งออกจากใจกลางพิกเซลตรงๆ ดึ๋งไปตามสายสปริง */}
      <circle r="2.2" fill="rgba(255,255,255,0.98)" filter="url(#webgl-glow)">
        <animateMotion
          dur={`${dur}s`}
          repeatCount="indefinite"
          path={path}
        />
      </circle>

      {/* Invisible wide hitbox for click/select/delete */}
      <BaseEdge
        id={id}
        path={path}
        style={{ stroke: 'transparent', fill: 'none' }}
        interactionWidth={20}
      />
    </>
  );
}

export default memo(ElasticEdge);