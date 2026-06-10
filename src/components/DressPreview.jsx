import { CheckCircle2 } from "lucide-react";
import { boutiqueImages } from "../assets/images.js";

function normalizeClass(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\s+/g, "-");
}

export default function DressPreview({ outfit, fabricImage, customization = {}, compact = false }) {
  const outfitId = outfit?.id || "kurti";
  const sleeveClass = normalizeClass(customization.sleeveStyle || "Short Sleeve");
  const neckClass = normalizeClass(customization.neckStyle || "Boat Neck");
  const fitClass = normalizeClass(customization.fittingStyle || "Regular Fit");
  const fabric = fabricImage || boutiqueImages.fabricSilk;
  const extras = customization.extras || [];

  return (
    <div
      className={`dress-stage card overflow-hidden ${compact ? "p-4" : "p-6"}`}
      style={{ "--fabric-image": `url(${fabric})` }}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase text-gold">Outlook Preview</p>
          <h3 className="font-display text-2xl font-bold text-plum">{outfit?.title || "Custom Outfit"}</h3>
        </div>
        <span className="rounded-md bg-white px-3 py-2 text-xs font-bold text-plum shadow-sm">
          CSS Preview
        </span>
      </div>

      <div
        className={`dress-${outfitId} dress-fit-${fitClass} relative mx-auto flex min-h-[310px] max-w-sm flex-col items-center justify-center py-6`}
      >
        <div className="relative">
          <span className={`dress-sleeve sleeve-left sleeve-${sleeveClass}`} />
          <span className={`dress-sleeve sleeve-right sleeve-${sleeveClass}`} />
          <div className="dress-piece dress-bodice">
            <span className={`dress-neck neck-${neckClass}`} />
            {extras.includes("Embroidery") && <span className="dress-trim" />}
          </div>
        </div>
        {outfitId === "lehenga" && <div className="mt-4 h-3 w-32 rounded-full bg-gold/60" />}
        <div className="dress-piece dress-skirt relative">
          {(extras.includes("Tassels") || extras.includes("Embroidery")) && <span className="dress-trim" />}
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {[customization.neckStyle, customization.sleeveStyle, customization.fittingStyle]
          .filter(Boolean)
          .map((item) => (
            <span key={item} className="inline-flex items-center gap-2 rounded-md bg-white/80 px-3 py-2 text-xs font-bold text-plum">
              <CheckCircle2 size={15} className="text-gold" />
              {item}
            </span>
          ))}
      </div>
    </div>
  );
}
