import React from "react";

export default function FrockPreview({ fabricImage, customization = {}, measurements = {}, unit = "Inches" }) {
  // Normalize measurements to Inches
  const isCM = String(unit).toLowerCase() === "cm";
  const scale = isCM ? 1 / 2.54 : 1;

  const rawBust = Number(measurements.bust) || 36;
  const rawWaist = Number(measurements.waist) || 30;
  const rawShoulder = Number(measurements.shoulder) || 14;
  const rawSleeve = Number(measurements.sleeveLength) || 8;
  const rawDressLength = Number(measurements.dressLength) || 45;
  const rawNeckDepth = Number(measurements.neckDepth) || 6;

  const bust = rawBust * scale;
  const waist = rawWaist * scale;
  const shoulder = rawShoulder * scale;
  const sleeveLength = rawSleeve * scale;
  const dressLength = rawDressLength * scale;
  const neckDepth = rawNeckDepth * scale;

  // Fitting allowance
  let allowance = 0;
  if (customization.fittingStyle === "Tight Fit") allowance = 0;
  else if (customization.fittingStyle === "Loose Fit") allowance = 4;
  else allowance = 2; // Regular Fit

  const adjBust = bust + allowance;
  const adjWaist = waist + allowance;

  // Coordinates
  const xCenter = 200;
  const yShoulder = 80;

  // Horizontal scaling
  const shoulderWidth = Math.min(150, Math.max(90, shoulder * 10));
  const halfShoulder = shoulderWidth / 2;

  const bustWidth = Math.min(190, Math.max(120, adjBust * 4.3));
  const halfBust = bustWidth / 2;

  const waistWidth = Math.min(170, Math.max(100, adjWaist * 3.8));
  const halfWaist = waistWidth / 2;

  // Height / Length
  const lengthHeight = Math.min(320, Math.max(200, dressLength * 6.8));
  const yBottom = yShoulder + lengthHeight;
  const yArmpit = yShoulder + 50;
  const yWaist = yShoulder + 115; // fixed bodice height relative to shoulder

  // Flared Skirt Bottom Width
  const skirtBottomWidth = Math.min(330, Math.max(180, adjWaist * 7.8));
  const halfSkirt = skirtBottomWidth / 2;

  // Points
  const shoulderLeft = xCenter - halfShoulder;
  const shoulderRight = xCenter + halfShoulder;
  const armpitLeft = xCenter - halfBust;
  const armpitRight = xCenter + halfBust;
  const waistLeft = xCenter - halfWaist;
  const waistRight = xCenter + halfWaist;
  const bottomLeft = xCenter - halfSkirt;
  const bottomRight = xCenter + halfSkirt;

  // Neck Style Details
  const neckStyle = customization.neckStyle || "Boat Neck";
  let halfNeckWidth = halfShoulder * 0.65;
  let hNeck = Math.min(95, Math.max(35, neckDepth * 8.5));

  if (neckStyle === "Boat Neck") {
    halfNeckWidth = halfShoulder * 0.8;
    hNeck = 18;
  } else if (neckStyle === "Collar Neck") {
    halfNeckWidth = halfShoulder * 0.5;
    hNeck = 14;
  } else if (neckStyle === "V Neck") {
    halfNeckWidth = halfShoulder * 0.6;
    hNeck = Math.min(85, Math.max(38, neckDepth * 8.5));
  } else if (neckStyle === "Deep Neck") {
    halfNeckWidth = halfShoulder * 0.7;
    hNeck = Math.min(110, Math.max(50, neckDepth * 10));
  }

  const neckLeft = xCenter - halfNeckWidth;
  const neckRight = xCenter + halfNeckWidth;

  let neckPath = "";
  if (neckStyle === "V Neck") {
    neckPath = `L ${xCenter} ${yShoulder + hNeck} L ${neckRight} ${yShoulder}`;
  } else {
    neckPath = `Q ${xCenter} ${yShoulder + hNeck} ${neckRight} ${yShoulder}`;
  }

  // Bodice Path
  const bodicePath = `
    M ${neckLeft} ${yShoulder}
    ${neckPath}
    L ${shoulderRight} ${yShoulder}
    Q ${armpitRight + 4} ${yShoulder + 25} ${armpitRight} ${yArmpit}
    L ${waistRight} ${yWaist}
    L ${waistLeft} ${yWaist}
    L ${armpitLeft} ${yArmpit}
    Q ${armpitLeft - 4} ${yShoulder + 25} ${shoulderLeft} ${yShoulder}
    Z
  `;

  // Skirt Path
  const skirtPath = `
    M ${waistLeft} ${yWaist}
    Q ${waistLeft - 2} ${yWaist + 5} ${waistLeft - 4} ${yWaist + 10}
    Q ${bottomLeft - 10} ${yBottom - 25} ${bottomLeft} ${yBottom}
    Q ${xCenter} ${yBottom + 12} ${bottomRight} ${yBottom}
    Q ${bottomRight + 10} ${yBottom - 25} ${waistRight + 4} ${yWaist + 10}
    Q ${waistRight + 2} ${yWaist + 5} ${waistRight} ${yWaist}
    Z
  `;

  // Sleeves
  const sleeveStyle = customization.sleeveStyle || "Short Sleeve";
  let sleeveLeftPath = "";
  let sleeveRightPath = "";

  if (sleeveStyle !== "Sleeveless") {
    let slLen = 55;
    if (sleeveStyle === "Elbow Sleeve") {
      slLen = Math.min(125, Math.max(75, sleeveLength * 8.5));
    } else if (sleeveStyle === "Puff Sleeve") {
      slLen = 45;
    } else {
      slLen = Math.min(70, Math.max(35, sleeveLength * 6.5));
    }

    if (sleeveStyle === "Puff Sleeve") {
      sleeveLeftPath = `
        M ${shoulderLeft} ${yShoulder}
        C ${shoulderLeft - 38} ${yShoulder - 15} ${shoulderLeft - 48} ${yShoulder + 22} ${shoulderLeft - 22} ${yShoulder + slLen}
        L ${armpitLeft} ${yArmpit}
        Q ${armpitLeft - 4} ${yShoulder + 25} ${shoulderLeft} ${yShoulder}
        Z
      `;
      sleeveRightPath = `
        M ${shoulderRight} ${yShoulder}
        C ${shoulderRight + 38} ${yShoulder - 15} ${shoulderRight + 48} ${yShoulder + 22} ${shoulderRight + 22} ${yShoulder + slLen}
        L ${armpitRight} ${yArmpit}
        Q ${armpitRight + 4} ${yShoulder + 25} ${shoulderRight} ${yShoulder}
        Z
      `;
    } else {
      sleeveLeftPath = `
        M ${shoulderLeft} ${yShoulder}
        L ${shoulderLeft - slLen * 0.65} ${yShoulder + slLen * 0.65}
        L ${armpitLeft - slLen * 0.12} ${yArmpit + slLen * 0.18}
        L ${armpitLeft} ${yArmpit}
        Q ${armpitLeft - 4} ${yShoulder + 25} ${shoulderLeft} ${yShoulder}
        Z
      `;
      sleeveRightPath = `
        M ${shoulderRight} ${yShoulder}
        L ${shoulderRight + slLen * 0.65} ${yShoulder + slLen * 0.65}
        L ${armpitRight + slLen * 0.12} ${yArmpit + slLen * 0.18}
        L ${armpitRight} ${yArmpit}
        Q ${armpitRight + 4} ${yShoulder + 25} ${shoulderRight} ${yShoulder}
        Z
      `;
    }
  }

  const patternId = `fabricPattern-frock`;

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
        <path d="M 180 60 Q 200 40 220 60" />
        <path d="M 200 60 L 200 30" />
        <ellipse cx="200" cy="25" rx="15" ry="10" />
        {/* Torso & hips dummy */}
        <path d="M 140 90 C 130 170 120 270 145 360 C 165 425 235 425 255 360 C 280 270 270 170 260 90" />
        <line x1="200" y1="60" x2="200" y2="455" stroke="#dbccd2" strokeWidth="2" />
        {/* Floor Stand */}
        <line x1="200" y1="455" x2="200" y2="480" stroke="#c0a6b2" strokeWidth="3" strokeDasharray="none" />
        <path d="M 160 480 L 240 480 M 180 480 L 200 462 L 220 480" stroke="#c0a6b2" strokeWidth="2.5" strokeDasharray="none" />
      </g>

      {/* Frock Group */}
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

        {/* Sleeveless Armhole Trim */}
        {sleeveStyle === "Sleeveless" && (
          <>
            <path d={`M ${shoulderLeft} ${yShoulder} Q ${armpitLeft - 4} ${yShoulder + 25} ${armpitLeft} ${yArmpit}`} stroke="#513252" strokeWidth="3.5" fill="none" opacity="0.3" />
            <path d={`M ${shoulderRight} ${yShoulder} Q ${armpitRight + 4} ${yShoulder + 25} ${armpitRight} ${yArmpit}`} stroke="#513252" strokeWidth="3.5" fill="none" opacity="0.3" />
          </>
        )}

        {/* Frock Bodice */}
        <path
          d={bodicePath}
          fill={`url(#${patternId})`}
          stroke="#513252"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path d={bodicePath} fill="url(#shadingGrad)" stroke="none" />

        {/* Frock Skirt */}
        <path
          d={skirtPath}
          fill={`url(#${patternId})`}
          stroke="#513252"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path d={skirtPath} fill="url(#shadingGrad)" stroke="none" />

        {/* Waistband Seam Detail */}
        <path
          d={`M ${waistLeft} ${yWaist} Q ${xCenter} ${yWaist + 4} ${waistRight}`}
          stroke="#513252"
          strokeWidth="2.5"
          fill="none"
        />

        {/* Skirt Pleat / Fold Lines for realism (Fashion Sketch style) */}
        <g stroke="#513252" strokeWidth="1.5" fill="none" opacity="0.3">
          <path d={`M ${waistLeft + 25} ${yWaist} C ${waistLeft + 22} ${yWaist + 80} ${bottomLeft + 35} ${yBottom - 30} ${bottomLeft + 45} ${yBottom}`} />
          <path d={`M ${xCenter - 25} ${yWaist} C ${xCenter - 20} ${yWaist + 90} ${xCenter - 30} ${yBottom - 30} ${xCenter - 35} ${yBottom}`} />
          <path d={`M ${xCenter + 25} ${yWaist} C ${xCenter + 20} ${yWaist + 90} ${xCenter + 30} ${yBottom - 30} ${xCenter + 35} ${yBottom}`} />
          <path d={`M ${waistRight - 25} ${yWaist} C ${waistRight - 22} ${yWaist + 80} ${bottomRight - 35} ${yBottom - 30} ${bottomRight - 45} ${yBottom}`} />
        </g>

        {/* Extra Options: Embroidery */}
        {customization.extras?.includes("Embroidery") && (
          <>
            <path
              d={`M ${neckLeft} ${yShoulder} ${neckPath}`}
              fill="none"
              stroke="#c99a2e"
              strokeWidth="3.5"
              strokeDasharray="2,3"
              opacity="0.85"
            />
            {/* Embroidery Border at bottom hem */}
            <path
              d={`M ${bottomLeft + 8} ${yBottom - 10} Q ${xCenter} ${yBottom + 2} ${bottomRight - 8} ${yBottom - 10}`}
              fill="none"
              stroke="#c99a2e"
              strokeWidth="3.5"
              strokeDasharray="2,3"
              opacity="0.85"
            />
          </>
        )}

        {/* Collar Neck visual details */}
        {neckStyle === "Collar Neck" && (
          <g stroke="#513252" strokeWidth="2" fill="none">
            <path d={`M ${neckLeft} ${yShoulder} L ${xCenter - 4} ${yShoulder + 15} L ${xCenter} ${yShoulder + 13}`} fill={`url(#${patternId})`} />
            <path d={`M ${neckRight} ${yShoulder} L ${xCenter + 4} ${yShoulder + 15} L ${xCenter} ${yShoulder + 13}`} fill={`url(#${patternId})`} />
          </g>
        )}

        {/* Extra Options: Tassels (hanging from the waistline) */}
        {customization.extras?.includes("Tassels") && (
          <g stroke="#c99a2e" strokeWidth="1.5" fill="#c99a2e">
            {/* Left Waist Tassel */}
            <line x1={waistLeft + 15} y1={yWaist} x2={waistLeft + 15} y2={yWaist + 25} stroke="#c99a2e" />
            <circle cx={waistLeft + 15} cy={yWaist + 25} r="3.5" />
            <path d={`M ${waistLeft + 12} ${yWaist + 25} L ${waistLeft + 9} ${yWaist + 38} L ${waistLeft + 21} ${yWaist + 38} Z`} />

            {/* Right Waist Tassel */}
            <line x1={waistRight - 15} y1={yWaist} x2={waistRight - 15} y2={yWaist + 25} stroke="#c99a2e" />
            <circle cx={waistRight - 15} cy={yWaist + 25} r="3.5" />
            <path d={`M ${waistRight - 18} ${yWaist + 25} L ${waistRight - 21} ${yWaist + 38} L ${waistRight - 9} ${yWaist + 38} Z`} />
          </g>
        )}
      </g>
    </svg>
  );
}
