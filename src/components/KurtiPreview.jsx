import React from "react";

export default function KurtiPreview({ fabricImage, customization = {}, measurements = {}, unit = "Inches" }) {
  // Normalize measurements to Inches
  const isCM = String(unit).toLowerCase() === "cm";
  const scale = isCM ? 1 / 2.54 : 1;

  const rawBust = Number(measurements.bust) || 36;
  const rawWaist = Number(measurements.waist) || 30;
  const rawHip = Number(measurements.hip) || 38;
  const rawShoulder = Number(measurements.shoulder) || 14;
  const rawSleeve = Number(measurements.sleeveLength) || 8;
  const rawDressLength = Number(measurements.dressLength) || 40;
  const rawNeckDepth = Number(measurements.neckDepth) || 6;

  const bust = rawBust * scale;
  const waist = rawWaist * scale;
  const hip = rawHip * scale;
  const shoulder = rawShoulder * scale;
  const sleeveLength = rawSleeve * scale;
  const dressLength = rawDressLength * scale;
  const neckDepth = rawNeckDepth * scale;

  // Apply fitting allowance
  let allowance = 0;
  if (customization.fittingStyle === "Tight Fit") allowance = 0;
  else if (customization.fittingStyle === "Loose Fit") allowance = 4;
  else allowance = 2; // Regular Fit

  const adjBust = bust + allowance;
  const adjWaist = waist + allowance;
  const adjHip = hip + allowance;

  // Coordinates
  const xCenter = 200;
  const yShoulder = 100;

  // Horizontal scaling factors
  const shoulderWidth = Math.min(160, Math.max(100, shoulder * 10));
  const halfShoulder = shoulderWidth / 2;

  const bustWidth = Math.min(200, Math.max(120, adjBust * 4.4));
  const halfBust = bustWidth / 2;

  const waistWidth = Math.min(180, Math.max(105, adjWaist * 4.0));
  const halfWaist = waistWidth / 2;

  const hipWidth = Math.min(210, Math.max(125, adjHip * 4.3));
  const halfHip = hipWidth / 2;

  const bottomWidth = halfHip * 1.15; // Slightly flared A-line hem

  // Heights
  const lengthHeight = Math.min(290, Math.max(180, dressLength * 7.2));
  const yBottom = yShoulder + lengthHeight;
  const yArmpit = yShoulder + 52;
  const yWaist = yShoulder + (lengthHeight * 0.35);
  const yHip = yShoulder + (lengthHeight * 0.62);

  // Key coordinate points
  const shoulderLeft = xCenter - halfShoulder;
  const shoulderRight = xCenter + halfShoulder;
  const armpitLeft = xCenter - halfBust;
  const armpitRight = xCenter + halfBust;
  const waistLeft = xCenter - halfWaist;
  const waistRight = xCenter + halfWaist;
  const hipLeft = xCenter - halfHip;
  const hipRight = xCenter + halfHip;
  const bottomLeft = xCenter - bottomWidth;
  const bottomRight = xCenter + bottomWidth;

  // Neck Configuration
  const neckStyle = customization.neckStyle || "Boat Neck";
  let halfNeckWidth = halfShoulder * 0.65;
  let hNeck = Math.min(100, Math.max(35, neckDepth * 9));

  if (neckStyle === "Boat Neck") {
    halfNeckWidth = halfShoulder * 0.8;
    hNeck = 20;
  } else if (neckStyle === "Collar Neck") {
    halfNeckWidth = halfShoulder * 0.5;
    hNeck = 16;
  } else if (neckStyle === "V Neck") {
    halfNeckWidth = halfShoulder * 0.6;
    hNeck = Math.min(90, Math.max(40, neckDepth * 9));
  } else if (neckStyle === "Deep Neck") {
    halfNeckWidth = halfShoulder * 0.7;
    hNeck = Math.min(115, Math.max(55, neckDepth * 11));
  }

  const neckLeft = xCenter - halfNeckWidth;
  const neckRight = xCenter + halfNeckWidth;

  // Neck path
  let neckPath = "";
  if (neckStyle === "V Neck") {
    neckPath = `L ${xCenter} ${yShoulder + hNeck} L ${neckRight} ${yShoulder}`;
  } else {
    neckPath = `Q ${xCenter} ${yShoulder + hNeck} ${neckRight} ${yShoulder}`;
  }

  // Kurti Body Path
  const bodyPath = `
    M ${neckLeft} ${yShoulder}
    ${neckPath}
    L ${shoulderRight} ${yShoulder}
    Q ${armpitRight + 4} ${yShoulder + 25} ${armpitRight} ${yArmpit}
    Q ${waistRight + 2} ${yWaist} ${waistRight} ${yWaist}
    Q ${hipRight + 5} ${yHip} ${hipRight} ${yHip}
    L ${bottomRight} ${yBottom}
    Q ${xCenter} ${yBottom + 8} ${bottomLeft} ${yBottom}
    L ${hipLeft} ${yHip}
    Q ${hipLeft - 5} ${yHip} ${waistLeft} ${yWaist}
    Q ${waistLeft - 2} ${yWaist} ${armpitLeft} ${yArmpit}
    Q ${armpitLeft - 4} ${yShoulder + 25} ${shoulderLeft} ${yShoulder}
    Z
  `;

  // Sleeves
  const sleeveStyle = customization.sleeveStyle || "Short Sleeve";
  let sleeveLeftPath = "";
  let sleeveRightPath = "";

  if (sleeveStyle !== "Sleeveless") {
    let slLen = 60;
    if (sleeveStyle === "Elbow Sleeve") {
      slLen = Math.min(130, Math.max(75, sleeveLength * 9));
    } else if (sleeveStyle === "Puff Sleeve") {
      slLen = 50;
    } else {
      slLen = Math.min(75, Math.max(35, sleeveLength * 7));
    }

    if (sleeveStyle === "Puff Sleeve") {
      sleeveLeftPath = `
        M ${shoulderLeft} ${yShoulder}
        C ${shoulderLeft - 40} ${yShoulder - 15} ${shoulderLeft - 50} ${yShoulder + 25} ${shoulderLeft - 25} ${yShoulder + slLen}
        L ${armpitLeft} ${yArmpit}
        Q ${armpitLeft - 4} ${yShoulder + 25} ${shoulderLeft} ${yShoulder}
        Z
      `;
      sleeveRightPath = `
        M ${shoulderRight} ${yShoulder}
        C ${shoulderRight + 40} ${yShoulder - 15} ${shoulderRight + 50} ${yShoulder + 25} ${shoulderRight + 25} ${yShoulder + slLen}
        L ${armpitRight} ${yArmpit}
        Q ${armpitRight + 4} ${yShoulder + 25} ${shoulderRight} ${yShoulder}
        Z
      `;
    } else {
      sleeveLeftPath = `
        M ${shoulderLeft} ${yShoulder}
        L ${shoulderLeft - slLen * 0.65} ${yShoulder + slLen * 0.65}
        L ${armpitLeft - slLen * 0.15} ${yArmpit + slLen * 0.2}
        L ${armpitLeft} ${yArmpit}
        Q ${armpitLeft - 4} ${yShoulder + 25} ${shoulderLeft} ${yShoulder}
        Z
      `;
      sleeveRightPath = `
        M ${shoulderRight} ${yShoulder}
        L ${shoulderRight + slLen * 0.65} ${yShoulder + slLen * 0.65}
        L ${armpitRight + slLen * 0.15} ${yArmpit + slLen * 0.2}
        L ${armpitRight} ${yArmpit}
        Q ${armpitRight + 4} ${yShoulder + 25} ${shoulderRight} ${yShoulder}
        Z
      `;
    }
  }

  const patternId = `fabricPattern-kurti`;

  return (
    <svg
      viewBox="0 0 400 500"
      className="h-full w-full max-w-[340px] drop-shadow-md transition-all duration-300"
      style={{ overflow: "visible" }}
    >
      <defs>
        <pattern id={patternId} patternUnits="userSpaceOnUse" width="120" height="120">
          <image href={fabricImage} x="0" y="0" width="120" height="120" preserveAspectRatio="xMidYMid slice" />
        </pattern>
        <filter id="sketchShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="1" dy="3" stdDeviation="4" floodColor="#513252" floodOpacity="0.12" />
        </filter>
        <linearGradient id="shadingGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.22" />
          <stop offset="50%" stopColor="#000000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.16" />
        </linearGradient>
      </defs>

      {/* Sketch Mannequin Dummy Background (Requirement 10) */}
      <g stroke="#e2d6db" strokeWidth="1.5" fill="none" strokeDasharray="4,4">
        <path d="M 180 70 Q 200 50 220 70" />
        <path d="M 200 70 L 200 40" />
        <ellipse cx="200" cy="35" rx="16" ry="11" />
        {/* Torso & hips dummy */}
        <path d="M 140 100 C 130 180 120 280 145 370 C 165 430 235 430 255 370 C 280 280 270 180 260 100" />
        <line x1="200" y1="70" x2="200" y2="445" stroke="#dbccd2" strokeWidth="2" />
        {/* Floor Stand */}
        <line x1="200" y1="445" x2="200" y2="480" stroke="#c0a6b2" strokeWidth="3" strokeDasharray="none" />
        <path d="M 160 480 L 240 480 M 180 480 L 200 462 L 220 480" stroke="#c0a6b2" strokeWidth="2.5" strokeDasharray="none" />
      </g>

      {/* Main Kurti Group */}
      <g filter="url(#sketchShadow)">
        {/* Sleeves */}
        {sleeveStyle !== "Sleeveless" && (
          <>
            <path
              d={sleeveLeftPath}
              fill={`url(#${patternId})`}
              stroke="#513252"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path d={sleeveLeftPath} fill="url(#shadingGrad)" stroke="none" />
            <path
              d={sleeveRightPath}
              fill={`url(#${patternId})`}
              stroke="#513252"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path d={sleeveRightPath} fill="url(#shadingGrad)" stroke="none" />
          </>
        )}

        {/* Sleeveless armhole trim */}
        {sleeveStyle === "Sleeveless" && (
          <>
            <path d={`M ${shoulderLeft} ${yShoulder} Q ${armpitLeft - 4} ${yShoulder + 25} ${armpitLeft} ${yArmpit}`} stroke="#513252" strokeWidth="3.5" fill="none" opacity="0.3" />
            <path d={`M ${shoulderRight} ${yShoulder} Q ${armpitRight + 4} ${yShoulder + 25} ${armpitRight} ${yArmpit}`} stroke="#513252" strokeWidth="3.5" fill="none" opacity="0.3" />
          </>
        )}

        {/* Kurti Body */}
        <path
          d={bodyPath}
          fill={`url(#${patternId})`}
          stroke="#513252"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Overlay shading */}
        <path d={bodyPath} fill="url(#shadingGrad)" stroke="none" />

        {/* Extra Options: Embroidery (if enabled) */}
        {customization.extras?.includes("Embroidery") && (
          <path
            d={`M ${neckLeft} ${yShoulder} ${neckPath}`}
            fill="none"
            stroke="#c99a2e"
            strokeWidth="3.5"
            strokeDasharray="2,3"
            opacity="0.85"
          />
        )}

        {/* Collar Neck visual details */}
        {neckStyle === "Collar Neck" && (
          <g stroke="#513252" strokeWidth="2" fill="none">
            <path d={`M ${neckLeft} ${yShoulder} L ${xCenter - 4} ${yShoulder + 18} L ${xCenter} ${yShoulder + 16}`} fill={`url(#${patternId})`} />
            <path d={`M ${neckRight} ${yShoulder} L ${xCenter + 4} ${yShoulder + 18} L ${xCenter} ${yShoulder + 16}`} fill={`url(#${patternId})`} />
          </g>
        )}

        {/* Side Slits Lines (representing a real kurti slit opening) */}
        <path d={`M ${hipLeft} ${yHip} L ${bottomLeft} ${yBottom}`} stroke="#3d213e" strokeWidth="1.2" opacity="0.4" />
        <path d={`M ${hipRight} ${yHip} L ${bottomRight} ${yBottom}`} stroke="#3d213e" strokeWidth="1.2" opacity="0.4" />
      </g>
    </svg>
  );
}
