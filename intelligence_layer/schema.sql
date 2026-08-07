-- Normalized Internal Construction Cost Schema

CREATE TABLE resources (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50), -- Material, Labor, Equipment
    unit VARCHAR(20) NOT NULL,
    base_cost DECIMAL(10,2) NOT NULL,
    waste_factor DECIMAL(5,2) DEFAULT 0.0,
    source VARCHAR(100) NOT NULL,
    source_date DATE NOT NULL
);

CREATE TABLE regional_adjustments (
    id SERIAL PRIMARY KEY,
    region_code VARCHAR(50) UNIQUE NOT NULL, -- e.g., 'US-CA-SJ'
    material_multiplier DECIMAL(5,2) NOT NULL,
    labor_multiplier DECIMAL(5,2) NOT NULL,
    equipment_multiplier DECIMAL(5,2) NOT NULL
);

CREATE TABLE work_items (
    id SERIAL PRIMARY KEY,
    cost_code VARCHAR(50) UNIQUE,
    description TEXT NOT NULL,
    default_unit VARCHAR(20) NOT NULL,
    labor_resource_id INTEGER REFERENCES resources(id),
    material_resource_id INTEGER REFERENCES resources(id),
    productivity_rate DECIMAL(10,2), -- units per hour
    complexity_factor DECIMAL(5,2) DEFAULT 1.0
);

-- Seed basic regional data
INSERT INTO regional_adjustments (region_code, material_multiplier, labor_multiplier, equipment_multiplier)
VALUES ('US-CA-SJ', 1.15, 1.45, 1.10);

-- Seed basic resources
INSERT INTO resources (name, category, unit, base_cost, waste_factor, source, source_date)
VALUES 
    ('Standard Kitchen Cabinet', 'Material', 'LF', 160.00, 0.05, 'OpenConstructionEstimate', '2026-08-01'),
    ('Cabinet Installer', 'Labor', 'HR', 45.00, 0.00, 'OpenConstructionEstimate', '2026-08-01');
