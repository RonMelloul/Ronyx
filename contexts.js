import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { APP_CONFIG } from './constants';
import { ActivityService } from './services';

// Notification Context
const NotificationContext = createContext();

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = React.useState([]);

    const addNotification = useCallback((message, type = 'info', duration = APP_CONFIG.NOTIFICATIONS.AUTO_HIDE_DELAY) => {
        const id = Date.now();
        const notification = {
            id,
            message,
            type,
            timestamp: new Date()
        };

        setNotifications(prev => {
            const updated = [...prev, notification];
            // Limit number of notifications
            return updated.slice(-APP_CONFIG.NOTIFICATIONS.MAX_NOTIFICATIONS);
        });

        // Auto remove notification
        if (duration > 0) {
            setTimeout(() => {
                removeNotification(id);
            }, duration);
        }

        return id;
    }, []);

    const removeNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const clearAllNotifications = useCallback(() => {
        setNotifications([]);
    }, []);

    return (
        <NotificationContext.Provider value={{
            notifications,
            addNotification,
            removeNotification,
            clearAllNotifications
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

// Data Context for centralized state management
const DataContext = createContext();

export const useDataContext = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useDataContext must be used within a DataProvider');
    }
    return context;
};

// Action types for data reducer
const DataActionTypes = {
    UPDATE_DATA: 'UPDATE_DATA',
    ADD_ROW: 'ADD_ROW',
    DELETE_ROW: 'DELETE_ROW',
    BULK_UPDATE: 'BULK_UPDATE',
    RESET_DATA: 'RESET_DATA'
};

// Data reducer for state management
const dataReducer = (state, action) => {
    switch (action.type) {
        case DataActionTypes.UPDATE_DATA:
            return {
                ...state,
                ...action.payload
            };

        case DataActionTypes.ADD_ROW:
            const { level, newItem } = action.payload;
            return DataReducerHelpers.addRow(state, level, newItem);

        case DataActionTypes.DELETE_ROW:
            const { level: deleteLevel, item } = action.payload;
            return DataReducerHelpers.deleteRow(state, deleteLevel, item);

        case DataActionTypes.BULK_UPDATE:
            return DataReducerHelpers.bulkUpdate(state, action.payload);

        case DataActionTypes.RESET_DATA:
            return action.payload;

        default:
            return state;
    }
};

// Helper functions for data reducer
const DataReducerHelpers = {
    addRow(state, level, newItem) {
        const newState = { ...state };
        
        switch (level) {
            case 'owner':
                if (!newState.unassignedOwners) newState.unassignedOwners = [];
                newState.unassignedOwners.push(newItem);
                break;
                
            case 'unit':
                if (!newState.unassignedUnits) newState.unassignedUnits = [];
                newState.unassignedUnits.push(newItem);
                break;
                
            case 'building':
                newState.buildings.push(newItem);
                break;
                
            case 'project':
                // For project level, update the main data
                Object.assign(newState, newItem);
                break;
        }
        
        return newState;
    },

    deleteRow(state, level, item) {
        const newState = { ...state };
        
        switch (level) {
            case 'owner':
                // Remove from buildings
                newState.buildings = newState.buildings.map(building => ({
                    ...building,
                    units: building.units.map(unit => ({
                        ...unit,
                        owners: unit.owners.filter(owner => owner.id !== item.id)
                    }))
                }));
                
                // Remove from unassigned owners
                if (newState.unassignedOwners) {
                    newState.unassignedOwners = newState.unassignedOwners.filter(owner => owner.id !== item.id);
                }
                break;
                
            case 'unit':
                // Remove from buildings
                newState.buildings = newState.buildings.map(building => ({
                    ...building,
                    units: building.units.filter(unit => unit.id !== item.id)
                }));
                
                // Remove from unassigned units
                if (newState.unassignedUnits) {
                    newState.unassignedUnits = newState.unassignedUnits.filter(unit => unit.id !== item.id);
                }
                break;
                
            case 'building':
                const buildingIndex = newState.buildings.findIndex(b => b.id === item.id);
                if (buildingIndex > -1) {
                    const [removedBuilding] = newState.buildings.splice(buildingIndex, 1);
                    
                    // Move units from deleted building to unassigned
                    if (!newState.unassignedUnits) newState.unassignedUnits = [];
                    newState.unassignedUnits.push(...removedBuilding.units);
                }
                break;
        }
        
        return newState;
    },

    bulkUpdate(state, updates) {
        return { ...state, ...updates };
    }
};

export const DataProvider = ({ children, initialData }) => {
    const [data, dispatch] = useReducer(dataReducer, initialData);

    // Update data function
    const updateData = useCallback((updates) => {
        dispatch({
            type: DataActionTypes.UPDATE_DATA,
            payload: updates
        });
        
        // Log activity
        ActivityService.logActivity('updated', 'project', 'project', {
            fieldChanged: 'multiple',
            changes: Object.keys(updates)
        });
    }, []);

    // Add row function
    const addRow = useCallback((level, customData = {}) => {
        const newItem = createNewItem(level, customData);
        
        dispatch({
            type: DataActionTypes.ADD_ROW,
            payload: { level, newItem }
        });
        
        // Log activity
        ActivityService.logActivity('created', level, newItem.id, {
            itemName: newItem.name || newItem.id
        });
        
        return newItem;
    }, []);

    // Delete row function
    const deleteRow = useCallback((item, level) => {
        dispatch({
            type: DataActionTypes.DELETE_ROW,
            payload: { level, item }
        });
        
        // Log activity
        ActivityService.logActivity('deleted', level, item.name || item.id, {
            itemId: item.id
        });
    }, []);

    // Bulk update function
    const bulkUpdate = useCallback((updates) => {
        dispatch({
            type: DataActionTypes.BULK_UPDATE,
            payload: updates
        });
        
        // Log activity
        ActivityService.logActivity('bulk_updated', 'project', 'project', {
            changes: Object.keys(updates)
        });
    }, []);

    // Reset data function
    const resetData = useCallback((newData) => {
        dispatch({
            type: DataActionTypes.RESET_DATA,
            payload: newData
        });
        
        ActivityService.logActivity('reset', 'project', 'project');
    }, []);

    // Create new item based on level
    const createNewItem = (level, customData = {}) => {
        const timestamp = Date.now();
        const randomSuffix = Math.floor(Math.random() * 1000);

        switch (level) {
            case 'owner':
                return {
                    id: `O${timestamp}${randomSuffix}`,
                    name: customData.name || "בעלים חדש",
                    idNumber: customData.idNumber || `00000000${Math.floor(Math.random() * 10)}`.slice(-9),
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
                    legalHistory: {
                        hasHistory: false,
                        details: ''
                    },
                    sellingStatus: 'not-selling',
                    buyingStatus: 'not-buying',
                    hasActiveDispute: false,
                    requiredDocuments: {
                        contract: {
                            status: 'pending',
                            dateRequired: '2025-12-31',
                            notes: 'הסכם'
                        },
                        powerOfAttorney: {
                            status: 'pending',
                            dateRequired: '2025-12-31',
                            notes: 'יפוי כוח'
                        }
                    },
                    notifications: [],
                    ...customData
                };

            case 'unit':
                // Get next available subplot number
                const allSubplots = [
                    ...data.buildings.flatMap(b => b.units.map(u => u.subplot)),
                    ...(data.unassignedUnits || []).map(u => u.subplot)
                ];
                const maxSubplot = Math.max(0, ...allSubplots.filter(s => s));

                return {
                    id: `U${timestamp}${randomSuffix}`,
                    subplot: customData.subplot || maxSubplot + 1,
                    propertyType: 'דירת מגורים',
                    identification: {
                        fullAddress: customData.identification?.fullAddress || `יחידה חדשה ${maxSubplot + 1}`,
                        block: customData.identification?.block || '',
                        parcel: customData.identification?.parcel || '',
                        subParcel: customData.identification?.subParcel || ''
                    },
                    physical: {
                        areaSqM_gross: 0,
                        areaSqM_net: 0,
                        numRooms: 0,
                        floor: 0,
                        propertyCondition: 'טוב',
                        hasBuildingViolations: false,
                        parking: {
                            exists: false,
                            count: 0,
                            type: ''
                        },
                        storage: {
                            exists: false,
                            areaSqM: null
                        },
                        balcony: {
                            exists: false,
                            areaSqM: null
                        },
                        garden: {
                            exists: false
                        },
                        attachedRoof: {
                            exists: false
                        },
                        ...customData.physical
                    },
                    legal: {
                        commonPropertyPercentage: 0,
                        registeredOwnership: 'בעלות מלאה',
                        warningNotes: '',
                        liens: 'נקי',
                        ...customData.legal
                    },
                    status: {
                        currentResidentStatus: 'owner',
                        evacuationDate: '',
                        compensationAgreementStatus: 'pending',
                        ...customData.status
                    },
                    requiredDocuments: {
                        tabuExtract: {
                            status: 'missing',
                            notes: '',
                            date: null
                        },
                        leaseContract: {
                            status: 'na',
                            notes: '',
                            date: null
                        },
                        buildingPermit: {
                            status: 'missing',
                            notes: '',
                            date: null
                        },
                        ...customData.requiredDocuments
                    },
                    owners: [],
                    ...customData
                };

            case 'building':
                return {
                    id: `B${timestamp}${randomSuffix}`,
                    name: customData.name || `בניין חדש ${data.buildings.length + 1}`,
                    buildingNumber: customData.buildingNumber || `B${data.buildings.length + 1}`,
                    gush: customData.gush || '00000',
                    helka: customData.helka || '000',
                    buildingType: 'מגורים',
                    constructionStatus: 'not-started',
                    physicalCharacteristics: {
                        age: 0,
                        numFloors: 0,
                        numEntrances: 1,
                        ...customData.physicalCharacteristics
                    },
                    condominiumInfo: {
                        expectedUnits: 0,
                        actualUnits: 0,
                        votingSplit: 'לפי חלוקה שווה',
                        commonPropertyAreas: '',
                        activeResidentsCommittee: {
                            exists: false,
                            members: []
                        },
                        ...customData.condominiumInfo
                    },
                    units: [],
                    ...customData
                };

            default:
                throw new Error(`Unknown level: ${level}`);
        }
    };

    // Auto-save to localStorage (optional)
    useEffect(() => {
        const autoSave = setTimeout(() => {
            localStorage.setItem('projectData', JSON.stringify(data));
        }, 2000); // Save after 2 seconds of inactivity

        return () => clearTimeout(autoSave);
    }, [data]);

    return (
        <DataContext.Provider value={{
            data,
            updateData,
            addRow,
            deleteRow,
            bulkUpdate,
            resetData,
            createNewItem
        }}>
            {children}
        </DataContext.Provider>
    );
};

// Performance Monitoring Context
const PerformanceContext = createContext();

export const usePerformance = () => {
    const context = useContext(PerformanceContext);
    if (!context) {
        throw new Error('usePerformance must be used within a PerformanceProvider');
    }
    return context;
};

export const PerformanceProvider = ({ children }) => {
    const [metrics, setMetrics] = React.useState({
        renderCount: 0,
        memoryUsage: null,
        lastRenderTime: 0,
        componentMounts: 0
    });

    const trackRender = useCallback((componentName) => {
        setMetrics(prev => ({
            ...prev,
            renderCount: prev.renderCount + 1,
            lastRenderTime: performance.now()
        }));
    }, []);

    const trackMount = useCallback((componentName) => {
        setMetrics(prev => ({
            ...prev,
            componentMounts: prev.componentMounts + 1
        }));
    }, []);

    const updateMemoryUsage = useCallback((memoryInfo) => {
        setMetrics(prev => ({
            ...prev,
            memoryUsage: memoryInfo
        }));
    }, []);

    return (
        <PerformanceContext.Provider value={{
            metrics,
            trackRender,
            trackMount,
            updateMemoryUsage
        }}>
            {children}
        </PerformanceContext.Provider>
    );
};

// Theme Context for consistent theme management
const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = React.useState(() => {
        const saved = localStorage.getItem('theme');
        if (saved) return saved;
        
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });

    useEffect(() => {
        localStorage.setItem('theme', theme);
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }, [theme]);

    const toggleTheme = useCallback(() => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    }, []);

    const setLightTheme = useCallback(() => setTheme('light'), []);
    const setDarkTheme = useCallback(() => setTheme('dark'), []);

    return (
        <ThemeContext.Provider value={{
            theme,
            setTheme,
            toggleTheme,
            setLightTheme,
            setDarkTheme,
            isDark: theme === 'dark'
        }}>
            {children}
        </ThemeContext.Provider>
    );
};