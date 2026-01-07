import React, { useMemo, useCallback, useRef, useEffect, memo } from 'react';
import { ICONS, STATUS_MAP } from '../constants';
import { useVirtualScroll, useKeyboardNavigation } from '../hooks';

// Memoized Icon Component
const Icon = memo(({ path, className = "w-4 h-4 transition-transform duration-200 hover:scale-110", ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
));

// Memoized Cell Components
const StatusCell = memo(({ status, textOverride, editable = false, onEdit = null, tooltip = '' }) => {
    const currentStatus = STATUS_MAP[status] || { 
        text: status, 
        color: "bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-slate-200" 
    };

    if (editable && onEdit) {
        return (
            <td className="px-3 py-2 text-sm whitespace-nowrap" title={tooltip}>
                <button
                    onClick={onEdit}
                    className={`inline-flex items-center justify-center gap-1.5 w-full min-w-[90px] px-2 py-1.5 rounded-md font-semibold text-xs ${currentStatus.color} hover:ring-2 hover:ring-blue-500 dark:hover:ring-sky-400 cursor-pointer transition-all duration-200 hover:shadow-md`}
                >
                    {currentStatus.icon && <Icon path={currentStatus.icon} className="w-3.5 h-3.5" />}
                    <span className="truncate">{textOverride || currentStatus.text}</span>
                    <Icon path={ICONS.edit} className="w-3 h-3 opacity-60" />
                </button>
            </td>
        );
    }

    return (
        <td className="px-3 py-2 text-sm whitespace-nowrap" title={tooltip}>
            <span className={`inline-flex items-center justify-center gap-1.5 w-full min-w-[90px] px-2 py-1.5 rounded-md font-semibold text-xs ${currentStatus.color} transition-all duration-200`}>
                {currentStatus.icon && <Icon path={currentStatus.icon} className="w-3.5 h-3.5" />}
                <span className="truncate">{textOverride || currentStatus.text}</span>
            </span>
        </td>
    );
});

const ProgressBarCell = memo(({ value }) => (
    <td className="px-4 py-2.5 text-sm whitespace-nowrap">
        <div className="flex items-center gap-2">
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                <div 
                    className="bg-gradient-to-r from-blue-500 to-sky-400 h-2 rounded-full transition-all duration-500 ease-out" 
                    style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
                ></div>
            </div>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 w-8 text-left">
                {Math.round(value)}%
            </span>
        </div>
    </td>
));

const DateCell = memo(({ date }) => {
    const formattedDate = useMemo(() => {
        if (!date) return '-';
        try {
            return new Date(date).toLocaleDateString('he-IL');
        } catch {
            return '-';
        }
    }, [date]);

    return (
        <td className="px-4 py-2.5 text-sm text-slate-600 dark:text-slate-400 font-mono whitespace-nowrap">
            {formattedDate}
        </td>
    );
});

const TextCell = memo(({ text, className = '' }) => (
    <td className={`px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 font-medium whitespace-nowrap ${className}`}>
        {text || '-'}
    </td>
));

// Optimized DataTable Component
const DataTable = memo(({
    focusLevel,
    data: tableData,
    totalCount,
    headerConfig,
    sortConfig,
    onSort,
    onRowClick,
    onRowType,
    onUpdate,
    onDelete,
    pageSize,
    currentPage,
    onPageChange,
    virtualScrollEnabled = false
}) => {
    const tableRef = useRef(null);
    const containerRef = useRef(null);

    // Virtual scrolling setup
    const itemHeight = 50; // Approximate row height
    const containerHeight = 600; // Fixed container height
    
    const {
        visibleData,
        totalHeight,
        offsetY,
        visibleRange,
        scrollToIndex,
        setScrollTop
    } = useVirtualScroll(tableData, itemHeight, containerHeight);

    // Navigation between pages
    const handlePageChange = useCallback((newPage) => {
        onPageChange(newPage);
        if (tableRef.current) {
            tableRef.current.scrollTop = 0;
        }
    }, [onPageChange]);

    // Sort handler
    const handleSort = useCallback((key, type) => {
        onSort(key, type);
        handlePageChange(1); // Reset to first page
    }, [onSort, handlePageChange]);

    // Get sort icon
    const getSortIcon = useCallback((key) => {
        if (!sortConfig || sortConfig.key !== key) return ICONS.sort;
        return sortConfig.direction === 'ascending' ? ICONS.sortAsc : ICONS.sortDesc;
    }, [sortConfig]);

    // Get displayed data (either virtual or paginated)
    const displayData = useMemo(() => {
        if (virtualScrollEnabled && tableData.length > APP_CONFIG.VIRTUAL_SCROLL.THRESHOLD) {
            return visibleData;
        } else {
            const startIndex = (currentPage - 1) * pageSize;
            const endIndex = startIndex + pageSize;
            return tableData.slice(startIndex, endIndex);
        }
    }, [tableData, visibleData, currentPage, pageSize, virtualScrollEnabled]);

    // Calculate pagination info
    const paginationInfo = useMemo(() => {
        if (virtualScrollEnabled) return null;
        
        const totalPages = Math.ceil(totalCount / pageSize);
        return {
            totalPages,
            startItem: Math.min((currentPage - 1) * pageSize + 1, totalCount),
            endItem: Math.min(currentPage * pageSize, totalCount)
        };
    }, [totalCount, pageSize, currentPage, virtualScrollEnabled]);

    // Keyboard navigation
    const { handleKeyDown: handleTableKeyDown } = useKeyboardNavigation(
        displayData,
        (item, index) => {
            if (item) {
                onRowClick(item);
                onRowType(focusLevel);
            }
        }
    );

    // Table keydown handler
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'PageDown' || e.key === 'PageUp') {
            e.preventDefault();
            const direction = e.key === 'PageDown' ? 1 : -1;
            const newPage = Math.max(1, Math.min(paginationInfo.totalPages, currentPage + direction));
            handlePageChange(newPage);
        }
    }, [currentPage, paginationInfo, handlePageChange]);

    // Update scroll handler
    const handleScroll = useCallback((e) => {
        if (virtualScrollEnabled) {
            setScrollTop(e.target.scrollTop);
        }
    }, [virtualScrollEnabled, setScrollTop]);

    // Helper function to get nested value
    const getNestedValue = useCallback((obj, path) => {
        if (!path || !obj) return undefined;
        return path.split('.').reduce((o, key) => (o && o[key] !== undefined) ? o[key] : undefined, obj);
    }, []);

    // Render table body with performance optimizations
    const renderTableBody = useMemo(() => {
        return displayData.map((item, index) => {
            const rowKey = item.id || `${item.idNumber || item.name || 'item'}-${index}`;
            
            return (
                <tr 
                    key={rowKey} 
                    className="hover:bg-sky-50/50 dark:hover:bg-slate-700/50 transition-colors duration-200 select-none"
                    onClick={() => {
                        onRowClick(item);
                        onRowType(focusLevel);
                    }}
                    onKeyDown={handleTableKeyDown}
                    tabIndex={0}
                    role="row"
                >
                    {/* Sticky name column */}
                    <td
                        className="sticky right-0 bg-white/70 dark:bg-slate-800/80 px-4 py-2.5 font-semibold text-blue-700 dark:text-sky-400 hover:underline cursor-pointer border-l-2 border-slate-400 dark:border-slate-600 z-10"
                    >
                        {item.name || item.identification?.fullAddress || `פריט ${item.subplot || index + 1}`}
                    </td>

                    {/* Render columns based on header config */}
                    {headerConfig?.[0]?.columns?.filter(col => col.visible).map((col) => {
                        const value = getNestedValue(item, col.key);

                        if (col.type === 'status') {
                            return (
                                <StatusCell
                                    key={col.key}
                                    status={value}
                                    editable={col.editable}
                                    onEdit={col.editable ? () => {
                                        // Status cycling logic
                                        const statusCycle = ['V', 'X', 'pending', 'signed', 'missing'];
                                        const currentIndex = statusCycle.indexOf(value) || 0;
                                        const newValue = statusCycle[(currentIndex + 1) % statusCycle.length];
                                        onUpdate(item, col.key, newValue, focusLevel);
                                    } : null}
                                    tooltip={col.label}
                                />
                            );
                        }

                        if (col.type === 'progress') {
                            return <ProgressBarCell key={col.key} value={value || 0} />;
                        }

                        if (col.type === 'date') {
                            return <DateCell key={col.key} date={value} />;
                        }

                        return <TextCell key={col.key} text={value !== undefined && value !== null ? String(value) : '-'} />;
                    })}

                    {/* Actions column */}
                    <td className="px-4 py-2.5 text-center sticky right-0 bg-white/70 dark:bg-slate-800/80 border-l border-slate-200 dark:border-slate-700 z-10">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(item, focusLevel);
                            }}
                            className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                            title="מחק פריט"
                        >
                            <Icon path={ICONS.trash} className="w-4 h-4 text-red-500" />
                        </button>
                    </td>
                </tr>
            );
        });
    }, [displayData, focusLevel, headerConfig, getNestedValue, onRowClick, onRowType, onUpdate, onDelete, handleTableKeyDown]);

    // Virtual scrolling spacer
    const virtualSpacer = useMemo(() => {
        if (!virtualScrollEnabled) return null;
        
        return (
            <tr style={{ height: `${offsetY}px` }}>
                <td colSpan="999" style={{ padding: 0 }}></td>
            </tr>
        );
    }, [virtualScrollEnabled, offsetY]);

    return (
        <div className="bg-white/70 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/60 rounded-xl shadow-md overflow-hidden">
            {/* Table Header */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-slate-100/80 dark:bg-slate-700/80 backdrop-blur-md">
                            {/* Sticky name header */}
                            <th
                                scope="col"
                                className="sticky right-0 bg-slate-200 dark:bg-slate-700 z-20 px-4 py-2.5 text-right text-xs font-bold text-slate-500 dark:text-slate-400 border-l-2 border-slate-400 dark:border-slate-600"
                            >
                                {focusLevel === 'owner' ? 'שם' : focusLevel === 'unit' ? 'יחידה' : focusLevel === 'building' ? 'בניין' : 'פרויקט'}
                            </th>

                            {/* Column headers */}
                            {headerConfig?.[0]?.columns?.filter(col => col.visible).map((col) => (
                                <th
                                    key={col.key}
                                    scope="col"
                                    className="px-3 py-2.5 text-right text-xs font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap border-l border-slate-200 dark:border-slate-700"
                                >
                                    <button
                                        onClick={() => handleSort(col.key, col.type)}
                                        className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                                    >
                                        {col.label}
                                        <Icon path={getSortIcon(col.key)} className="w-3 h-3" />
                                    </button>
                                </th>
                            ))}

                            {/* Actions header */}
                            <th scope="col" className="px-3 py-2.5 border-l border-slate-200 dark:border-slate-700"></th>
                        </tr>
                    </thead>

                    {/* Table Body with Virtual Scrolling */}
                    <tbody 
                        className="bg-white/70 dark:bg-slate-800/80 divide-y-2 divide-slate-300 dark:divide-slate-700 max-h-[600px] overflow-y-auto"
                        onKeyDown={handleKeyDown}
                        ref={containerRef}
                        onScroll={handleScroll}
                        role="table"
                    >
                        {virtualSpacer}
                        {renderTableBody}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {!virtualScrollEnabled && paginationInfo && (
                <div className="flex items-center justify-between px-4 py-3 bg-slate-50/80 dark:bg-slate-700/80 border-t border-slate-200 dark:border-slate-600">
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                        מציג {paginationInfo.startItem} - {paginationInfo.endItem} מתוך {totalCount} פריטים
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-3 py-1 text-sm bg-white dark:bg-slate-600 border border-slate-300 dark:border-slate-500 rounded hover:bg-slate-50 dark:hover:bg-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Icon path={ICONS.chevronRight} className="w-4 h-4" />
                        </button>
                        
                        <span className="px-3 py-1 text-sm font-medium">
                            עמוד {currentPage} מתוך {paginationInfo.totalPages}
                        </span>
                        
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage >= paginationInfo.totalPages}
                            className="px-3 py-1 text-sm bg-white dark:bg-slate-600 border border-slate-300 dark:border-slate-500 rounded hover:bg-slate-50 dark:hover:bg-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Icon path={ICONS.chevronLeft} className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Performance indicator */}
            {virtualScrollEnabled && (
                <div className="text-xs text-slate-500 dark:text-slate-400 px-4 py-2 bg-slate-50 dark:bg-slate-700 border-t border-slate-200 dark:border-slate-600">
                    מציג {visibleRange.start + 1}-{visibleRange.end} מתוך {totalCount} פריטים (גלילה וירטואלית)
                </div>
            )}
        </div>
    );
});

export default DataTable;