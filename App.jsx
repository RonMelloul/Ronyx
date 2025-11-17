import React, { useState, useMemo, useEffect, useRef, useCallback, Suspense, lazy } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

// Constants and configurations
import { ICONS, STATUS_MAP, COLUMN_CONFIGS } from './constants';
import { PROJECT_DATA } from './data';
import { SpecialMajorityCalculator } from './calculators';
import { useLocalStorage, useDebounce, useIntersectionObserver } from './hooks';
import { CSVService, DataService, ThemeService } from './services';
import { NotificationProvider, useNotification } from './contexts/NotificationContext';
import { DataProvider } from './contexts/DataContext';

// Lazy load heavy components
const DataTable = lazy(() => import('./components/DataTable'));
const DetailModal = lazy(() => import('./components/DetailModal'));
const StrategicDashboardModal = lazy(() => import('./components/StrategicDashboardModal'));
const LoadingSpinner = lazy(() => import('./components/LoadingSpinner'));

// Main App Component with Error Boundary
function App() {
    return (
        <ErrorBoundary
            FallbackComponent={ErrorFallback}
            onError={(error, errorInfo) => {
                console.error('Application Error:', error, errorInfo);
                // Log to monitoring service
            }}
        >
            <NotificationProvider>
                <DataProvider initialData={PROJECT_DATA}>
                    <AppContent />
                </DataProvider>
            </NotificationProvider>
        </ErrorBoundary>
    );
}

// Error Fallback Component
function ErrorFallback({ error, resetErrorBoundary }) {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4" dir="rtl">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 max-w-md w-full text-center">
                <div className="text-red-500 text-6xl mb-4">⚠️</div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                    אירעה שגיאה במערכת
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                    המערכת נתקלה בבעיה. אנא נסה שוב או רענן את הדף.
                </p>
                <div className="space-y-2">
                    <button
                        onClick={resetErrorBoundary}
                        className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        נסה שוב
                    </button>
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                    >
                        רענן דף
                    </button>
                </div>
            </div>
        </div>
    );
}

// Main App Content Component
function AppContent() {
    // Core state management with optimized patterns
    const [focusLevel, setFocusLevel] = useLocalStorage('focusLevel', 'owner');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState(null);
    const [theme, setTheme] = useLocalStorage('theme', 
        window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    );

    // UI state
    const [showColumnManager, setShowColumnManager] = useState(false);
    const [showStrategyDashboard, setShowStrategyDashboard] = useState(false);
    const [showActivityLog, setShowActivityLog] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedItemType, setSelectedItemType] = useState(null);

    // Performance optimization states
    const [pageSize, setPageSize] = useLocalStorage('pageSize', 100);
    const [currentPage, setCurrentPage] = useState(1);
    const [virtualScrollEnabled, setVirtualScrollEnabled] = useState(true);

    // Hooks for optimization
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const { addNotification } = useNotification();
    const { data, updateData, addRow, deleteRow } = useDataContext();

    // Intersection Observer for lazy loading
    const tableRef = useRef(null);
    const isVisible = useIntersectionObserver(tableRef, { threshold: 0.1 });

    // Theme management
    useEffect(() => {
        ThemeService.applyTheme(theme);
    }, [theme]);

    const toggleTheme = useCallback(() => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    }, [setTheme]);

    // Optimized data computations with memoization
    const computedData = useMemo(() => {
        return {
            owners: DataService.getAllOwnersWithContext(data),
            units: DataService.getAllUnitsWithContext(data),
            buildings: DataService.getAllBuildingsWithContext(data),
            project: DataService.getProjectWithContext(data)
        };
    }, [data]);

    const currentTableData = useMemo(() => {
        switch (focusLevel) {
            case 'owner': return computedData.owners;
            case 'unit': return computedData.units;
            case 'building': return computedData.buildings;
            case 'project': return computedData.project;
            default: return [];
        }
    }, [focusLevel, computedData]);

    // Optimized filtering and sorting with virtual scrolling support
    const processedData = useMemo(() => {
        let processed = [...currentTableData];

        // Apply search filter
        if (debouncedSearchTerm) {
            processed = DataService.applySearchFilter(processed, debouncedSearchTerm);
        }

        // Apply sorting
        if (sortConfig) {
            processed = DataService.applySorting(processed, sortConfig);
        }

        return processed;
    }, [currentTableData, debouncedSearchTerm, sortConfig]);

    // Virtual scrolling data
    const virtualData = useMemo(() => {
        if (!virtualScrollEnabled || processedData.length <= pageSize) {
            return {
                visibleData: processedData,
                totalCount: processedData.length,
                startIndex: 0,
                endIndex: processedData.length
            };
        }

        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize, processedData.length);

        return {
            visibleData: processedData.slice(startIndex, endIndex),
            totalCount: processedData.length,
            startIndex,
            endIndex
        };
    }, [processedData, currentPage, pageSize, virtualScrollEnabled]);

    // Optimized handlers with proper debouncing
    const handleSort = useCallback((key, type) => {
        let direction = 'ascending';
        if (sortConfig?.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction, type });
        setCurrentPage(1); // Reset to first page when sorting
    }, [sortConfig]);

    const handleAddRow = useCallback(() => {
        const newItem = addRow(focusLevel);
        addNotification(`נוסף פריט חדש: ${newItem.name || newItem.id}`);
    }, [focusLevel, addRow, addNotification]);

    const handleDeleteRow = useCallback((item, level) => {
        deleteRow(item, level);
        addNotification(`נמחק פריט: ${item.name || item.id}`);
    }, [deleteRow, addNotification]);

    const handleExport = useCallback(() => {
        const csvData = CSVService.exportToCsv(processedData);
        CSVService.downloadCsv(csvData, `${focusLevel}_data.csv`);
        addNotification('הנתונים יוצאו בהצלחה');
    }, [processedData, focusLevel, addNotification]);

    const handleImport = useCallback((event) => {
        const file = event.target.files[0];
        if (!file) return;

        CSVService.importFromCsv(file)
            .then(importedData => {
                DataService.mergeImportedData(data, importedData, focusLevel);
                addNotification('ייבוא הנתונים הושלם בהצלחה');
            })
            .catch(error => {
                console.error('Import error:', error);
                addNotification('שגיאה בייבוא הנתונים');
            });
    }, [data, focusLevel, addNotification]);

    // Performance monitoring
    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            console.log('App Performance:', {
                dataSize: Object.keys(data).length,
                processedDataSize: processedData.length,
                renderTime: performance.now()
            });
        }
    }, [data, processedData.length]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans text-right transition-colors duration-500" dir="rtl">
            <Suspense fallback={<LoadingSpinner />}>
                <DetailModal
                    item={selectedItem}
                    itemType={selectedItemType}
                    onClose={() => setSelectedItem(null)}
                    onUpdate={updateData}
                />
                
                <StrategicDashboardModal
                    isOpen={showStrategyDashboard}
                    onClose={() => setShowStrategyDashboard(false)}
                    data={data}
                    onApplyChanges={updateData}
                    allOwners={computedData.owners}
                    addNotification={addNotification}
                />
            </Suspense>

            <div className="mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <Header 
                    theme={theme}
                    toggleTheme={toggleTheme}
                    showActivityLog={showActivityLog}
                    setShowActivityLog={setShowActivityLog}
                />

                <FocusNavigation 
                    focusLevel={focusLevel} 
                    setFocusLevel={setFocusLevel} 
                />

                <main className="space-y-8">
                    <SummaryCards data={data} computedData={computedData} />
                    
                    <StrategicDashboard 
                        onOpen={() => setShowStrategyDashboard(true)}
                    />

                    <SearchAndFilters
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        onShowColumnManager={() => setShowColumnManager(true)}
                        onExport={handleExport}
                        onImport={handleImport}
                        pageSize={pageSize}
                        setPageSize={setPageSize}
                        virtualScrollEnabled={virtualScrollEnabled}
                        setVirtualScrollEnabled={setVirtualScrollEnabled}
                    />

                    <div ref={tableRef}>
                        <Suspense fallback={<LoadingSpinner />}>
                            <DataTable
                                focusLevel={focusLevel}
                                data={virtualData.visibleData}
                                totalCount={virtualData.totalCount}
                                headerConfig={COLUMN_CONFIGS[focusLevel]}
                                sortConfig={sortConfig}
                                onSort={handleSort}
                                onRowClick={setSelectedItem}
                                onRowType={setSelectedItemType}
                                onUpdate={updateData}
                                onDelete={handleDeleteRow}
                                pageSize={pageSize}
                                currentPage={currentPage}
                                onPageChange={setCurrentPage}
                                virtualScrollEnabled={virtualScrollEnabled && isVisible}
                            />
                        </Suspense>
                    </div>
                </main>

                <QuickActions 
                    onAddRow={handleAddRow}
                    onShowStrategyDashboard={() => setShowStrategyDashboard(true)}
                />
            </div>
        </div>
    );
}

// Separate components for better organization
function Header({ theme, toggleTheme, showActivityLog, setShowActivityLog }) {
    const ThemeToggle = useCallback(() => (
        <button
            onClick={toggleTheme}
            className="p-2.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title={theme === 'light' ? 'עבור למצב כהה' : 'עבור למצב בהיר'}
        >
            <Icon path={theme === 'light' ? ICONS.moon : ICONS.sun} className="w-5 h-5" />
        </button>
    ), [theme, toggleTheme]);

    return (
        <header className="relative text-center mb-8">
            <div className="absolute top-0 right-0 flex gap-2">
                <button
                    onClick={() => setShowActivityLog(!showActivityLog)}
                    className="p-2.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    title="יומן פעילות"
                >
                    <Icon path={ICONS.history} className="w-5 h-5" />
                </button>
                <ThemeToggle />
            </div>
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 tracking-tight">
                מערכת ניהול פרויקטים
            </h1>
            <p className="mt-3 text-lg text-slate-600 dark:text-slate-300">
                ניהול מתקדם לפרויקטי התחדשות עירונית
            </p>
        </header>
    );
}

// Optimized Summary Cards with virtualization
function SummaryCards({ data, computedData }) {
    const kpis = useMemo(() => ({
        totalOwners: DataService.getTotalOwnersCount(data),
        totalUnits: DataService.getTotalUnitsCount(data),
        totalBuildings: data.buildings.length,
        projectName: data.projectName,
        owners: DataService.getOwnersForIcons(data),
        units: DataService.getUnitsForIcons(data),
        buildings: DataService.getBuildingsForIcons(data)
    }), [data]);

    const cards = useMemo(() => [
        {
            label: "בעלי זכויות",
            value: kpis.totalOwners,
            items: kpis.owners,
            iconPath: ICONS.users,
            iconColorClass: { bg: 'bg-blue-100 dark:bg-blue-900/50', text: 'text-blue-600 dark:text-blue-400' },
            type: "owner"
        },
        {
            label: "יחידות",
            value: kpis.totalUnits,
            items: kpis.units,
            iconPath: ICONS.unit,
            iconColorClass: { bg: 'bg-yellow-100 dark:bg-yellow-900/50', text: 'text-yellow-600 dark:text-yellow-400' },
            type: "unit"
        },
        {
            label: "בניינים",
            value: kpis.totalBuildings,
            items: kpis.buildings,
            iconPath: ICONS.building,
            iconColorClass: { bg: 'bg-green-100 dark:bg-green-900/50', text: 'text-green-600 dark:text-green-400' },
            type: "building"
        },
        {
            label: "שם פרויקט",
            value: data.projectName,
            iconPath: ICONS.project,
            iconColorClass: { bg: 'bg-indigo-100 dark:bg-indigo-900/50', text: 'text-indigo-600 dark:text-indigo-400' }
        }
    ], [kpis, data.projectName]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((card, index) => (
                <SummaryCard key={index} {...card} />
            ))}
        </div>
    );
}

// Memoized Summary Card Component
const SummaryCard = React.memo(({ label, value, items = [], iconPath, iconColorClass, type }) => {
    const getVisualRepresentation = useMemo(() => {
        if (!items || items.length === 0) return null;

        const getStatusColor = (status) => {
            const statusColors = {
                signed: 'bg-green-200 dark:bg-green-800/50',
                pending: 'bg-yellow-200 dark:bg-yellow-800/50',
                rejected: 'bg-red-200 dark:bg-red-800/50'
            };
            return statusColors[status] || iconColorClass.bg;
        };

        return (
            <div className="mt-4 flex-grow">
                <div className="flex flex-wrap gap-1 items-end h-full max-h-16 overflow-hidden">
                    {items.slice(0, 20).map((item, index) => (
                        <div
                            key={item.id || index}
                            className={`w-3 h-3 rounded-full ${getStatusColor(item.status)} border border-slate-300 dark:border-slate-600 cursor-pointer hover:scale-110 transition-transform duration-200`}
                            title={item.tooltip}
                        />
                    ))}
                    {items.length > 20 && (
                        <div className="text-xs text-slate-500 dark:text-slate-400 px-1">
                            +{items.length - 20}
                        </div>
                    )}
                </div>
            </div>
        );
    }, [items, iconColorClass.bg]);

    return (
        <div className="bg-white/70 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/60 rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-lg hover:scale-105">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{label}</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1">{value}</p>
                </div>
                <div className={`p-3 rounded-lg ${iconColorClass.bg}`}>
                    <Icon path={iconPath} className={`w-6 h-6 ${iconColorClass.text}`} />
                </div>
            </div>
            {getVisualRepresentation}
        </div>
    );
});

// Strategic Dashboard Component
function StrategicDashboard({ onOpen }) {
    return (
        <div className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/60 rounded-xl shadow-md p-6 text-center">
            <Icon path={ICONS.strategy} className="w-12 h-12 mx-auto text-indigo-500" />
            <h3 className="mt-2 text-xl font-bold text-slate-800 dark:text-slate-200">
                מרכז התכנון האסטרטגי
            </h3>
            <p className="mt-1 text-slate-600 dark:text-slate-400">
                נתח תרחישי רוב מיוחס, בצע שיוכים וקבל החלטות מבוססות נתונים במקום אחד.
            </p>
            <button 
                onClick={onOpen}
                className="mt-4 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
                פתח את סדנת התכנון
            </button>
        </div>
    );
}

// Icon Component with performance optimization
const Icon = React.memo(({ path, className = "w-4 h-4 transition-transform duration-200 hover:scale-110", ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
));

export default App;