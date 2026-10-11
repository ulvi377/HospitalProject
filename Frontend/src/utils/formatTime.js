
const formatTime = (time) => {
  if (!time) {
    return "";
  }

  const [hours, minutes] = String(time).split(":");

  if (hours === undefined || minutes === undefined) {
    return "";
  }

  const date = new Date();

  date.setHours(
    Number(hours),
    Number(minutes),
    0,
    0,
  );

  return new Intl.DateTimeFormat("az-AZ", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
};

export default formatTime;
