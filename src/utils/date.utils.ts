import moment, { type MomentInput } from "moment-timezone";
import { getTimeZone } from "./helper";

type DateReturnType = "ago" | "datetime" | "date" | "time";

export const formatDateTime = (
  value?: MomentInput,
  type: DateReturnType = "datetime",
): any => {
  if (!value) return "N/A";

  const timeZone = getTimeZone();
  const m = moment.tz(value, timeZone);

  if (!m.isValid()) return "Invalid Date";

  switch (type) {
    case "ago":
      return m.fromNow();

    case "date":
      return m.format("MMMM D, YYYY");

    case "time":
      return m.format("hh:mm:ss A");

    case "datetime":
    default:
      return m.format("MMMM D, YYYY hh:mm:ss A");
  }
};
