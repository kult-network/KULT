/**
 * Formats a timestamp into a relative "time ago" string.
 * @param {string|number|Date} date - The date to format
 * @returns {string} e.g. "2 mins ago"
 */
export const timeAgo = (date) => {
  if (!date) return '';
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " mins ago";
  
  if (Math.floor(seconds) < 30) return "Just now";
  return Math.floor(seconds) + " secs ago";
};

/**
 * Parses raw Activity/Notification logs to remove "undefined" and standardize format.
 * @param {string} rawString - The raw string from the database (e.g. "REGISTRATION: TANVI -> undefined")
 */
export const parseActivityStr = (rawString) => {
  if (!rawString) return { action: "Unknown Activity", subject: "" };
  
  const cleanStr = rawString.replace('-> undefined', '').trim();
  
  if (cleanStr.includes('REGISTRATION')) {
    const name = cleanStr.split(':')[1]?.trim() || 'A new user';
    return { action: "Account Initialization", subject: name, type: "auth" };
  }
  
  if (cleanStr.includes('MISSION LIVE')) {
    const mission = cleanStr.split(':')[1]?.trim() || 'Operation';
    return { action: "Mission Deployed", subject: mission, type: "mission" };
  }

  return { action: "Network Activity", subject: cleanStr, type: "general" };
};
