export const formatPrice = (price) => {
  if (typeof price !== "number") {
    price = parseFloat(price) || 0;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "TND",
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(price);
};
