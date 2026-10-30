export const APPLIANCES = [
  "Air Conditioner (AC)",
  "Washing Machine",
  "Fridge",
  "Vacuum Cleaner",
  "Gas Geyser",
  "Kitchen Chimney",
] as const;

export const TRAININGS = [
  {
    value: "HOME_APPLIANCE",
    label: "Home Appliance Repair & Maintenance",
    detail: "2 months · Banepa · Free",
  },
] as const;

export const DEFAULT_TRAINING = TRAININGS[0].value;
