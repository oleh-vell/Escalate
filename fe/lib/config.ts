// Human-in-the-loop identity, read from the environment so a fork only changes
// NEXT_PUBLIC_ESCALATE_HUMAN (see .env.example). Nothing here is hardcoded to "Oleh".
const RAW_HUMAN = process.env.NEXT_PUBLIC_ESCALATE_HUMAN?.trim();

/** The human in the loop, lowercase (env NEXT_PUBLIC_ESCALATE_HUMAN, default "oleh"). */
export const ESCALATE_HUMAN: string = RAW_HUMAN && RAW_HUMAN.length > 0 ? RAW_HUMAN : "oleh";

/** The human's name capitalized for display, e.g. "Oleh". */
export const ESCALATE_HUMAN_NAME: string =
  ESCALATE_HUMAN.charAt(0).toUpperCase() + ESCALATE_HUMAN.slice(1);
