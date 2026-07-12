import { db, vehiclesTable, driversTable, tripsTable, maintenanceLogsTable, fuelLogsTable, expensesTable } from "./index";

async function seed() {
  const existing = await db.select().from(vehiclesTable).limit(1);
  if (existing.length > 0) {
    console.log("Already seeded, skipping.");
    return;
  }

  const [v1, v2, v3, v4] = await db
    .insert(vehiclesTable)
    .values([
      {
        registrationNumber: "TX-1042",
        name: "Freightliner Cascadia",
        type: "Semi Truck",
        maxLoadCapacity: "22000",
        odometer: "84200",
        acquisitionCost: "145000",
        region: "Midwest",
        status: "Available",
      },
      {
        registrationNumber: "TX-2071",
        name: "Ford Transit 350",
        type: "Cargo Van",
        maxLoadCapacity: "1500",
        odometer: "32100",
        acquisitionCost: "48000",
        region: "Northeast",
        status: "Available",
      },
      {
        registrationNumber: "TX-3390",
        name: "Kenworth T680",
        type: "Semi Truck",
        maxLoadCapacity: "24000",
        odometer: "121500",
        acquisitionCost: "158000",
        region: "Midwest",
        status: "In Shop",
      },
      {
        registrationNumber: "TX-4488",
        name: "Isuzu NPR",
        type: "Box Truck",
        maxLoadCapacity: "6000",
        odometer: "9800",
        acquisitionCost: "62000",
        region: "West",
        status: "Retired",
      },
    ])
    .returning();

  const [d1, d2, d3] = await db
    .insert(driversTable)
    .values([
      {
        name: "Marcus Webb",
        licenseNumber: "DL-88213",
        licenseCategory: "Class A CDL",
        licenseExpiryDate: "2027-04-15",
        contactNumber: "555-0134",
        safetyScore: "96",
        status: "Available",
      },
      {
        name: "Elena Vasquez",
        licenseNumber: "DL-73410",
        licenseCategory: "Class B CDL",
        licenseExpiryDate: "2026-08-02",
        contactNumber: "555-0198",
        safetyScore: "88",
        status: "Available",
      },
      {
        name: "Sam Okafor",
        licenseNumber: "DL-55921",
        licenseCategory: "Class A CDL",
        licenseExpiryDate: "2026-08-01",
        contactNumber: "555-0221",
        safetyScore: "72",
        status: "Suspended",
      },
    ])
    .returning();

  const [t1] = await db
    .insert(tripsTable)
    .values([
      {
        source: "Chicago, IL",
        destination: "Indianapolis, IN",
        vehicleId: v2.id,
        driverId: d2.id,
        cargoWeight: "900",
        plannedDistance: "180",
      },
    ])
    .returning();

  await db.insert(maintenanceLogsTable).values({
    vehicleId: v3.id,
    description: "Transmission repair and brake inspection",
    cost: "3200",
  });

  await db.insert(fuelLogsTable).values([
    { vehicleId: v1.id, liters: "220", cost: "310", date: "2026-06-15" },
    { vehicleId: v1.id, liters: "205", cost: "298", date: "2026-06-28" },
    { vehicleId: v2.id, liters: "60", cost: "92", date: "2026-06-20" },
  ]);

  await db.insert(expensesTable).values([
    {
      vehicleId: v1.id,
      category: "Toll",
      amount: "45.5",
      date: "2026-06-16",
      description: "I-80 tolls",
    },
    {
      vehicleId: v1.id,
      category: "Insurance",
      amount: "1200",
      date: "2026-06-01",
      description: "Monthly fleet insurance premium",
    },
  ]);

  console.log("Seeded vehicles, drivers, a trip, maintenance, fuel and expense logs.");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
