// Optimized Special Majority Calculator for Israeli Real Estate Law
export class SpecialMajorityCalculator {
    constructor() {
        // Constants for Agreement Majority (Israeli Law)
        this.AGREEMENT_CLUSTER_APARTMENT_THRESHOLD = 2 / 3;
        this.AGREEMENT_BUILDING_APARTMENT_THRESHOLD_GENERAL = 3 / 5;
        this.AGREEMENT_BUILDING_COMMON_PROPERTY_THRESHOLD = 1 / 2;

        // Constants for Economic Feasibility Majority
        this.FEASIBILITY_BUILDING_APARTMENT_THRESHOLD = 2 / 5;
        this.FEASIBILITY_BUILDING_COMMON_PROPERTY_THRESHOLD = 2 / 5;

        // Section 4 constants (for owners with large holdings)
        this.SECTION_4_OWNERSHIP_LIMIT = 0.30;
        this.SECTION_4_EXCESS_FACTOR = 1 / 3;

        this.EPSILON = 1e-9;

        // Cache for optimization
        this._cache = new Map();
        this._cacheSize = 100; // Limit cache size
    }

    /**
     * Main analysis function with caching
     */
    analyze(buildingsData, scenarioSignedOwners = new Set()) {
        // Create cache key
        const cacheKey = this._createCacheKey(buildingsData, scenarioSignedOwners);
        
        // Check cache first
        if (this._cache.has(cacheKey)) {
            return this._cache.get(cacheKey);
        }

        const allClusterUnits = buildingsData.flatMap(b => b.units);
        if (allClusterUnits.length === 0) {
            return this.getEmptyResults();
        }

        // Optimize: Pre-calculate frequently used values
        const result = this._analyzeBuildingsOptimized(buildingsData, scenarioSignedOwners);
        
        // Cache result
        this._cacheResult(cacheKey, result);
        
        return result;
    }

    /**
     * Optimized building analysis with early termination and memoization
     */
    _analyzeBuildingsOptimized(buildingsData, scenarioSignedOwners) {
        let totalClusterSignedApartments = 0;
        const buildingDetails = {};
        const validBuildingsForCalc = [];

        // Optimize: Use for loop instead of forEach for better performance
        for (let i = 0; i < buildingsData.length; i++) {
            const building = buildingsData[i];
            const buildingResult = this._analyzeSingleBuilding(building, scenarioSignedOwners);
            
            buildingDetails[building.id] = buildingResult;
            totalClusterSignedApartments += buildingResult.signedApartments;
            
            if (buildingResult.isValidForCalc) {
                validBuildingsForCalc.push(building);
            }
        }

        // Calculate cluster-level results
        const agreementClusterApartmentMet = allClusterUnits.length > 0 ? 
            (totalClusterSignedApartments / allClusterUnits.length) >= 
            (this.AGREEMENT_CLUSTER_APARTMENT_THRESHOLD - this.EPSILON) : false;

        const allValidBuildingsAgreementMet = validBuildingsForCalc.length > 0 && 
            validBuildingsForCalc.every(b => buildingDetails[b.id].agreement.overallMet);

        return {
            cluster: {
                agreement: {
                    apartment: { 
                        met: agreementClusterApartmentMet, 
                        actual: totalClusterSignedApartments, 
                        required: Math.ceil(allClusterUnits.length * this.AGREEMENT_CLUSTER_APARTMENT_THRESHOLD) 
                    },
                    overallMet: agreementClusterApartmentMet && allValidBuildingsAgreementMet
                },
                totalApartments: allClusterUnits.length,
            },
            buildings: buildingDetails
        };
    }

    /**
     * Analyze single building with optimized logic
     */
    _analyzeSingleBuilding(building, scenarioSignedOwners) {
        const totalApartments = building.units.length;
        const uniqueOwners = new Set(building.units.flatMap(u => u.owners.map(o => o.idNumber))).size;

        // Optimize: Use Sets for faster lookups
        const signedUnitsInBuilding = new Set();
        let signedCommonProperty = 0;

        // Optimize: Single pass through units
        for (let i = 0; i < building.units.length; i++) {
            const unit = building.units[i];
            const isSigned = this._isUnitSigned(unit, scenarioSignedOwners);
            
            if (isSigned) {
                signedUnitsInBuilding.add(unit.id);
                signedCommonProperty += (unit.legal.commonPropertyPercentage || 0);
            }
        }

        const totalCommonProperty = building.units.reduce((sum, unit) => 
            sum + (unit.legal.commonPropertyPercentage || 0), 0);

        // Calculate agreement majority with early termination
        const agreementResults = this._calculateAgreementMajority(
            totalApartments, 
            uniqueOwners, 
            signedUnitsInBuilding.size, 
            signedCommonProperty, 
            totalCommonProperty
        );

        // Calculate feasibility majority
        const feasibilityResults = this._calculateFeasibilityMajority(
            totalApartments,
            signedUnitsInBuilding.size,
            signedCommonProperty,
            totalCommonProperty
        );

        return {
            isValidForCalc: totalApartments >= 4,
            signedApartments: signedUnitsInBuilding.size,
            totalApartments,
            signedCommonProperty,
            totalCommonProperty,
            agreement: agreementResults,
            feasibility: feasibilityResults
        };
    }

    /**
     * Optimized unit signing check
     */
    _isUnitSigned(unit, scenarioSignedOwners) {
        // Optimize: Early return if no owners
        if (!unit.owners || unit.owners.length === 0) return false;
        
        // Optimize: Use some() instead of filter() for better performance
        return unit.owners.some(owner => scenarioSignedOwners.has(owner.idNumber));
    }

    /**
     * Calculate agreement majority requirements
     */
    _calculateAgreementMajority(totalApartments, uniqueOwners, signedUnits, signedCommonProperty, totalCommonProperty) {
        let agreementApartmentCheckMet = false;

        // Optimize: Simplified logic with early returns
        if (totalApartments >= 6) {
            agreementApartmentCheckMet = (signedUnits / totalApartments) >= 
                (this.AGREEMENT_BUILDING_APARTMENT_THRESHOLD_GENERAL - this.EPSILON);
        } else if ((totalApartments === 4 || totalApartments === 5) && uniqueOwners > 2) {
            agreementApartmentCheckMet = signedUnits >= 3;
        }

        const agreementCommonPropertyCheckMet = totalCommonProperty > 0 && 
            (signedCommonProperty / totalCommonProperty) > 
            (this.AGREEMENT_BUILDING_COMMON_PROPERTY_THRESHOLD - this.EPSILON);

        return {
            apartment: { 
                met: agreementApartmentCheckMet, 
                actual: signedUnits, 
                required: totalApartments < 6 ? 3 : Math.ceil(totalApartments * this.AGREEMENT_BUILDING_APARTMENT_THRESHOLD_GENERAL) 
            },
            commonProperty: { 
                met: agreementCommonPropertyCheckMet, 
                actual: signedCommonProperty, 
                required: totalCommonProperty * this.AGREEMENT_BUILDING_COMMON_PROPERTY_THRESHOLD 
            },
            overallMet: totalApartments >= 4 && agreementApartmentCheckMet && agreementCommonPropertyCheckMet
        };
    }

    /**
     * Calculate feasibility majority requirements
     */
    _calculateFeasibilityMajority(totalApartments, signedUnits, signedCommonProperty, totalCommonProperty) {
        const feasibilityApartmentCheckMet = (signedUnits / totalApartments) >= 
            (this.FEASIBILITY_BUILDING_APARTMENT_THRESHOLD - this.EPSILON);
        
        const feasibilityCommonPropertyCheckMet = totalCommonProperty > 0 && 
            (signedCommonProperty / totalCommonProperty) >= 
            (this.FEASIBILITY_BUILDING_COMMON_PROPERTY_THRESHOLD - this.EPSILON);

        return {
            apartment: { 
                met: feasibilityApartmentCheckMet, 
                actual: signedUnits, 
                required: Math.ceil(totalApartments * this.FEASIBILITY_BUILDING_APARTMENT_THRESHOLD) 
            },
            commonProperty: { 
                met: feasibilityCommonPropertyCheckMet, 
                actual: signedCommonProperty, 
                required: totalCommonProperty * this.FEASIBILITY_BUILDING_COMMON_PROPERTY_THRESHOLD 
            },
            overallMet: totalApartments >= 4 && feasibilityApartmentCheckMet && feasibilityCommonPropertyCheckMet
        };
    }

    /**
     * Create cache key for optimization
     */
    _createCacheKey(buildingsData, scenarioSignedOwners) {
        // Create a simple hash-like key
        const buildingsHash = buildingsData.reduce((hash, building) => {
            return hash + building.id + building.units.length;
        }, 0);
        
        const ownersHash = Array.from(scenarioSignedOwners).sort().join(',');
        return `${buildingsHash}_${ownersHash}`;
    }

    /**
     * Cache management with size limits
     */
    _cacheResult(key, result) {
        // Add to cache
        this._cache.set(key, result);
        
        // Remove oldest entries if cache is too large
        if (this._cache.size > this._cacheSize) {
            const firstKey = this._cache.keys().next().value;
            this._cache.delete(firstKey);
        }
    }

    /**
     * Clear cache
     */
    clearCache() {
        this._cache.clear();
    }

    /**
     * Get cache statistics
     */
    getCacheStats() {
        return {
            size: this._cache.size,
            maxSize: this._cacheSize,
            hitRate: this._cacheHitRate || 0
        };
    }

    /**
     * Get empty results for invalid data
     */
    getEmptyResults() {
        return { 
            cluster: { 
                agreement: { 
                    apartment: {}, 
                    overallMet: false 
                }, 
                totalApartments: 0 
            }, 
            buildings: {} 
        };
    }

    /**
     * Calculate voting power with Section 4 adjustments
     */
    calculateVotingPower(owner, building, totalOwners) {
        const ownershipPercentage = this._calculateOwnershipPercentage(owner, building);
        
        // Section 4 adjustment for large owners
        if (ownershipPercentage > this.SECTION_4_OWNERSHIP_LIMIT) {
            const excess = ownershipPercentage - this.SECTION_4_OWNERSHIP_LIMIT;
            const adjustedPercentage = this.SECTION_4_OWNERSHIP_LIMIT + (excess * this.SECTION_4_EXCESS_FACTOR);
            return Math.min(adjustedPercentage, 1); // Cap at 100%
        }
        
        return ownershipPercentage;
    }

    /**
     * Calculate ownership percentage for a specific owner
     */
    _calculateOwnershipPercentage(owner, building) {
        // This is a simplified calculation
        // In reality, you'd need more complex logic to determine ownership percentage
        const totalUnits = building.units.length;
        const ownerUnits = building.units.filter(unit => 
            unit.owners.some(o => o.idNumber === owner.idNumber)
        ).length;
        
        return ownerUnits / totalUnits;
    }

    /**
     * Validate calculation assumptions
     */
    validateAssumptions(buildingsData) {
        const warnings = [];
        
        // Check for minimum requirements
        const totalUnits = buildingsData.reduce((sum, b) => sum + b.units.length, 0);
        if (totalUnits < 4) {
            warnings.push('פחות מ-4 יחידות בפרויקט - דרישות רוב מיוחד לא חלות');
        }

        // Check for data completeness
        buildingsData.forEach(building => {
            building.units.forEach(unit => {
                if (!unit.legal || unit.legal.commonPropertyPercentage === undefined) {
                    warnings.push(`יחידה ${unit.id} חסר נתון של אחוז רכוש משותף`);
                }
            });
        });

        return warnings;
    }

    /**
     * Generate recommendation based on current status
     */
    generateRecommendation(analysisResult) {
        const recommendations = [];
        
        // Check cluster level
        if (!analysisResult.cluster.agreement.overallMet) {
            const neededApartments = analysisResult.cluster.agreement.apartment.required - 
                analysisResult.cluster.agreement.apartment.actual;
            
            if (neededApartments > 0) {
                recommendations.push({
                    priority: 'high',
                    type: 'cluster',
                    message: `נדרשים עוד ${neededApartments} דירות להשגת רוב מיוחד במכלול`,
                    action: 'Focus on getting additional apartment owners to sign'
                });
            }
        }

        // Check individual buildings
        Object.entries(analysisResult.buildings).forEach(([buildingId, buildingResult]) => {
            if (!buildingResult.agreement.overallMet) {
                const neededApartments = buildingResult.agreement.apartment.required - 
                    buildingResult.agreement.apartment.actual;
                    
                if (neededApartments > 0) {
                    recommendations.push({
                        priority: 'medium',
                        type: 'building',
                        buildingId,
                        message: `בניין ${buildingId}: נדרשות עוד ${neededApartments} דירות לחתימה`,
                        action: `Target building ${buildingId} for additional signatures`
                    });
                }
            }
        });

        return recommendations.sort((a, b) => {
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
    }

    /**
     * Export analysis to report format
     */
    exportAnalysis(analysisResult) {
        return {
            timestamp: new Date().toISOString(),
            summary: {
                totalBuildings: Object.keys(analysisResult.buildings).length,
                totalApartments: analysisResult.cluster.totalApartments,
                clusterAgreementMet: analysisResult.cluster.agreement.overallMet,
                signedApartments: analysisResult.cluster.agreement.apartment.actual,
                requiredApartments: analysisResult.cluster.agreement.apartment.required
            },
            buildings: Object.entries(analysisResult.buildings).map(([id, data]) => ({
                buildingId: id,
                ...data,
                agreementPercentage: data.totalApartments > 0 ? 
                    (data.signedApartments / data.totalApartments * 100).toFixed(1) : 0,
                commonPropertyPercentage: data.totalCommonProperty > 0 ? 
                    (data.signedCommonProperty / data.totalCommonProperty * 100).toFixed(1) : 0
            })),
            recommendations: this.generateRecommendation(analysisResult)
        };
    }
}

// Export singleton instance for global use
export const specialMajorityCalculator = new SpecialMajorityCalculator();