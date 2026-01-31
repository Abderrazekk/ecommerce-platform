// Date formatting utilities

export const formatDate = (date, format = "short") => {
  if (!date) return "";

  const d = new Date(date);

  if (isNaN(d.getTime())) return "";

  const now = new Date();
  const diffMs = now - d;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (format === "relative") {
    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes} min ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  }

  if (format === "time") {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  if (format === "datetime") {
    return d.toLocaleString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (format === "long") {
    return d.toLocaleDateString([], {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  // Default short format
  return d.toLocaleDateString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const getDateRange = (period) => {
  const end = new Date();
  const start = new Date();

  switch (period) {
    case "today":
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case "yesterday":
      start.setDate(start.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      end.setDate(end.getDate() - 1);
      end.setHours(23, 59, 59, 999);
      break;
    case "week":
      start.setDate(start.getDate() - 7);
      break;
    case "month":
      start.setMonth(start.getMonth() - 1);
      break;
    case "quarter":
      start.setMonth(start.getMonth() - 3);
      break;
    case "year":
      start.setFullYear(start.getFullYear() - 1);
      break;
    case "all":
      start.setFullYear(2020, 0, 1); // Start from 2020
      break;
    default:
      start.setMonth(start.getMonth() - 1);
  }

  return { start, end };
};

export const formatPeriod = (period) => {
  const periods = {
    today: "Today",
    yesterday: "Yesterday",
    week: "Last 7 Days",
    month: "Last 30 Days",
    quarter: "Last Quarter",
    year: "Last Year",
    all: "All Time",
  };

  return periods[period] || period;
};

export const getDaysBetween = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const formatTimeAgo = (date) => {
  return formatDate(date, "relative");
};

export const isValidDate = (dateString) => {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

export const formatDateForInput = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return d.toISOString().split("T")[0];
};
