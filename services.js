import { APP_CONFIG, STATUS_MAP } from './constants';

// Theme Service for managing light/dark theme
export class ThemeService {
    static applyTheme(theme) {
        if (typeof document !== 'undefined') {
            document.documentElement.classList.toggle('dark', theme === 'dark');
        }
    }

    static getSystemTheme() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    static toggleTheme(currentTheme) {
        return currentTheme === 'light' ? 'dark' : 'light';
    }
}

// CSV Service for data import/export
export class CSVService {
    static exportToCsv(data) {
        if (!data || data.length === 0) return '';

        const getAllKeys = (obj, prefix = '') => {
            return Object.keys(obj).reduce((acc, key) => {
                const pre = prefix.length ? prefix + '.' : '';
                const value = obj[key];
                
                if (value && typeof value === 'object' && !Array.isArray(value)) {
                    Object.assign(acc, getAllKeys(value, pre + key));
                } else {
                    acc[pre + key] = true;
                }
                return acc;
            }, {});
        };

        const allKeysObject = data.reduce((acc, row) => Object.assign(acc, getAllKeys(row)), {});
        const headers = Object.keys(allKeysObject);
        const csvRows = [headers.join(',')];

        data.forEach(row => {
            const values = headers.map(header => {
                const value = CSVService.getNestedValue(row, header);
                return CSVService.escapeCsvValue(value);
            });
            csvRows.push(values.join(','));
        });

        return csvRows.join('\n');
    }

    static escapeCsvValue(value) {
        if (value === null || value === undefined) return '';
        
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
    }

    static getNestedValue(obj, path) {
        if (!path || !obj) return undefined;
        return path.split('.').reduce((o, key) => (o && o[key] !== undefined) ? o[key] : undefined, obj);
    }

    static downloadCsv(csvContent, filename) {
        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    static async importFromCsv(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (event) => {
                try {
                    const csvString = event.target.result;
                    const data = CSVService.parseCsv(csvString);
                    resolve(data);
                } catch (error) {
                    reject(new Error(`שגיאה בפירוק קובץ CSV: ${error.message}`));
                }
            };
            
            reader.onerror = () => {
                reject(new Error('שגיאה בקריאת הקובץ'));
            };
            
            reader.readAsText(file, 'UTF-8');
        });
    }

    static parseCsv(csvString) {
        const lines = csvString.trim().split(/\r?\n/);
        if (lines.length < 2) return [];

        const headers = lines[0].split(',').map(h => h.trim());
        const data = [];

        for (let i = 1; i < lines.length; i++) {
            if (!lines[i]) continue;

            const values = CSVService.parseCsvLine(lines[i]);
            const obj = {};
            
            headers.forEach((header, index) => {
                if (values[index] !== undefined) {
                    let value = values[index].trim();
                    if (value.startsWith('"') && value.endsWith('"')) {
                        value = value.slice(1, -1).replace(/""/g, '"');
                    }
                    CSVService.setNestedValue(obj, header, value);
                }
            });
            
            data.push(obj);
        }
        
        return data;
    }

    static parseCsvLine(line) {
        const values = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    current += '"';
                    i++; // Skip next quote
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                values.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        
        values.push(current);
        return values;
    }

    static setNestedValue(obj, path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((o, key) => {
            if (o[key] === undefined || o[key] === null || typeof o[key] !== 'object') {
                o[key] = {};
            }
            return o[key];
        }, obj);

        let finalValue = value;
        if (typeof value === 'string') {
            if (value.toLowerCase() === 'true') finalValue = true;
            else if (value.toLowerCase() === 'false') finalValue = false;
            else if (!isNaN(value) && value.trim() !== '' && !isNaN(parseFloat(value))) {
                finalValue = parseFloat(value);
            }
        }

        target[lastKey] = finalValue;
    }
}

// Data Service for business logic
export class DataService {
    static getCalculatedSignatureStatus(owner) {
        if (!owner) return 'missing';
        
        const signatureDocs = [
            ...Object.values(owner.legalSignatures || {}),
            ...Object.values(owner.requiredDocuments || {}).map(doc => doc.status)
        ];

        const positive = ['V', 'signed', 'ok'];
        const negative = ['X', 'missing', 'rejected'];
        const pending = ['pending'];

        if (signatureDocs.length === 0) return 'pending';
        if (signatureDocs.every(s => positive.includes(s))) return 'signed';
        if (signatureDocs.some(s => negative.includes(s))) return 'rejected';
        if (signatureDocs.some(s => pending.includes(s))) return 'pending';
        return 'pending';
    }

    static getAllOwnersWithContext(data) {
        const assignedOwners = data.buildings.flatMap(b =>
            b.units.flatMap(u =>
                u.owners.map(o => ({
                    ...o,
                    signatureStatus: DataService.getCalculatedSignatureStatus(o),
                    unit: u,
                    building: b
                }))
            )
        );
        
        const unassigned = (data.unassignedOwners || []).map(o => ({
            ...o,
            signatureStatus: DataService.getCalculatedSignatureStatus(o),
            unit: null,
            building: null
        }));
        
        return [...assignedOwners, ...unassigned];
    }

    static getAllUnitsWithContext(data) {
        const assignedUnits = data.buildings.flatMap(b => 
            b.units.map(u => ({ ...u, building: b }))
        );
        
        const unassigned = (data.unassignedUnits || []).map(u => ({
            ...u,
            building: null
        }));

        return [...assignedUnits, ...unassigned].map(u => {
            const signedOwners = u.owners.filter(o => 
                DataService.getCalculatedSignatureStatus(o) === 'signed'
            ).length;
            
            const docStatuses = Object.values(u.requiredDocuments || {}).map(d => d.status);
            const okDocs = docStatuses.filter(s => s === 'ok' || s === 'signed').length;
            const relevantDocs = docStatuses.filter(s => s !== 'na').length;

            return {
                ...u,
                name: u.identification.fullAddress,
                ownerNames: u.owners.map(o => o.name).join(', '),
                ownerCount: u.owners.length,
                signingStatus: u.owners.length > 0 ? (signedOwners / u.owners.length) * 100 : 0,
                documentsStatus: relevantDocs > 0 ? (okDocs / relevantDocs) * 100 : 0,
            };
        });
    }

    static getAllBuildingsWithContext(data) {
        const initialSignedOwners = new Set(
            data.buildings
                .flatMap(b => b.units.flatMap(u => u.owners))
                .filter(o => DataService.getCalculatedSignatureStatus(o) === 'signed')
                .map(o => o.idNumber)
        );
        
        const majorityStatus = SpecialMajorityCalculator.analyze(data.buildings, initialSignedOwners);

        return data.buildings.map(b => {
            const buildingDetail = majorityStatus.buildings[b.id];
            const signedUnits = b.units.filter(u => 
                u.owners.every(o => DataService.getCalculatedSignatureStatus(o) === 'signed')
            ).length;

            return {
                ...b,
                unitCount: b.units.length,
                specialMajorityStatus: buildingDetail?.agreement.overallMet ? 'approved' : 
                    (buildingDetail?.isValidForCalc ? 'failing' : 'invalid'),
                signingProgress: b.units.length > 0 ? (signedUnits / b.units.length) * 100 : 0,
                commonPropertyProgress: buildingDetail?.totalCommonProperty > 0 ? 
                    (buildingDetail.signedCommonProperty / buildingDetail.totalCommonProperty) * 100 : 0,
                financialIssuesCount: b.units.filter(u => u.legal.liens !== 'נקי').length,
            };
        });
    }

    static getProjectWithContext(data) {
        const initialSignedOwners = new Set(
            data.buildings
                .flatMap(b => b.units.flatMap(u => u.owners))
                .filter(o => DataService.getCalculatedSignatureStatus(o) === 'signed')
                .map(o => o.idNumber)
        );
        
        const majorityStatus = SpecialMajorityCalculator.analyze(data.buildings, initialSignedOwners);
        const allUnits = data.buildings.flatMap(b => b.units);
        const allOwners = new Set(allUnits.flatMap(u => u.owners.map(o => o.idNumber))).size;

        return [{
            ...data,
            totalUnits: allUnits.length,
            totalOwners: allOwners,
            overallSpecialMajorityStatus: majorityStatus.cluster.agreement.overallMet ? 'approved' : 'failing',
            overallSigningProgress: majorityStatus.cluster.totalApartments > 0 ? 
                (majorityStatus.cluster.agreement.apartment.actual / majorityStatus.cluster.totalApartments) * 100 : 0,
        }];
    }

    static getTotalOwnersCount(data) {
        const allOwnersInBuildings = data.buildings.flatMap(b => b.units.flatMap(u => u.owners));
        const allOwnersWithUnassigned = [
            ...allOwnersInBuildings, 
            ...(data.unassignedOwners || [])
        ];
        return new Set(allOwnersWithUnassigned.map(o => o.idNumber)).size;
    }

    static getTotalUnitsCount(data) {
        const allUnitsInBuildings = data.buildings.flatMap(b => b.units);
        const allUnitsWithUnassigned = [
            ...allUnitsInBuildings, 
            ...(data.unassignedUnits || [])
        ];
        return allUnitsWithUnassigned.length;
    }

    static getOwnersForIcons(data) {
        const allOwnersInBuildings = data.buildings.flatMap(b => b.units.flatMap(u => u.owners));
        const allOwnersWithUnassigned = [
            ...allOwnersInBuildings, 
            ...(data.unassignedOwners || [])
        ];

        return allOwnersWithUnassigned.map(o => ({ 
            id: o.id, 
            tooltip: `${o.name} (ת.ז. ${o.idNumber})`, 
            type: 'owner',
            status: DataService.getCalculatedSignatureStatus(o)
        }));
    }

    static getUnitsForIcons(data) {
        const allUnitsInBuildings = data.buildings.flatMap(b => b.units);
        const allUnitsWithUnassigned = [
            ...allUnitsInBuildings, 
            ...(data.unassignedUnits || [])
        ];

        return allUnitsWithUnassigned.map(u => ({
            id: u.id,
            tooltip: u.identification.fullAddress,
            type: 'unit'
        }));
    }

    static getBuildingsForIcons(data) {
        return data.buildings.map(b => ({
            id: b.id,
            tooltip: b.name,
            type: 'building'
        }));
    }

    static applySearchFilter(data, searchTerm) {
        if (!searchTerm || searchTerm.length < APP_CONFIG.SEARCH.MIN_SEARCH_LENGTH) {
            return data;
        }

        const normalizedSearch = searchTerm.toLowerCase();
        
        return data.filter(item => {
            // Search in all string values
            const stringValues = JSON.stringify(item).toLowerCase();
            return stringValues.includes(normalizedSearch);
        });
    }

    static applySorting(data, sortConfig) {
        if (!sortConfig) return data;

        const { key, direction } = sortConfig;
        const dir = direction === 'ascending' ? 1 : -1;

        return [...data].sort((a, b) => {
            const valA = DataService.getNestedValue(a, key);
            const valB = DataService.getNestedValue(b, key);

            if (valA == null) return 1 * dir;
            if (valB == null) return -1 * dir;

            if (typeof valA === 'string') {
                return valA.localeCompare(valB, 'he') * dir;
            }
            if (typeof valA === 'number') {
                return (valA - valB) * dir;
            }
            
            return 0;
        });
    }

    static getNestedValue(obj, path) {
        if (!path || !obj) return undefined;
        return path.split('.').reduce((o, key) => (o && o[key] !== undefined) ? o[key] : undefined, obj);
    }

    static mergeImportedData(data, importedData, focusLevel) {
        // Implementation for merging imported data based on focus level
        // This would handle different merge strategies for owners, units, buildings, etc.
        console.log('Merging imported data for level:', focusLevel, 'with count:', importedData.length);
        return data;
    }

    static createOwnerData(subplot, options = {}) {
        const defaultData = {
            name: 'בעלים חדש',
            idNumber: `00000000${Math.floor(Math.random() * 10)}`.slice(-9),
            ownerType: 'private',
            address: 'כתובת טרם הוזנה',
            legalSignatures: { 
                contract: 'X', 
                po_tax: 'X', 
                po_general: 'X', 
                IBAmatch: 'pending' 
            },
            financialDocs: { 
                id_card: 'missing', 
                rights_approval: 'missing', 
                mortgage_report: 'na', 
                liens: 'unknown' 
            },
            contact: { 
                phone: `052-${Math.floor(1000000 + Math.random() * 9000000)}`, 
                email: 'new@email.com', 
                preferredContactMethod: 'phone' 
            },
            socio: { 
                profile: 'גר בדירה', 
                age: 50, 
                housingOwenershipStatus: 'self_owned', 
                maritalStatus: 'married', 
                debtLevel: 'no_debt', 
                satisfaction: 'satisfied' 
            },
            communicationLog: { 
                lastContact: new Date().toISOString().split('T')[0], 
                summary: 'נוצר קשר ראשוני' 
            },
            legalHistory: { hasHistory: false, details: '' },
            sellingStatus: 'not-selling',
            buyingStatus: 'not-buying',
            hasActiveDispute: false,
            requiredDocuments: {
                contract: { status: 'pending', dateRequired: '2025-12-31', notes: 'הסכם' },
                powerOfAttorney: { status: 'pending', dateRequired: '2025-12-31', notes: 'יפוי כוח' },
            },
            notifications: []
        };

        return {
            id: `O${Date.now()}${Math.floor(Math.random() * 1000)}`,
            subplot,
            ...defaultData,
            ...options
        };
    }
}

// Activity Log Service
export class ActivityService {
    static activityLog = [];

    static logActivity(action, focusLevel, itemId, details = {}, user = 'User') {
        ActivityService.activityLog.unshift({
            id: Date.now(),
            timestamp: new Date(),
            action,
            focusLevel,
            itemId,
            user,
            ...details
        });

        // Keep only last 100 entries
        if (ActivityService.activityLog.length > 100) {
            ActivityService.activityLog.pop();
        }
    }

    static getActivityLog() {
        return ActivityService.activityLog;
    }

    static clearActivityLog() {
        ActivityService.activityLog = [];
    }
}

// Performance Monitoring Service
export class PerformanceService {
    static metrics = {};

    static startMetric(name) {
        PerformanceService.metrics[name] = {
            start: performance.now(),
            count: 0
        };
    }

    static endMetric(name) {
        if (PerformanceService.metrics[name]) {
            const duration = performance.now() - PerformanceService.metrics[name].start;
            PerformanceService.metrics[name].count++;
            PerformanceService.metrics[name].total = (PerformanceService.metrics[name].total || 0) + duration;
            PerformanceService.metrics[name].last = duration;
            
            if (APP_CONFIG.PERFORMANCE.ENABLE_PERFORMANCE_MONITORING) {
                console.log(`${name}: ${duration.toFixed(2)}ms`);
            }
        }
    }

    static getMetrics() {
        return PerformanceService.metrics;
    }

    static clearMetrics() {
        PerformanceService.metrics = {};
    }
}