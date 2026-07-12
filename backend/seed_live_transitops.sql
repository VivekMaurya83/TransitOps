
BEGIN;

WITH company_ctx AS (
  SELECT id AS company_id FROM companies ORDER BY created_at ASC LIMIT 1
), admin_ctx AS (
  SELECT id AS user_id, company_id FROM users WHERE email = 'admin@transitops.com' LIMIT 1
), base_ctx AS (
  SELECT c.company_id, a.user_id AS admin_id
  FROM company_ctx c CROSS JOIN admin_ctx a
)
INSERT INTO regions (id, company_id, name, city, state, is_active, created_at)
SELECT gen_random_uuid(), company_id, 'Mumbai Central', 'Mumbai', 'Maharashtra', TRUE, NOW()
FROM base_ctx
WHERE NOT EXISTS (SELECT 1 FROM regions r JOIN base_ctx b ON r.company_id=b.company_id AND r.name='Mumbai Central');

WITH company_ctx AS (
  SELECT id AS company_id FROM companies ORDER BY created_at ASC LIMIT 1
)
INSERT INTO regions (id, company_id, name, city, state, is_active, created_at)
SELECT gen_random_uuid(), company_id, 'Pune Hub', 'Pune', 'Maharashtra', TRUE, NOW()
FROM company_ctx
WHERE NOT EXISTS (SELECT 1 FROM regions r WHERE r.company_id = company_ctx.company_id AND r.name='Pune Hub');

WITH company_ctx AS (
  SELECT id AS company_id FROM companies ORDER BY created_at ASC LIMIT 1
)
INSERT INTO vehicle_types (id, company_id, name, description, is_active, created_at)
SELECT gen_random_uuid(), company_id, 'Mini Truck', 'Light cargo truck up to 2 tons', TRUE, NOW()
FROM company_ctx
WHERE NOT EXISTS (SELECT 1 FROM vehicle_types vt WHERE vt.company_id = company_ctx.company_id AND vt.name='Mini Truck');

WITH company_ctx AS (
  SELECT id AS company_id FROM companies ORDER BY created_at ASC LIMIT 1
)
INSERT INTO vehicle_types (id, company_id, name, description, is_active, created_at)
SELECT gen_random_uuid(), company_id, 'Medium Truck', 'Mid-range distribution truck', TRUE, NOW()
FROM company_ctx
WHERE NOT EXISTS (SELECT 1 FROM vehicle_types vt WHERE vt.company_id = company_ctx.company_id AND vt.name='Medium Truck');

WITH ctx AS (
  SELECT c.id AS company_id,
         u.id AS admin_id,
         (SELECT id FROM regions r WHERE r.company_id = c.id AND r.name = 'Mumbai Central' LIMIT 1) AS region_id,
         (SELECT id FROM vehicle_types vt WHERE vt.company_id = c.id AND vt.name = 'Mini Truck' LIMIT 1) AS vt_id
  FROM companies c
  JOIN users u ON u.company_id = c.id
  WHERE u.email = 'admin@transitops.com'
  LIMIT 1
)
INSERT INTO vehicles (id, company_id, vehicle_type_id, region_id, registration_number, name, manufacturer, model, manufacturing_year, max_load_capacity, odometer, acquisition_cost, status, is_active, created_by, created_at)
SELECT gen_random_uuid(), company_id, vt_id, region_id, 'MH12AB1234', 'Truck 01', 'Tata', 'Ace', 2022, 2000, 15000, 850000, 'available', TRUE, admin_id, NOW()
FROM ctx
WHERE NOT EXISTS (SELECT 1 FROM vehicles v WHERE v.company_id = ctx.company_id AND v.registration_number='MH12AB1234');

WITH ctx AS (
  SELECT c.id AS company_id,
         u.id AS admin_id,
         (SELECT id FROM regions r WHERE r.company_id = c.id AND r.name = 'Mumbai Central' LIMIT 1) AS region_id,
         (SELECT id FROM vehicle_types vt WHERE vt.company_id = c.id AND vt.name = 'Medium Truck' LIMIT 1) AS vt_id
  FROM companies c
  JOIN users u ON u.company_id = c.id
  WHERE u.email = 'admin@transitops.com'
  LIMIT 1
)
INSERT INTO vehicles (id, company_id, vehicle_type_id, region_id, registration_number, name, manufacturer, model, manufacturing_year, max_load_capacity, odometer, acquisition_cost, status, is_active, created_by, created_at)
SELECT gen_random_uuid(), company_id, vt_id, region_id, 'MH12CD5678', 'Truck 02', 'Ashok Leyland', 'Dost', 2021, 3500, 42000, 1200000, 'in_shop', TRUE, admin_id, NOW()
FROM ctx
WHERE NOT EXISTS (SELECT 1 FROM vehicles v WHERE v.company_id = ctx.company_id AND v.registration_number='MH12CD5678');

WITH ctx AS (
  SELECT c.id AS company_id,
         u.id AS admin_id,
         (SELECT id FROM regions r WHERE r.company_id = c.id AND r.name = 'Pune Hub' LIMIT 1) AS region_id,
         (SELECT id FROM vehicle_types vt WHERE vt.company_id = c.id AND vt.name = 'Mini Truck' LIMIT 1) AS vt_id
  FROM companies c
  JOIN users u ON u.company_id = c.id
  WHERE u.email = 'admin@transitops.com'
  LIMIT 1
)
INSERT INTO vehicles (id, company_id, vehicle_type_id, region_id, registration_number, name, manufacturer, model, manufacturing_year, max_load_capacity, odometer, acquisition_cost, status, is_active, created_by, created_at)
SELECT gen_random_uuid(), company_id, vt_id, region_id, 'MH14EF9012', 'Truck 03', 'Mahindra', 'Jeeto', 2023, 1500, 8000, 650000, 'on_trip', TRUE, admin_id, NOW()
FROM ctx
WHERE NOT EXISTS (SELECT 1 FROM vehicles v WHERE v.company_id = ctx.company_id AND v.registration_number='MH14EF9012');

WITH ctx AS (
  SELECT c.id AS company_id,
         u.id AS admin_id,
         (SELECT id FROM regions r WHERE r.company_id = c.id AND r.name = 'Mumbai Central' LIMIT 1) AS region_id
  FROM companies c
  JOIN users u ON u.company_id = c.id
  WHERE u.email = 'admin@transitops.com'
  LIMIT 1
)
INSERT INTO drivers (id, company_id, region_id, user_id, full_name, employee_code, license_number, license_category, license_expiry_date, contact_number, emergency_contact_number, safety_score, status, is_active, created_at)
SELECT gen_random_uuid(), company_id, region_id, NULL, 'Ramesh Kumar', 'EMP-001', 'MH1420220001234', 'HMV', '2027-06-30', '9876543210', '9876540000', 96.5, 'available', TRUE, NOW()
FROM ctx
WHERE NOT EXISTS (SELECT 1 FROM drivers d WHERE d.company_id = ctx.company_id AND d.license_number='MH1420220001234');

WITH ctx AS (
  SELECT c.id AS company_id,
         u.id AS admin_id,
         (SELECT id FROM regions r WHERE r.company_id = c.id AND r.name = 'Pune Hub' LIMIT 1) AS region_id
  FROM companies c
  JOIN users u ON u.company_id = c.id
  WHERE u.email = 'admin@transitops.com'
  LIMIT 1
)
INSERT INTO drivers (id, company_id, region_id, user_id, full_name, employee_code, license_number, license_category, license_expiry_date, contact_number, emergency_contact_number, safety_score, status, is_active, created_at)
SELECT gen_random_uuid(), company_id, region_id, NULL, 'Suresh Patil', 'EMP-002', 'MH1420220005678', 'HMV', '2027-12-31', '9876500000', '9876501111', 92.0, 'on_trip', TRUE, NOW()
FROM ctx
WHERE NOT EXISTS (SELECT 1 FROM drivers d WHERE d.company_id = ctx.company_id AND d.license_number='MH1420220005678');

WITH ctx AS (
  SELECT c.id AS company_id,
         u.id AS admin_id,
         (SELECT id FROM regions r WHERE r.company_id = c.id AND r.name = 'Mumbai Central' LIMIT 1) AS region_id
  FROM companies c
  JOIN users u ON u.company_id = c.id
  WHERE u.email = 'admin@transitops.com'
  LIMIT 1
)
INSERT INTO drivers (id, company_id, region_id, user_id, full_name, employee_code, license_number, license_category, license_expiry_date, contact_number, emergency_contact_number, safety_score, status, suspension_reason, is_active, created_at)
SELECT gen_random_uuid(), company_id, region_id, NULL, 'Mahesh More', 'EMP-003', 'MH1420220009999', 'LMV', '2026-12-31', '9860000000', '9860001234', 70.0, 'suspended', 'Safety non-compliance review', TRUE, NOW()
FROM ctx
WHERE NOT EXISTS (SELECT 1 FROM drivers d WHERE d.company_id = ctx.company_id AND d.license_number='MH1420220009999');

WITH ctx AS (
  SELECT c.id AS company_id,
         u.id AS admin_id,
         (SELECT id FROM vehicles v WHERE v.company_id = c.id AND v.registration_number='MH12AB1234' LIMIT 1) AS vehicle1,
         (SELECT id FROM vehicles v WHERE v.company_id = c.id AND v.registration_number='MH14EF9012' LIMIT 1) AS vehicle2,
         (SELECT id FROM drivers d WHERE d.company_id = c.id AND d.license_number='MH1420220001234' LIMIT 1) AS driver1,
         (SELECT id FROM drivers d WHERE d.company_id = c.id AND d.license_number='MH1420220005678' LIMIT 1) AS driver2
  FROM companies c
  JOIN users u ON u.company_id = c.id
  WHERE u.email='admin@transitops.com'
  LIMIT 1
)
INSERT INTO trips (id, company_id, trip_number, source, destination, vehicle_id, driver_id, cargo_weight, planned_distance, actual_distance, fuel_consumed, start_odometer, final_odometer, revenue, status, created_by, dispatched_by, completed_by, created_at, dispatched_at, completed_at)
SELECT gen_random_uuid(), company_id, 'TRIP-1001', 'Mumbai Warehouse', 'Pune Hub', vehicle1, driver1, 1200, 150, 150, 25.5, 15000, 15150, 8000, 'completed', admin_id, admin_id, admin_id, NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '4 hours'
FROM ctx
WHERE NOT EXISTS (SELECT 1 FROM trips t WHERE t.company_id = ctx.company_id AND t.trip_number='TRIP-1001');

WITH ctx AS (
  SELECT c.id AS company_id,
         u.id AS admin_id,
         (SELECT id FROM vehicles v WHERE v.company_id = c.id AND v.registration_number='MH14EF9012' LIMIT 1) AS vehicle2,
         (SELECT id FROM drivers d WHERE d.company_id = c.id AND d.license_number='MH1420220005678' LIMIT 1) AS driver2
  FROM companies c
  JOIN users u ON u.company_id = c.id
  WHERE u.email='admin@transitops.com'
  LIMIT 1
)
INSERT INTO trips (id, company_id, trip_number, source, destination, vehicle_id, driver_id, cargo_weight, planned_distance, fuel_consumed, start_odometer, revenue, status, created_by, dispatched_by, dispatched_at, created_at)
SELECT gen_random_uuid(), company_id, 'TRIP-1002', 'Pune Hub', 'Nashik Depot', vehicle2, driver2, 1000, 210, 18.0, 8000, 12000, 'dispatched', admin_id, admin_id, NOW() - INTERVAL '6 hours', NOW() - INTERVAL '1 day'
FROM ctx
WHERE NOT EXISTS (SELECT 1 FROM trips t WHERE t.company_id = ctx.company_id AND t.trip_number='TRIP-1002');

WITH ctx AS (
  SELECT c.id AS company_id,
         u.id AS admin_id,
         (SELECT id FROM vehicles v WHERE v.company_id = c.id AND v.registration_number='MH12AB1234' LIMIT 1) AS vehicle1,
         (SELECT id FROM drivers d WHERE d.company_id = c.id AND d.license_number='MH1420220001234' LIMIT 1) AS driver1
  FROM companies c
  JOIN users u ON u.company_id = c.id
  WHERE u.email='admin@transitops.com'
  LIMIT 1
)
INSERT INTO trips (id, company_id, trip_number, source, destination, vehicle_id, driver_id, cargo_weight, planned_distance, start_odometer, revenue, status, created_by, created_at)
SELECT gen_random_uuid(), company_id, 'TRIP-1003', 'Mumbai Warehouse', 'Surat Point', vehicle1, driver1, 900, 280, 15150, 9500, 'draft', admin_id, NOW()
FROM ctx
WHERE NOT EXISTS (SELECT 1 FROM trips t WHERE t.company_id = ctx.company_id AND t.trip_number='TRIP-1003');

WITH ctx AS (
  SELECT c.id AS company_id,
         u.id AS admin_id,
         (SELECT id FROM vehicles v WHERE v.company_id = c.id AND v.registration_number='MH12CD5678' LIMIT 1) AS vehicle2
  FROM companies c
  JOIN users u ON u.company_id = c.id
  WHERE u.email='admin@transitops.com'
  LIMIT 1
)
INSERT INTO maintenance_logs (id, company_id, vehicle_id, maintenance_type, description, scheduled_date, start_date, estimated_cost, actual_cost, status, created_by, created_at)
SELECT gen_random_uuid(), company_id, vehicle2, 'Brake service', 'Brake pad replacement and inspection', CURRENT_DATE - 1, CURRENT_DATE - 1, 3500, 0, 'active', admin_id, NOW() - INTERVAL '1 day'
FROM ctx
WHERE NOT EXISTS (
  SELECT 1 FROM maintenance_logs m
  WHERE m.company_id = ctx.company_id AND m.vehicle_id = ctx.vehicle2 AND m.status = 'active'
);

WITH ctx AS (
  SELECT c.id AS company_id,
         u.id AS admin_id,
         (SELECT id FROM vehicles v WHERE v.company_id = c.id AND v.registration_number='MH12AB1234' LIMIT 1) AS vehicle1,
         (SELECT id FROM trips t WHERE t.company_id = c.id AND t.trip_number='TRIP-1001' LIMIT 1) AS trip1
  FROM companies c
  JOIN users u ON u.company_id = c.id
  WHERE u.email='admin@transitops.com'
  LIMIT 1
)
INSERT INTO fuel_logs (id, company_id, vehicle_id, trip_id, liters, cost, log_date, odometer_reading, created_at)
SELECT gen_random_uuid(), company_id, vehicle1, trip1, 25.5, 2460.75, CURRENT_DATE - 2, 15150, NOW() - INTERVAL '2 days'
FROM ctx
WHERE NOT EXISTS (
  SELECT 1 FROM fuel_logs f
  WHERE f.company_id = ctx.company_id AND f.trip_id = ctx.trip1
);

WITH ctx AS (
  SELECT c.id AS company_id,
         u.id AS admin_id,
         (SELECT id FROM vehicles v WHERE v.company_id = c.id AND v.registration_number='MH14EF9012' LIMIT 1) AS vehicle2,
         (SELECT id FROM trips t WHERE t.company_id = c.id AND t.trip_number='TRIP-1002' LIMIT 1) AS trip2
  FROM companies c
  JOIN users u ON u.company_id = c.id
  WHERE u.email='admin@transitops.com'
  LIMIT 1
)
INSERT INTO fuel_logs (id, company_id, vehicle_id, trip_id, liters, cost, log_date, odometer_reading, created_at)
SELECT gen_random_uuid(), company_id, vehicle2, trip2, 18.0, 1749.60, CURRENT_DATE, 8100, NOW()
FROM ctx
WHERE NOT EXISTS (
  SELECT 1 FROM fuel_logs f
  WHERE f.company_id = ctx.company_id AND f.trip_id = ctx.trip2
);

WITH ctx AS (
  SELECT c.id AS company_id,
         u.id AS admin_id,
         (SELECT id FROM vehicles v WHERE v.company_id = c.id AND v.registration_number='MH12AB1234' LIMIT 1) AS vehicle1,
         (SELECT id FROM trips t WHERE t.company_id = c.id AND t.trip_number='TRIP-1001' LIMIT 1) AS trip1
  FROM companies c
  JOIN users u ON u.company_id = c.id
  WHERE u.email='admin@transitops.com'
  LIMIT 1
)
INSERT INTO expenses (id, company_id, vehicle_id, trip_id, expense_type, amount, description, expense_date, created_at)
SELECT gen_random_uuid(), company_id, vehicle1, trip1, 'toll', 450.00, 'Mumbai-Pune expressway toll', CURRENT_DATE - 2, NOW() - INTERVAL '2 days'
FROM ctx
WHERE NOT EXISTS (
  SELECT 1 FROM expenses e
  WHERE e.company_id = ctx.company_id AND e.trip_id = ctx.trip1 AND e.amount = 450.00
);

WITH ctx AS (
  SELECT c.id AS company_id,
         u.id AS admin_id,
         (SELECT id FROM vehicles v WHERE v.company_id = c.id AND v.registration_number='MH14EF9012' LIMIT 1) AS vehicle2,
         (SELECT id FROM trips t WHERE t.company_id = c.id AND t.trip_number='TRIP-1002' LIMIT 1) AS trip2
  FROM companies c
  JOIN users u ON u.company_id = c.id
  WHERE u.email='admin@transitops.com'
  LIMIT 1
)
INSERT INTO expenses (id, company_id, vehicle_id, trip_id, expense_type, amount, description, expense_date, created_at)
SELECT gen_random_uuid(), company_id, vehicle2, trip2, 'parking', 200.00, 'Parking at unloading point', CURRENT_DATE, NOW()
FROM ctx
WHERE NOT EXISTS (
  SELECT 1 FROM expenses e
  WHERE e.company_id = ctx.company_id AND e.trip_id = ctx.trip2 AND e.amount = 200.00
);

COMMIT;
