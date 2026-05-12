export const formatBytesAsMb = (bytes) =>
  `${Math.round(Number(bytes || 0) / (1024 * 1024))} MB`;

export const APP_TIME_ZONE = "Asia/Tehran";

export const parseServerDate = (value) => {
  if (!value) return new Date();
  if (typeof value === "string") {
    const normalized = value.includes("T") ? value : value.replace(" ", "T");
    const hasExplicitTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(normalized);
    return hasExplicitTimezone ? new Date(normalized) : new Date(`${normalized}Z`);
  }
  return new Date(value);
};

const datePartFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: APP_TIME_ZONE,
  year: "numeric",
  month: "numeric",
  day: "numeric",
});

const getDatePartsInAppTimeZone = (dateValue) => {
  const date = parseServerDate(dateValue);
  if (!Number.isFinite(date.getTime())) {
    return { year: 0, month: 0, day: 0 };
  }
  const parts = datePartFormatter.formatToParts(date);
  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)]),
  );
  return {
    year: values.year || 0,
    month: values.month || 0,
    day: values.day || 0,
  };
};

const getDayOrdinal = (dateValue) => {
  const { year, month, day } = getDatePartsInAppTimeZone(dateValue);
  if (!year || !month || !day) return NaN;
  return Math.floor(Date.UTC(year, month - 1, day) / (1000 * 60 * 60 * 24));
};

export const formatDayKey = (dateValue) => {
  const { year, month, day } = getDatePartsInAppTimeZone(dateValue);
  return year && month && day ? `${year}-${month}-${day}` : "";
};

export const formatDayLabel = (dateValue) => {
  const now = new Date();
  const date = parseServerDate(dateValue);
  const diffDays = getDayOrdinal(now) - getDayOrdinal(date);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays > 1 && diffDays < 7) {
    return date.toLocaleDateString(undefined, {
      timeZone: APP_TIME_ZONE,
      weekday: "long",
    });
  }
  return date.toLocaleDateString(undefined, {
    timeZone: APP_TIME_ZONE,
    month: "long",
    day: "numeric",
  });
};

export const formatTime = (dateValue) =>
  parseServerDate(dateValue).toLocaleTimeString(undefined, {
    timeZone: APP_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

export const formatFullDate = (dateValue) =>
  parseServerDate(dateValue).toLocaleDateString(undefined, {
    timeZone: APP_TIME_ZONE,
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export const formatChatCardTimestamp = (dateValue) => {
  const date = parseServerDate(dateValue);
  if (!Number.isFinite(date.getTime())) return "";

  const now = new Date();
  const diffDays = getDayOrdinal(now) - getDayOrdinal(date);

  if (diffDays <= 0) {
    return formatTime(date);
  }

  if (diffDays < 7) {
    return date
      .toLocaleDateString("en-US", {
        timeZone: APP_TIME_ZONE,
        weekday: "short",
      })
      .slice(0, 3);
  }

  if (
    getDatePartsInAppTimeZone(date).year === getDatePartsInAppTimeZone(now).year
  ) {
    return date.toLocaleDateString("en-US", {
      timeZone: APP_TIME_ZONE,
      month: "2-digit",
      day: "2-digit",
    });
  }

  return date.toLocaleDateString("en-US", {
    timeZone: APP_TIME_ZONE,
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  });
};
