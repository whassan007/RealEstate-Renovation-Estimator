"""
Comprehensive Renovation Taxonomy & Materials Database
Derived from HomeAdvisor/Angi taxonomy and North American construction materials procurement data.
"""

inventory_catalog = [
    {
        "id": "add_custom_subfloor",
        "name": "Install High-Performance Subflooring",
        "category": "Additions, Remodeling & Construction",
        "subcategory": "Room Remodels",
        "unit": "SF",
        "parts_breakdown": {
            "material_name": "Huber AdvanTech OSB (23/32-inch)",
            "retail_price": 65.00,
            "unit_cost_per_sf": 65.00 / 32, # approx $2.03/sf
            "source": "Commercial Wholesale (e.g., The Home Depot Pro)",
            "brand_spec": "Huber Engineered Woods",
            "tech_spec": "Advanced liquid resin binders, tongue-and-groove precision milled. Extreme moisture resistance.",
            "compliance": "IBC/NBCC load-bearing compliant"
        },
        "installation_breakdown": {
            "labor_rate_per_unit": 1.25,
            "equipment_per_unit": 0.15,
            "waste_factor_pct": 10,
            "delivery_base": 120.0,
            "source": "DDC CWICR / RSMeans"
        }
    },
    {
        "id": "add_wall_framing",
        "name": "Erect Metal Stud Partition Wall",
        "category": "Additions, Remodeling & Construction",
        "subcategory": "Expansions",
        "unit": "LF",
        "parts_breakdown": {
            "material_name": "25-gauge Galvanized Steel Studs (Bailey)",
            "retail_price": 9.50, # per 10ft stud
            "unit_cost_per_lf": 9.50 / 10 * 3, # assuming 16" OC, roughly 3 studs per LF of wall height 10'
            "source": "RONA VIPpro",
            "brand_spec": "Bailey Metal Products",
            "tech_spec": "Cold-formed galvanized steel. Will not shrink/warp. Resistant to biological degradation.",
            "compliance": "NBCC Fire Codes / CCMC Evaluated. 'Well Made Here' certified."
        },
        "installation_breakdown": {
            "labor_rate_per_unit": 8.50,
            "equipment_per_unit": 1.20,
            "waste_factor_pct": 5,
            "delivery_base": 150.0,
            "source": "DDC CWICR"
        }
    },
    {
        "id": "carp_insulation",
        "name": "Install Premium Mineral Wool Insulation",
        "category": "Carpentry, Flooring & Interiors",
        "subcategory": "Insulation",
        "unit": "SF",
        "parts_breakdown": {
            "material_name": "ROCKWOOL Comfortbatt (R-22, 2x6 framing)",
            "retail_price": 75.00, # per bag
            "unit_cost_per_sf": 75.00 / 39.8, # approx $1.88/sf
            "source": "RONA / The Home Depot",
            "brand_spec": "ROCKWOOL",
            "tech_spec": "Basalt rock & steel slag. Non-combustible (>2000F). High density acoustic dampening.",
            "compliance": "IECC / NBCC R-value mandates"
        },
        "installation_breakdown": {
            "labor_rate_per_unit": 0.85,
            "equipment_per_unit": 0.05,
            "waste_factor_pct": 8,
            "delivery_base": 60.0,
            "source": "RSMeans"
        }
    },
    {
        "id": "carp_drywall_fire",
        "name": "Install Type-X Fire-Rated Drywall",
        "category": "Carpentry, Flooring & Interiors",
        "subcategory": "Walls & Ceilings",
        "unit": "SF",
        "parts_breakdown": {
            "material_name": "CertainTeed Type X Gypsum (5/8 in.)",
            "retail_price": 22.50, # per sheet
            "unit_cost_per_sf": 22.50 / 32, # approx $0.70/sf
            "source": "Commercial Wholesale (GMS Inc.)",
            "brand_spec": "CertainTeed",
            "tech_spec": "Glass fibers and shrinkage-compensating additives in gypsum core to resist calcination collapse.",
            "compliance": "ASTM E119 Fire-Resistant Assemblies"
        },
        "installation_breakdown": {
            "labor_rate_per_unit": 1.80,
            "equipment_per_unit": 0.20,
            "waste_factor_pct": 12,
            "delivery_base": 200.0,
            "source": "DDC CWICR"
        }
    },
    {
        "id": "struct_hardware",
        "name": "Structural Fastening & Anchoring (ACQ treated)",
        "category": "Additions, Remodeling & Construction",
        "subcategory": "Site Preparation",
        "unit": "EA",
        "parts_breakdown": {
            "material_name": "GRK Structural Wood Screws",
            "retail_price": 45.00, # per box of 50
            "unit_cost_per_ea": 45.00 / 50, # $0.90 per screw
            "source": "The Home Depot",
            "brand_spec": "GRK Fasteners",
            "tech_spec": "Climatek coating prevents galvanic corrosion in ACQ lumber. Zip-tip eliminates pre-drilling.",
            "compliance": "AC257 code-approved"
        },
        "installation_breakdown": {
            "labor_rate_per_unit": 0.50,
            "equipment_per_unit": 0.0,
            "waste_factor_pct": 2,
            "delivery_base": 0.0,
            "source": "Internal Estimator"
        }
    },
    {
        "id": "ext_waterproofing",
        "name": "Subterranean Foundation Waterproofing",
        "category": "Roofing, Siding & Gutters",
        "subcategory": "Roofing", # Could map better, but fits exterior envelope
        "unit": "LF",
        "parts_breakdown": {
            "material_name": "DELTA-MS Dimpled HDPE Membrane",
            "retail_price": 185.00, # per roll
            "unit_cost_per_lf": 185.00 / 65, # approx $2.84/lf
            "source": "Wholesale Supply",
            "brand_spec": "Dörken",
            "tech_spec": "Vacuum-formed dimpled high-density polyethylene. Creates continuous air gap capillary break.",
            "compliance": "CCMC Evaluation Report"
        },
        "installation_breakdown": {
            "labor_rate_per_unit": 4.50,
            "equipment_per_unit": 0.75,
            "waste_factor_pct": 10,
            "delivery_base": 120.0,
            "source": "RSMeans"
        }
    },
    {
        "id": "ext_siding_poly",
        "name": "Install High-Performance Polymer Siding",
        "category": "Roofing, Siding & Gutters",
        "subcategory": "Siding",
        "unit": "SQ", # 1 SQ = 100 SF
        "parts_breakdown": {
            "material_name": "Kaycan Verona Vinyl Siding",
            "retail_price": 250.00, # per square
            "unit_cost_per_sf": 250.00 / 100, # $2.50/sf
            "source": "RONA",
            "brand_spec": "Kaycan",
            "tech_spec": "Helios and Duratron UV-resistance technology (titanium dioxide). Needs specific thermal expansion fastening.",
            "compliance": "IBC Exterior Cladding Attachments"
        },
        "installation_breakdown": {
            "labor_rate_per_unit": 180.00, # per square
            "equipment_per_unit": 25.00,
            "waste_factor_pct": 15,
            "delivery_base": 200.0,
            "source": "DDC CWICR"
        }
    },
    {
        "id": "hvac_roughin",
        "name": "Central AC Service & Duct Rough-in",
        "category": "HVAC (Heating, Ventilation & Air Conditioning)",
        "subcategory": "Cooling Systems",
        "unit": "EA",
        "parts_breakdown": {
            "material_name": "HVAC Ducting & Refrigerant Lines",
            "retail_price": 1200.00,
            "unit_cost_per_ea": 1200.00,
            "source": "SRS Distribution / Mingledorff's",
            "brand_spec": "Commercial HVAC Supply",
            "tech_spec": "R-8 insulated flex ducting, brazed copper refrigerant linesets.",
            "compliance": "IECC / Mechanical Code"
        },
        "installation_breakdown": {
            "labor_rate_per_unit": 850.00,
            "equipment_per_unit": 50.00,
            "waste_factor_pct": 5,
            "delivery_base": 150.0,
            "source": "RSMeans HVAC"
        }
    },
    {
        "id": "plumb_roughin",
        "name": "PEX Tubing Water Distribution Setup",
        "category": "Plumbing, Water & Septic",
        "subcategory": "Core Plumbing",
        "unit": "LF",
        "parts_breakdown": {
            "material_name": "Uponor PEX-a Tubing (1/2 in.)",
            "retail_price": 0.65,
            "unit_cost_per_lf": 0.65,
            "source": "Wholesale Distributor",
            "brand_spec": "Uponor",
            "tech_spec": "Cross-linked polyethylene. Expansion fittings eliminate flow restriction.",
            "compliance": "National Plumbing Code"
        },
        "installation_breakdown": {
            "labor_rate_per_unit": 3.50,
            "equipment_per_unit": 0.25,
            "waste_factor_pct": 5,
            "delivery_base": 50.0,
            "source": "DDC CWICR"
        }
    },
    {
        "id": "elec_panel",
        "name": "200A Breaker Panel Upgrade",
        "category": "Electrical, Tech & Security",
        "subcategory": "Core Electrical",
        "unit": "EA",
        "parts_breakdown": {
            "material_name": "200A Load Center with Main Breaker",
            "retail_price": 450.00,
            "unit_cost_per_ea": 450.00,
            "source": "The Home Depot Pro",
            "brand_spec": "Square D (Schneider Electric)",
            "tech_spec": "QO series with plug-on neutral. Accommodates AFCI/GFCI dual function breakers.",
            "compliance": "National Electrical Code (NEC)"
        },
        "installation_breakdown": {
            "labor_rate_per_unit": 1200.00,
            "equipment_per_unit": 75.00,
            "waste_factor_pct": 0,
            "delivery_base": 50.0,
            "source": "Local Market Average"
        }
    },
    {
        "id": "land_decking",
        "name": "Install ACQ Pressure-Treated Decking",
        "category": "Landscaping, Yard & Outdoor Living",
        "subcategory": "Outdoor Structures",
        "unit": "SF",
        "parts_breakdown": {
            "material_name": "5/4x6 ACQ Treated Pine Decking",
            "retail_price": 1.25, # per linear foot approx
            "unit_cost_per_sf": 2.65, 
            "source": "RONA",
            "brand_spec": "Pro Grade #2 & Better SPF",
            "tech_spec": "Alkaline Copper Quaternary treated for ground-contact and extreme weather resistance.",
            "compliance": "AWPA U1 Use Category System"
        },
        "installation_breakdown": {
            "labor_rate_per_unit": 6.50,
            "equipment_per_unit": 0.50,
            "waste_factor_pct": 12,
            "delivery_base": 180.0,
            "source": "DDC CWICR"
        }
    },
    {
        "id": "clean_demo",
        "name": "Deep Cleaning & Demolition Waste Disposal",
        "category": "Cleaning, Handyman & Specialized Services",
        "subcategory": "Logistics",
        "unit": "Load",
        "parts_breakdown": {
            "material_name": "20-Yard Roll-Off Dumpster",
            "retail_price": 450.00,
            "unit_cost_per_ea": 450.00,
            "source": "Local Hauler Network",
            "brand_spec": "N/A",
            "tech_spec": "Capacity for heavy masonry, drywall, and general C&D debris.",
            "compliance": "Municipal Waste Management Standards"
        },
        "installation_breakdown": {
            "labor_rate_per_unit": 150.00, # Loading labor
            "equipment_per_unit": 50.00, # Tipping fees
            "waste_factor_pct": 0,
            "delivery_base": 250.0,
            "source": "Market Average"
        }
    }
]
