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
    },
    {
        "id": "struct_syp",
        "name": "Southern Yellow Pine Framing (High Wind/Load)",
        "category": "Additions, Remodeling & Construction",
        "subcategory": "Expansions",
        "unit": "LF",
        "parts_breakdown": {
            "material_name": "Southern Yellow Pine (SYP) 2x6",
            "retail_price": 12.50, # per 10ft
            "unit_cost_per_lf": 1.25,
            "source": "The Home Depot Pro",
            "brand_spec": "Pro Grade #2 & Better SYP",
            "tech_spec": "Higher density and specific gravity than SPF. Superior fastener-holding power.",
            "compliance": "IBC/IRC High Wind Load"
        },
        "installation_breakdown": {
            "labor_rate_per_unit": 2.50,
            "equipment_per_unit": 0.25,
            "waste_factor_pct": 5,
            "delivery_base": 150.0,
            "source": "DDC CWICR"
        }
    },
    {
        "id": "ext_lp_smartside",
        "name": "Engineered Wood Siding (LP SmartSide)",
        "category": "Roofing, Siding & Gutters",
        "subcategory": "Siding",
        "unit": "SQ",
        "parts_breakdown": {
            "material_name": "LP SmartSide Lap Siding",
            "retail_price": 185.00, # per square
            "unit_cost_per_sf": 1.85,
            "source": "The Home Depot",
            "brand_spec": "Louisiana-Pacific",
            "tech_spec": "Engineered wood strands cured with heavy-duty structural resins. Resists delamination.",
            "compliance": "IBC Exterior Cladding"
        },
        "installation_breakdown": {
            "labor_rate_per_unit": 160.00,
            "equipment_per_unit": 35.00,
            "waste_factor_pct": 10,
            "delivery_base": 180.0,
            "source": "RSMeans"
        }
    },
    {
        "id": "metal_resilient_channel",
        "name": "Acoustic Resilient Channels",
        "category": "Carpentry, Flooring & Interiors",
        "subcategory": "Walls & Ceilings",
        "unit": "LF",
        "parts_breakdown": {
            "material_name": "Resilient Channel (D1007)",
            "retail_price": 4.50, # per 12ft
            "unit_cost_per_lf": 0.38,
            "source": "GMS Inc. / Commercial Wholesale",
            "brand_spec": "Bailey Metal Products",
            "tech_spec": "Physically separates drywall from studs. Dissipates kinetic sound energy.",
            "compliance": "NBCC STC Requirements"
        },
        "installation_breakdown": {
            "labor_rate_per_unit": 1.10,
            "equipment_per_unit": 0.05,
            "waste_factor_pct": 5,
            "delivery_base": 75.0,
            "source": "DDC CWICR"
        }
    },
    {
        "id": "metal_flex_track",
        "name": "Curved Partition Wall (Flex-Track)",
        "category": "Additions, Remodeling & Construction",
        "subcategory": "Room Remodels",
        "unit": "LF",
        "parts_breakdown": {
            "material_name": "Flex-Track Galvanized Steel",
            "retail_price": 28.00, # per 10ft
            "unit_cost_per_lf": 2.80,
            "source": "RONA VIPpro",
            "brand_spec": "Bailey Metal Products",
            "tech_spec": "Allows shaping precise, identical curvatures rapidly.",
            "compliance": "NBCC Structural Load"
        },
        "installation_breakdown": {
            "labor_rate_per_unit": 12.00,
            "equipment_per_unit": 1.50,
            "waste_factor_pct": 8,
            "delivery_base": 100.0,
            "source": "Market Average"
        }
    },
    {
        "id": "masonry_high_strength",
        "name": "High-Strength Concrete Footings",
        "category": "Landscaping, Yard & Outdoor Living",
        "subcategory": "Hardscaping & Paving",
        "unit": "Bag",
        "parts_breakdown": {
            "material_name": "5000 PSI High-Strength Concrete (80lb)",
            "retail_price": 7.50,
            "unit_cost_per_ea": 7.50,
            "source": "The Home Depot",
            "brand_spec": "Quikrete / Sakrete",
            "tech_spec": "Engineered for 4,000 to 5,000 PSI. Used for load-bearing footings.",
            "compliance": "IBC Concrete Construction"
        },
        "installation_breakdown": {
            "labor_rate_per_unit": 12.00, # mixing and pouring
            "equipment_per_unit": 2.50,
            "waste_factor_pct": 5,
            "delivery_base": 90.0,
            "source": "RSMeans"
        }
    },
    {
        "id": "masonry_planislope",
        "name": "Polymer-Modified Shower Pan Mortar",
        "category": "Carpentry, Flooring & Interiors",
        "subcategory": "Flooring",
        "unit": "Bag",
        "parts_breakdown": {
            "material_name": "Planislope RS Rapid-Setting Mortar",
            "retail_price": 22.00,
            "unit_cost_per_ea": 22.00,
            "source": "Wholesale Tile Supply",
            "brand_spec": "Mapei",
            "tech_spec": "Dry-pack mortar enhanced with synthetic polymers to increase adhesion & flexibility.",
            "compliance": "Tile Council of North America (TCNA)"
        },
        "installation_breakdown": {
            "labor_rate_per_unit": 25.00,
            "equipment_per_unit": 1.00,
            "waste_factor_pct": 5,
            "delivery_base": 40.0,
            "source": "DDC CWICR"
        }
    },
    {
        "id": "masonry_sonotubes",
        "name": "Cylindrical Concrete Column Forms",
        "category": "Additions, Remodeling & Construction",
        "subcategory": "Site Preparation",
        "unit": "LF",
        "parts_breakdown": {
            "material_name": "10-inch Fiber Concrete Forms (Sonotubes)",
            "retail_price": 12.00, # per 4ft tube
            "unit_cost_per_lf": 3.00,
            "source": "RONA",
            "brand_spec": "Bomix / Quikrete",
            "tech_spec": "Spirally wound cardboard engineered for hydrostatic pressure. Biodegradable.",
            "compliance": "IBC Footing Standards"
        },
        "installation_breakdown": {
            "labor_rate_per_unit": 4.00,
            "equipment_per_unit": 0.0,
            "waste_factor_pct": 10,
            "delivery_base": 50.0,
            "source": "Market Average"
        }
    },
    {
        "id": "masonry_rebar",
        "name": "Concrete Reinforcement (Rebar)",
        "category": "Additions, Remodeling & Construction",
        "subcategory": "Site Preparation",
        "unit": "LF",
        "parts_breakdown": {
            "material_name": "Ribbed Masonry Rebar (1/2 in.)",
            "retail_price": 8.50, # per 10ft
            "unit_cost_per_lf": 0.85,
            "source": "The Home Depot Pro",
            "brand_spec": "Metaltech",
            "tech_spec": "Raised ridges lock into concrete matrix for tensile strength.",
            "compliance": "ASTM A615"
        },
        "installation_breakdown": {
            "labor_rate_per_unit": 1.25,
            "equipment_per_unit": 0.25,
            "waste_factor_pct": 10,
            "delivery_base": 120.0,
            "source": "DDC CWICR"
        }
    },
    {
        "id": "fastener_timberlok",
        "name": "Heavy Timber Structural Fastening",
        "category": "Additions, Remodeling & Construction",
        "subcategory": "Room Remodels",
        "unit": "EA",
        "parts_breakdown": {
            "material_name": "TimberLOK Heavy-Duty Wood Screws",
            "retail_price": 42.00, # box of 50
            "unit_cost_per_ea": 0.84,
            "source": "The Home Depot Pro",
            "brand_spec": "FastenMaster",
            "tech_spec": "Replaces 3/8-inch lag bolts. Hex-washer head, massive clamping force.",
            "compliance": "Certified for ACQ wood"
        },
        "installation_breakdown": {
            "labor_rate_per_unit": 0.40,
            "equipment_per_unit": 0.05,
            "waste_factor_pct": 2,
            "delivery_base": 0.0,
            "source": "Internal Estimator"
        }
    },
    {
        "id": "fastener_simpson",
        "name": "Hurricane Ties & Connectors",
        "category": "Roofing, Siding & Gutters",
        "subcategory": "Roofing",
        "unit": "EA",
        "parts_breakdown": {
            "material_name": "H2.5A Z-Max Hurricane Tie",
            "retail_price": 1.15,
            "unit_cost_per_ea": 1.15,
            "source": "RONA VIPpro",
            "brand_spec": "Simpson Strong-Tie",
            "tech_spec": "Z-Max hot-dipped galvanization for highly corrosive exterior environments.",
            "compliance": "High Wind / Seismic Code"
        },
        "installation_breakdown": {
            "labor_rate_per_unit": 1.80,
            "equipment_per_unit": 0.10,
            "waste_factor_pct": 0,
            "delivery_base": 0.0,
            "source": "RSMeans"
        }
    },
    {
        "id": "insul_eps",
        "name": "Basement Wall Continuous Insulation (EPS)",
        "category": "Carpentry, Flooring & Interiors",
        "subcategory": "Insulation",
        "unit": "SF",
        "parts_breakdown": {
            "material_name": "EPS Rigid Foam (R-3.8/inch)",
            "retail_price": 18.00, # 4x8 sheet
            "unit_cost_per_sf": 0.56,
            "source": "The Home Depot",
            "brand_spec": "Cellofoam",
            "tech_spec": "Expanded Polystyrene. Vapor permeable for basement retrofits.",
            "compliance": "ASTM C578"
        },
        "installation_breakdown": {
            "labor_rate_per_unit": 0.90,
            "equipment_per_unit": 0.05,
            "waste_factor_pct": 8,
            "delivery_base": 90.0,
            "source": "DDC CWICR"
        }
    },
    {
        "id": "insul_polyiso",
        "name": "Exterior Continuous Insulation (Polyiso)",
        "category": "Roofing, Siding & Gutters",
        "subcategory": "Siding",
        "unit": "SF",
        "parts_breakdown": {
            "material_name": "Rmax Pro Select Polyiso (R-6.5/inch)",
            "retail_price": 35.00, # 4x8 sheet
            "unit_cost_per_sf": 1.09,
            "source": "Commercial Wholesale",
            "brand_spec": "Sika",
            "tech_spec": "Highest R-value per inch. Aluminum facers act as radiant barrier & vapor retarder.",
            "compliance": "IECC Thermal Bridging"
        },
        "installation_breakdown": {
            "labor_rate_per_unit": 1.15,
            "equipment_per_unit": 0.10,
            "waste_factor_pct": 10,
            "delivery_base": 120.0,
            "source": "RSMeans"
        }
    },
    {
        "id": "drywall_glasroc",
        "name": "Elevator / Stairwell Shaftliner",
        "category": "Additions, Remodeling & Construction",
        "subcategory": "Room Remodels",
        "unit": "SF",
        "parts_breakdown": {
            "material_name": "GlasRoc Shaftliner (1-inch thick)",
            "retail_price": 45.00, # 2x8 panel
            "unit_cost_per_sf": 2.81,
            "source": "GMS Inc. (The Home Depot subsidiary)",
            "brand_spec": "CertainTeed",
            "tech_spec": "Moisture-resistant, non-combustible gypsum core encased in reinforced fiberglass mat.",
            "compliance": "Area Separation Wall Fire Code"
        },
        "installation_breakdown": {
            "labor_rate_per_unit": 3.50,
            "equipment_per_unit": 0.50,
            "waste_factor_pct": 15,
            "delivery_base": 200.0,
            "source": "DDC CWICR"
        }
    },
    {
        "id": "cladding_novik",
        "name": "Faux Stone Veneer Installation",
        "category": "Roofing, Siding & Gutters",
        "subcategory": "Siding",
        "unit": "SF",
        "parts_breakdown": {
            "material_name": "Stacked Stone Polymer Veneer",
            "retail_price": 14.50, # per sf
            "unit_cost_per_sf": 14.50,
            "source": "RONA",
            "brand_spec": "Novik",
            "tech_spec": "Injection-molded polymer mimicing rough-sawn stone aesthetics at a fraction of weight.",
            "compliance": "IBC Exterior Cladding"
        },
        "installation_breakdown": {
            "labor_rate_per_unit": 4.50,
            "equipment_per_unit": 0.25,
            "waste_factor_pct": 12,
            "delivery_base": 150.0,
            "source": "Market Average"
        }
    },
    {
        "id": "waterproofing_blueskin",
        "name": "Elastomeric Asphalt Foundation Membrane",
        "category": "Plumbing, Water & Septic",
        "subcategory": "Core Plumbing",
        "unit": "SF",
        "parts_breakdown": {
            "material_name": "Blueskin WP200 (Peel and Stick)",
            "retail_price": 195.00, # per 100sf roll
            "unit_cost_per_sf": 1.95,
            "source": "The Home Depot",
            "brand_spec": "Henry",
            "tech_spec": "SBS-rubberized asphalt. Self-sealing compound if punctured.",
            "compliance": "Subterranean Waterproofing Code"
        },
        "installation_breakdown": {
            "labor_rate_per_unit": 2.25,
            "equipment_per_unit": 0.15,
            "waste_factor_pct": 5,
            "delivery_base": 75.0,
            "source": "DDC CWICR"
        }
    }
]
