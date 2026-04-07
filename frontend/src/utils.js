export function formatPerformance(value, unit) {
  if (value == null) return "";
  
  if (unit === "seconds") {
    if (value >= 60) {
      const minutes = Math.floor(value / 60);
      const seconds = (value % 60).toFixed(2);
      // Ensures that seconds like 5.2 are padded to "05.20"
      return `${minutes}:${seconds.padStart(5, "0")}`;
    }
    return value.toFixed(2);
  }
  
  // For meters or other units
  return value.toString();
}

export function parsePerformance(inputValue, unit) {
  if (!inputValue) return 0;
  
  if (unit === "seconds" && inputValue.includes(":")) {
    const parts = inputValue.split(":");
    let minutes = 0;
    let seconds = 0;
    
    if (parts.length === 2) {
      minutes = parseInt(parts[0], 10);
      seconds = parseFloat(parts[1]);
    } else if (parts.length === 3) {
      // Handles hh:mm:ss.ss if someone runs a marathon
      const hours = parseInt(parts[0], 10);
      minutes = parseInt(parts[1], 10);
      seconds = parseFloat(parts[2]);
      minutes += hours * 60;
    }
    
    if (isNaN(minutes) || isNaN(seconds)) {
      throw new Error("Invalid time format");
    }
    return (minutes * 60) + seconds;
  }
  
  const parsed = parseFloat(inputValue);
  if (isNaN(parsed)) throw new Error("Invalid number");
  return parsed;
}
