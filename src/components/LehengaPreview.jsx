import React from "react";

export default function LehengaPreview({ fabricImage, customization = {}, measurements = {}, unit = "Inches" }) {
  // Normalize measurements to Inches
  const isCM = String(unit).toLowerCase() === "cm";
  const scale = isCM ? 1 / 2.54 : 1;

  const rawBust = Number(measurements.bust) || 36;
  const rawWaist = Number(measurements.waist) || 30;
  const rawHip = Number(measurements.hip) || 38;
  const rawShoulder = Number(measurements.shoulder) || 14;
  const rawSleeve = Number(measurements.sleeveLength) || 8;
  const rawDressLength = Number(measurements.dressLength) || 45;
  const rawNeckDepth = Number(measurements.neckDepth) || 6;

  const bust = rawBust * scale;
  const waist = rawWaist * scale;
  const hip = rawHip * scale;
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
  const adjHip = hip + allowance;

  // Coordinates
  const xCenter = 200;
  const yShoulder = 70;

  // 1. Choli Blouse horizontal sizing
  const shoulderWidth = Math.min(150, Math.max(90, shoulder * 10));
  const halfShoulder = shoulderWidth / 2;

  const bustWidth = Math.min(190, Math.max(120, adjBust * 4.3));
  const halfBust = bustWidth / 2;

  const choliWaistWidth = Math.min(160, Math.max(98, adjWaist * 3.6));
  const halfCholiWaist = choliWaistWidth / 2;

  // Heights
  const yArmpit = yShoulder + 48;
  const yCholiBottom = yShoulder + 95; // Short Blouse/Choli height

  // 2. Skirt (Lehenga) Waist & Hem
  const ySkirtWaist = yCholiBottom + 30; // 30px gap for midriff
  const skirtLength = Math.min(300, Math.max(180, dressLength * 6.3));
  const ySkirtBottom = ySkirtWaist + skirtLength;

  const skirtWaistWidth = Math.min(170, Math.max(105, adjWaist * 3.8));
  const halfSkirtWaist = skirtWaistWidth / 2;

  const skirtBottomWidth = Math.min(330, Math.max(190, adjHip * 7.5));
  const halfSkirtBottom = skirtBottomWidth / 2;

  // Points - Choli
  const shoulderLeft = xCenter - halfShoulder;
  const shoulderRight = xCenter + halfShoulder;
  const armpitLeft = xCenter - halfBust;
  const armpitRight = xCenter + halfBust;
  const choliLeft = xCenter - halfCholiWaist;
  const choliRight = xCenter + halfCholiWaist;

  // Points - Skirt
  const skirtWaistLeft = xCenter - halfSkirtWaist;
  const skirtWaistRight = xCenter + halfSkirtWaist;
  const skirtBottomLeft = xCenter - halfSkirtBottom;
  const skirtBottomRight = xCenter + halfSkirtBottom;

  // Neck Configuration
  const neckStyle = customization.neckStyle || "Boat Neck";
  let halfNeckWidth = halfShoulder * 0.65;
  let hNeck = Math.min(90, Math.max(35, neckDepth * 8));

  if (neckStyle === "Boat Neck") {
    halfNeckWidth = halfShoulder * 0.8;
    hNeck = 16;
  } else if (neckStyle === "Collar Neck") {
    halfNeckWidth = halfShoulder * 0.55;
    hNeck = 13;
  } else if (neckStyle === "V Neck") {
    halfNeckWidth = halfShoulder * 0.6;
    hNeck = Math.min(80, Math.max(35, neckDepth * 8));
  } else if (neckStyle === "Deep Neck") {
    halfNeckWidth = halfShoulder * 0.72;
    hNeck = Math.min(105, Math.max(48, neckDepth * 9.5));
  }

  const neckLeft = xCenter - halfNeckWidth;
  const neckRight = xCenter + halfNeckWidth;

  let neckPath = "";
  if (neckStyle === "V Neck") {
    neckPath = `L ${xCenter} ${yShoulder + hNeck} L ${neckRight} ${yShoulder}`;
  } else {
    neckPath = `Q ${xCenter} ${yShoulder + hNeck} ${neckRight} ${yShoulder}`;
  }

  // Choli Blouse Body Path
  const choliPath = `
    M ${neckLeft} ${yShoulder}
    ${neckPath}
    L ${shoulderRight} ${yShoulder}
    Q ${armpitRight + 4} ${yShoulder + 22} ${armpitRight} ${yArmpit}
    L ${choliRight} ${yCholiBottom}
    Q ${xCenter} ${yCholiBottom + 6} ${choliLeft} ${yCholiBottom}
    L ${armpitLeft} ${yArmpit}
    Q ${armpitLeft - 4} ${yShoulder + 22} ${shoulderLeft} ${yShoulder}
    Z
  `;

  // Lehenga Skirt Path
  const lehengaSkirtPath = `
    M ${skirtWaistLeft} ${ySkirtWaist}
    Q ${xCenter} ${ySkirtWaist + 5} ${skirtWaistRight} ${ySkirtWaist}
    Q ${skirtWaistRight + 12} ${ySkirtWaist + 15} ${skirtWaistRight + 15} ${ySkirtWaist + 25}
    Q ${skirtBottomRight + 15} ${ySkirtBottom - 30} ${skirtBottomRight} ${ySkirtBottom}
    Q ${xCenter} ${ySkirtBottom + 12} ${skirtBottomLeft} ${ySkirtBottom}
    Q ${skirtBottomLeft - 15} ${ySkirtBottom - 30} ${skirtWaistLeft - 15} ${ySkirtWaist + 25}
    Q ${skirtWaistLeft - 12} ${ySkirtWaist + 15} ${skirtWaistLeft} ${ySkirtWaist}
    Z
  `;

  // Sleeves
  const sleeveStyle = customization.sleeveStyle || "Short Sleeve";
  let sleeveLeftPath = "";
  let sleeveRightPath = "";

  if (sleeveStyle !== "Sleeveless") {
    let slLen = 50;
    if (sleeveStyle === "Elbow Sleeve") {
      slLen = Math.min(115, Math.max(70, sleeveLength * 8));
    } else if (sleeveStyle === "Puff Sleeve") {
      slLen = 42;
    } else {
      slLen = Math.min(65, Math.max(30, sleeveLength * 6));
    }

    if (sleeveStyle === "Puff Sleeve") {
      sleeveLeftPath = `
        M ${shoulderLeft} ${yShoulder}
        C ${shoulderLeft - 35} ${yShoulder - 15} ${shoulderLeft - 45} ${yShoulder + 20} ${shoulderLeft - 20} ${yShoulder + slLen}
        L ${armpitLeft} ${yArmpit}
        Q ${armpitLeft - 4} ${yShoulder + 22} ${shoulderLeft} ${yShoulder}
        Z
      `;
      sleeveRightPath = `
        M ${shoulderRight} ${yShoulder}
        C ${shoulderRight + 35} ${yShoulder - 15} ${shoulderRight + 45} ${yShoulder + 20} ${shoulderRight + 20} ${yShoulder + slLen}
        L ${armpitRight} ${yArmpit}
        Q ${armpitRight + 4} ${yShoulder + 22} ${shoulderRight} ${yShoulder}
        Z
      `;
    } else {
      sleeveLeftPath = `
        M ${shoulderLeft} ${yShoulder}
        L ${shoulderLeft - slLen * 0.65} ${yShoulder + slLen * 0.65}
        L ${armpitLeft - slLen * 0.12} ${yArmpit + slLen * 0.18}
        L ${armpitLeft} ${yArmpit}
        Q ${armpitLeft - 4} ${yShoulder + 22} ${shoulderLeft} ${yShoulder}
        Z
      `;
      sleeveRightPath = `
        M ${shoulderRight} ${yShoulder}
        L ${shoulderRight + slLen * 0.65} ${yShoulder + slLen * 0.65}
        L ${armpitRight + slLen * 0.12} ${yArmpit + slLen * 0.18}
        L ${armpitRight} ${yArmpit}
        Q ${armpitRight + 4} ${yShoulder + 22} ${shoulderRight} ${yShoulder}
        Z
      `;
    }
  }

  const patternId = `fabricPattern-lehenga`;

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
        <path d="M 180 50 Q 200 30 220 50" />
        <path d="M 200 50 L 200 20" />
        <ellipse cx="200" cy="15" rx="14" ry="9" />
        {/* Torso & hips dummy */}
        <path d="M 140 80 C 130 160 120 260 145 350 C 165 415 235 415 255 350 C 280 260 270 160 260 80" />
        <line x1="200" y1="50" x2="200" y2="455" stroke="#dbccd2" strokeWidth="2" />
        {/* Floor Stand */}
        <line x1="200" y1="455" x2="200" y2="480" stroke="#c0a6b2" strokeWidth="3" strokeDasharray="none" />
        <path d="M 160 480 L 240 480 M 180 480 L 200 462 L 220 480" stroke="#c0a6b2" strokeWidth="2.5" strokeDasharray="none" />
      </g>

      {/* Lehenga Choli Group */}
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
            <path d={`M ${shoulderLeft} ${yShoulder} Q ${armpitLeft - 4} ${yShoulder + 22} ${armpitLeft} ${yArmpit}`} stroke="#513252" strokeWidth="3.5" fill="none" opacity="0.3" />
            <path d={`M ${shoulderRight} ${yShoulder} Q ${armpitRight + 4} ${yShoulder + 22} ${armpitRight} ${yArmpit}`} stroke="#513252" strokeWidth="3.5" fill="none" opacity="0.3" />
          </>
        )}

        {/* Choli Blouse */}
        <path
          d={choliPath}
          fill={`url(#${patternId})`}
          stroke="#513252"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path d={choliPath} fill="url(#shadingGrad)" stroke="none" />

        {/* Lehenga Skirt */}
        <path
          d={lehengaSkirtPath}
          fill={`url(#${patternId})`}
          stroke="#513252"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path d={lehengaSkirtPath} fill="url(#shadingGrad)" stroke="none" />

        {/* Skirt Waistband detail */}
        <path
          d={`M ${skirtWaistLeft} ${ySkirtWaist} Q ${xCenter} ${ySkirtWaist + 5} ${skirtWaistRight}`}
          stroke="#513252"
          strokeWidth="2.5"
          fill="none"
        />

        {/* Skirt Panels / Kali vertical lines (Fashion sketch style) */}
        <g stroke="#513252" strokeWidth="1.2" fill="none" opacity="0.3">
          {/* Panel 1 */}
          <path d={`M ${skirtWaistLeft + 25} ${ySkirtWaist + 5} Q ${xCenter - 45} ${ySkirtWaist + 100} ${skirtBottomLeft + 45} ${ySkirtBottom}`} />
          {/* Panel 2 */}
          <path d={`M ${skirtWaistLeft + 55} ${ySkirtWaist + 5} Q ${xCenter - 15} ${ySkirtWaist + 100} ${skirtBottomLeft + 95} ${ySkirtBottom}`} />
          {/* Center line */}
          <path d={`M ${xCenter} ${ySkirtWaist + 5} Q ${xCenter} ${ySkirtWaist + 100} ${xCenter} ${ySkirtBottom}`} />
          {/* Panel 3 */}
          <path d={`M ${skirtWaistRight - 55} ${ySkirtWaist + 5} Q ${xCenter + 15} ${ySkirtWaist + 100} ${skirtBottomRight - 95} ${ySkirtBottom}`} />
          {/* Panel 4 */}
          <path d={`M ${skirtWaistRight - 25} ${ySkirtWaist + 5} Q ${xCenter + 45} ${ySkirtWaist + 100} ${skirtBottomRight - 45} ${ySkirtBottom}`} />
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
            {/* Rich bottom border embroidery */}
            <path
              d={`M ${skirtBottomLeft + 12} ${ySkirtBottom - 12} Q ${xCenter} ${ySkirtBottom + 2} ${skirtBottomRight - 12} ${ySkirtBottom - 12}`}
              fill="none"
              stroke="#c99a2e"
              strokeWidth="4"
              strokeDasharray="2,3"
              opacity="0.85"
            />
          </>
        )}

        {/* Collar Neck visual details */}
        {neckStyle === "Collar Neck" && (
          <g stroke="#513252" strokeWidth="2" fill="none">
            <path d={`M ${neckLeft} ${yShoulder} L ${xCenter - 4} ${yShoulder + 12} L ${xCenter} ${yShoulder + 10}`} fill={`url(#${patternId})`} />
            <path d={`M ${neckRight} ${yShoulder} L ${xCenter + 4} ${yShoulder + 12} L ${xCenter} ${yShoulder + 10}`} fill={`url(#${patternId})`} />
          </g>
        )}

        {/* Traditional Lehenga Latkan/Tassel hanging from the left waistband */}
        {customization.extras?.includes("Tassels") && (
          <g stroke="#c99a2e" strokeWidth="1.5" fill="#c99a2e">
            {/* Draw a string hanging from the left side of skirt waist */}
            <path d={`M ${skirtWaistLeft + 10} ${ySkirtWaist + 3} Q ${skirtWaistLeft - 20} ${ySkirtWaist + 35} ${skirtWaistLeft - 18} ${ySkirtWaist + 65}`} stroke="#c99a2e" fill="none" />
            <circle cx={skirtWaistLeft - 18} cy={ySkirtWaist + 65} r="4" />
            <path d={`M ${skirtWaistLeft - 22} ${ySkirtWaist + 65} L ${skirtWaistLeft - 27} ${ySkirtWaist + 82} L ${skirtWaistLeft - 13} ${ySkirtWaist + 82} Z`} />

            <path d={`M ${skirtWaistLeft + 10} ${ySkirtWaist + 3} Q ${skirtWaistLeft - 10} ${ySkirtWaist + 45} ${skirtWaistLeft - 5} ${ySkirtWaist + 80}`} stroke="#c99a2e" fill="none" />
            <circle cx={skirtWaistLeft - 5} cy={ySkirtWaist + 80} r="4" />
            <path d={`M ${skirtWaistLeft - 9} ${ySkirtWaist + 80} L ${skirtWaistLeft - 14} ${ySkirtWaist + 97} L ${skirtWaistLeft} ${ySkirtWaist + 97} Z`} />
          </g>
        )}
      </g>
    </svg>
  );
}
