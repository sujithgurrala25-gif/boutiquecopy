export function downloadTextFile(filename, content) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function buildOrderSummary(order) {
  const measurements = Object.entries(order.measurements || {})
    .map(([key, value]) => `${key}: ${value} ${order.unit}`)
    .join("\n");

  return [
    `StitchAura Boutique Order Summary`,
    `Order ID: ${order.id}`,
    `Customer: ${order.customerName}`,
    `Outfit: ${order.outfit?.title}`,
    `Status: ${order.status}`,
    `Estimated Price: Rs. ${Number(order.price || 0).toLocaleString("en-IN")}`,
    `Order Date: ${new Date(order.createdAt).toLocaleString()}`,
    "",
    "Customization",
    `Neck Style: ${order.customization?.neckStyle}`,
    `Sleeve Style: ${order.customization?.sleeveStyle}`,
    `Fitting: ${order.customization?.fittingStyle}`,
    `Extras: ${(order.customization?.extras || []).join(", ") || "None"}`,
    "",
    "Measurements",
    measurements,
  ].join("\n");
}
