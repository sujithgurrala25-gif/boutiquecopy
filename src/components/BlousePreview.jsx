import React from "react";

export default function BlousePreview({ fabricImage, customization = {}, measurements = {}, unit = "Inches" }) {
  // Normalize measurements to Inches
  const isCM = String(unit).toLowerCase() === "cm";
  const scale = isCM ? 1 / 2.54 : 1;

  const rawBust = Number(measurements.chestRound || measurements.bust) || 36;
  const rawWaist = Number(measurements.underBust || measurements.waist) || 30;
  const rawShoulder = Number(measurements.shoulder) || 14;
  const rawSleeve = Number(measurements.sleeveLength) || 8;
  const rawBlouseLength = Number(measurements.blouseLength) || 15;
  const rawNeckDepth = Number(measurements.neckDepth) || 6;

  const bust = rawBust * scale;
  const waist = rawWaist * scale;
  const shoulder = rawShoulder * scale;
  const sleeveLength = rawSleeve * scale;
  const blouseLength = rawBlouseLength * scale;
  const neckDepth = rawNeckDepth * scale;

  // Apply fitting allowance
  let allowance = 0;
  if (customization.fittingStyle === "Tight Fit") allowance = 0;
  else if (customization.fittingStyle === "Loose Fit") allowance = 4;
  else allowance = 2; // Regular Fit default

  const adjBust = bust + allowance;
  const adjWaist = waist + allowance;

  // Dimensions & Coordinates
  const xCenter = 200;
  const yShoulder = 140;

  // Horizontal scaling factors to keep SVG proportional and bounded
  const shoulderWidth = Math.min(170, Math.max(110, shoulder * 11));
  const halfShoulder = shoulderWidth / 2;

  const bustWidth = Math.min(210, Math.max(130, adjBust * 4.6));
  const halfBust = bustWidth / 2;

  const waistWidth = Math.min(190, Math.max(110, adjWaist * 4.4));
  const halfWaist = waistWidth / 2;

  // Heights
  const lengthHeight = Math.min(180, Math.max(110, blouseLength * 10));
  const yBottom = yShoulder + lengthHeight;
  const yArmpit = yShoulder + 55;

  // Key coordinate points
  const shoulderLeft = xCenter - halfShoulder;
  const shoulderRight = xCenter + halfShoulder;
  const armpitLeft = xCenter - halfBust;
  const armpitRight = xCenter + halfBust;
  const bottomLeft = xCenter - halfWaist;
  const bottomRight = xCenter + halfWaist;

  // Neck Calculation
  const neckStyle = customization.neckStyle || "Boat Neck";
  let halfNeckWidth = halfShoulder * 0.7;
  let hNeck = Math.min(110, Math.max(40, neckDepth * 10));

  if (neckStyle === "Boat Neck") {
    halfNeckWidth = halfShoulder * 0.85;
    hNeck = 22;
  } else if (neckStyle === "Collar Neck") {
    halfNeckWidth = halfShoulder * 0.55;
    hNeck = 18;
  } else if (neckStyle === "V Neck") {
    halfNeckWidth = halfShoulder * 0.65;
    hNeck = Math.min(100, Math.max(45, neckDepth * 10));
  } else if (neckStyle === "Deep Neck") {
    halfNeckWidth = halfShoulder * 0.75;
    hNeck = Math.min(125, Math.max(65, neckDepth * 12));
  }

  const neckLeft = xCenter - halfNeckWidth;
  const neckRight = xCenter + halfNeckWidth;

  // Generate Neck path
  let neckPath = "";
  if (neckStyle === "V Neck") {
    neckPath = `L ${xCenter} ${yShoulder + hNeck} L ${neckRight} ${yShoulder}`;
  } else {
    // Curved necks (Boat, Deep, Collar)
    neckPath = `Q ${xCenter} ${yShoulder + hNeck} ${neckRight} ${yShoulder}`;
  }

  // Body Main Path (Back/Front Bodice)
  // Starts from Neck Left, goes down the neck, to Neck Right, to Shoulder Right, down Armhole, to Waist Bottom Right, across Waist to Bottom Left, up side to Armpit Left, up Armhole to Shoulder Left, back to Neck Left.
  const bodyPath = `
    M ${neckLeft} ${yShoulder}
    ${neckPath}
    L ${shoulderRight} ${yShoulder}
    Q ${armpitRight + 5} ${yShoulder + 25} ${armpitRight} ${yArmpit}
    L ${bottomRight} ${yBottom}
    Q ${xCenter} ${yBottom + 8} ${bottomLeft} ${yBottom}
    L ${armpitLeft} ${yArmpit}
    Q ${armpitLeft - 5} ${yShoulder + 25} ${shoulderLeft} ${yShoulder}
    Z
  `;

  // Sleeves Calculation
  const sleeveStyle = customization.sleeveStyle || "Short Sleeve";
  let sleeveLeftPath = "";
  let sleeveRightPath = "";

  if (sleeveStyle !== "Sleeveless") {
    let slLen = 50; // default short
    if (sleeveStyle === "Elbow Sleeve") {
      slLen = Math.min(140, Math.max(80, sleeveLength * 10));
    } else if (sleeveStyle === "Puff Sleeve") {
      slLen = 45;
    } else {
      // Short sleeve
      slLen = Math.min(80, Math.max(35, sleeveLength * 7.5));
    }

    if (sleeveStyle === "Puff Sleeve") {
      // Puff sleeve uses curved outward paths
      sleeveLeftPath = `
        M ${shoulderLeft} ${yShoulder}
        C ${shoulderLeft - 45} ${yShoulder - 15} ${shoulderLeft - 55} ${yShoulder + 25} ${shoulderLeft - 30} ${yShoulder + slLen}
        L ${armpitLeft} ${yArmpit}
        Q ${armpitLeft - 5} ${yShoulder + 25} ${shoulderLeft} ${yShoulder}
        Z
      `;
      sleeveRightPath = `
        M ${shoulderRight} ${yShoulder}
        C ${shoulderRight + 45} ${yShoulder - 15} ${shoulderRight + 55} ${yShoulder + 25} ${shoulderRight + 30} ${yShoulder + slLen}
        L ${armpitRight} ${yArmpit}
        Q ${armpitRight + 5} ${yShoulder + 25} ${shoulderRight} ${yShoulder}
        Z
      `;
    } else {
      // Regular sleeve (Short/Elbow)
      sleeveLeftPath = `
        M ${shoulderLeft} ${yShoulder}
        L ${shoulderLeft - slLen * 0.6} ${yShoulder + slLen * 0.6}
        L ${armpitLeft - slLen * 0.1} ${yArmpit + slLen * 0.2}
        L ${armpitLeft} ${yArmpit}
        Q ${armpitLeft - 5} ${yShoulder + 25} ${shoulderLeft} ${yShoulder}
        Z
      `;
      sleeveRightPath = `
        M ${shoulderRight} ${yShoulder}
        L ${shoulderRight + slLen * 0.6} ${yShoulder + slLen * 0.6}
        L ${armpitRight + slLen * 0.1} ${yArmpit + slLen * 0.2}
        L ${armpitRight} ${yArmpit}
        Q ${armpitRight + 5} ${yShoulder + 25} ${shoulderRight} ${yShoulder}
        Z
      `;
    }
  }

  // Unique pattern ID
  const patternId = `fabricPattern-blouse`;

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
        {/* Soft drop shadow for sketch effect */}
        <filter id="sketchShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="1" dy="3" stdDeviation="4" floodColor="#513252" floodOpacity="0.12" />
        </filter>
        <linearGradient id="shadingGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
          <stop offset="50%" stopColor="#000000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.15" />
        </linearGradient>
      </defs>

      {/* Sketch Mannequin Dummy Background (Requirement 10) */}
      <g stroke="#e2d6db" strokeWidth="1.5" fill="none" strokeDasharray="4,4">
        {/* Neck / head rest */}
        <path d="M 180 100 Q 200 80 220 100" />
        <path d="M 200 100 L 200 70" />
        <ellipse cx="200" cy="65" rx="18" ry="12" />
        {/* Torso & hips dummy */}
        <path d="M 140 140 C 130 200 120 280 150 360 C 170 410 230 410 250 360 C 280 280 270 200 260 140" />
        <line x1="200" y1="100" x2="200" y2="430" stroke="#dbccd2" strokeWidth="2" />
        <path d="M 150 360 Q 200 375 250 360" />
        {/* Floor Stand */}
        <line x1="200" y1="430" x2="200" y2="475" stroke="#c0a6b2" strokeWidth="3.5" strokeDasharray="none" />
        <path d="M 160 475 L 240 475 M 180 475 L 200 455 L 220 475" stroke="#c0a6b2" strokeWidth="3" strokeDasharray="none" />
      </g>

      {/* Main Blouse Group */}
      <g filter="url(#sketchShadow)">
        {/* Sleeves (drawn behind body) */}
        {sleeveStyle !== "Sleeveless" && (
          <>
            <path
              d={sleeveLeftPath}
              fill={`url(#${patternId})`}
              stroke="#513252"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path
              d={sleeveLeftPath}
              fill="url(#shadingGrad)"
              stroke="none"
            />
            <path
              d={sleeveRightPath}
              fill={`url(#${patternId})`}
              stroke="#513252"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path
              d={sleeveRightPath}
              fill="url(#shadingGrad)"
              stroke="none"
            />
            {/* Draw a subtle fold line at sleeve hem */}
            {sleeveStyle === "Puff Sleeve" && (
              <>
                <path d={`M ${shoulderLeft - 30} ${yShoulder + slLen} Q ${shoulderLeft - 15} ${yShoulder + slLen + 4} ${armpitLeft} ${yArmpit}`} stroke="#513252" strokeWidth="1.5" fill="none" opacity="0.4" />
                <path d={`M ${shoulderRight + 30} ${yShoulder + slLen} Q ${shoulderRight + 15} ${yShoulder + slLen + 4} ${armpitRight} ${yArmpit}`} stroke="#513252" strokeWidth="1.5" fill="none" opacity="0.4" />
              </>
            )}
          </>
        )}

        {/* Sleeveless armhole finishing trim */}
        {sleeveStyle === "Sleeveless" && (
          <>
            <path d={`M ${shoulderLeft} ${yShoulder} Q ${armpitLeft - 5} ${yShoulder + 25} ${armpitLeft} ${yArmpit}`} stroke="#513252" strokeWidth="3.5" fill="none" opacity="0.3" />
            <path d={`M ${shoulderRight} ${yShoulder} Q ${armpitRight + 5} ${yShoulder + 25} ${armpitRight} ${yArmpit}`} stroke="#513252" strokeWidth="3.5" fill="none" opacity="0.3" />
          </>
        )}

        {/* Blouse Body */}
        <path
          d={bodyPath}
          fill={`url(#${patternId})`}
          stroke="#513252"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Shading Overlay */}
        <path
          d={bodyPath}
          fill="url(#shadingGrad)"
          stroke="none"
        />

        {/* Extras: Embroidery Accent (if enabled) */}
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
            {/* Left collar lapel */}
            <path d={`M ${neckLeft} ${yShoulder} L ${xCenter - 5} ${yShoulder + 20} L ${xCenter} ${yShoulder + 18}`} fill={`url(#${patternId})`} />
            {/* Right collar lapel */}
            <path d={`M ${neckRight} ${yShoulder} L ${xCenter + 5} ${yShoulder + 20} L ${xCenter} ${yShoulder + 18}`} fill={`url(#${patternId})`} />
          </g>
        )}

        {/* Hemline details (Darts for sewing) */}
        <path d={`M ${bottomLeft + 25} ${yBottom} L ${bottomLeft + 30} ${yBottom - 35}`} stroke="#513252" strokeWidth="1.5" strokeDasharray="3,3" opacity="0.5" />
        <path d={`M ${bottomRight - 25} ${yBottom} L ${bottomRight - 30} ${yBottom - 35}`} stroke="#513252" strokeWidth="1.5" strokeDasharray="3,3" opacity="0.5" />
      </g>
    </svg>
  );
}
