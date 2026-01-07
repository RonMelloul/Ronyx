import React, { useState, useCallback, useMemo } from 'react';
import { ICONS } from '../constants';
import { DataService } from '../services';

// Memoized Icon Component
const Icon = React.memo(({ path, className = "w-4 h-4", ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
));

// Optimized Detail Modal Component
const DetailModal = React.memo(({ 
    item, 
    itemType, 
    onClose, 
    onUpdate, 
    unassignedUnits = [], 
    onAssignUnit, 
    onUnassignUnit 
}) => {
    const [activeTab, setActiveTab] = useState('basic');
    const [localData, setLocalData] = useState(() => item ? JSON.parse(JSON.stringify(item)) : null);

    // Update local data when item changes
    React.useEffect(() => {
        if (item) {
            setLocalData(JSON.parse(JSON.stringify(item)));
        }
    }, [item]);

    // Handle save
    const handleSave = useCallback(() => {
        if (localData && onUpdate) {
            onUpdate(localData, null, null, itemType);
            onClose();
        }
    }, [localData, onUpdate, onClose, itemType]);

    // Handle field update
    const handleFieldUpdate = useCallback((field, value) => {
        setLocalData(prev => ({
            ...prev,
            [field]: value
        }));
    }, []);

    // Handle nested field update
    const handleNestedFieldUpdate = useCallback((path, value) => {
        setLocalData(prev => {
            const newData = { ...prev };
            const keys = path.split('.');
            const lastKey = keys.pop();
            const target = keys.reduce((obj, key) => {
                if (!obj[key]) obj[key] = {};
                return obj[key];
            }, newData);
            target[lastKey] = value;
            return newData;
        });
    }, []);

    if (!item || !itemType) return null;

    // Tab configuration based on item type
    const tabs = useMemo(() => {
        const baseTabs = [
            { id: 'basic', label: 'פרטים בסיסיים', icon: ICONS.document },
            { id: 'contact', label: 'פרטי קשר', icon: ICONS.notification }
        ];

        if (itemType === 'owner') {
            return [
                ...baseTabs,
                { id: 'legal', label: 'מסמכים משפטיים', icon: ICONS.assignment },
                { id: 'financial', label: 'מסמכים פיננסיים', icon: ICONS.balance },
                { id: 'socio', label: 'פרופיל חברתי', icon: ICONS.users },
                { id: 'status', label: 'סטטוס', icon: ICONS.chart }
            ];
        }

        if (itemType === 'unit') {
            return [
                ...baseTabs,
                { id: 'physical', label: 'מאפיינים פיזיים', icon: ICONS.building },
                { id: 'legal', label: 'מידע משפטי', icon: ICONS.assignment },
                { id: 'documents', label: 'מסמכים', icon: ICONS.document },
                { id: 'owners', label: 'בעלים', icon: ICONS.users }
            ];
        }

        return baseTabs;
    }, [itemType]);

    // Render form fields
    const renderFormField = (label, value, onChange, type = 'text', options = []) => {
        const id = `field-${label.replace(/\s+/g, '-').toLowerCase()}`;

        return (
            <div className="space-y-2">
                <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    {label}
                </label>
                {type === 'select' ? (
                    <select
                        id={id}
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                    >
                        <option value="">בחר...</option>
                        {options.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                ) : type === 'textarea' ? (
                    <textarea
                        id={id}
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                    />
                ) : (
                    <input
                        id={id}
                        type={type}
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                    />
                )}
            </div>
        );
    };

    // Render tab content
    const renderTabContent = () => {
        switch (activeTab) {
            case 'basic':
                return (
                    <div className="space-y-6">
                        {itemType === 'owner' && (
                            <>
                                {renderFormField('שם', localData?.name, (value) => handleFieldUpdate('name', value))}
                                {renderFormField('תעודת זהות', localData?.idNumber, (value) => handleFieldUpdate('idNumber', value))}
                                {renderFormField('כתובת', localData?.address, (value) => handleFieldUpdate('address', value))}
                                {renderFormField('סוג בעלות', localData?.ownerType, (value) => handleFieldUpdate('ownerType', value), 'select', [
                                    { value: 'private', label: 'פרטי' },
                                    { value: 'company', label: 'חברה' }
                                ])}
                            </>
                        )}
                        
                        {itemType === 'unit' && (
                            <>
                                {renderFormField('כתובת מלאה', localData?.identification?.fullAddress, (value) => handleNestedFieldUpdate('identification.fullAddress', value))}
                                {renderFormField('מספר תת-חלקה', localData?..subplot, (value) => handleFieldUpdate('.subplot', parseInt(value) || 0))}
                                {renderFormField('שטח נטו (מ"ר)', localData?.physical?.areaSqM_net, (value) => handleNestedFieldUpdate('physical.areaSqM_net', parseFloat(value) || 0), 'number')}
                                {renderFormField('מספר חדרים', localData?.physical?.numRooms, (value) => handleNestedFieldUpdate('physical.numRooms', parseInt(value) || 0), 'number')}
                                {renderFormField('קומה', localData?.physical?.floor, (value) => handleNestedFieldUpdate('physical.floor', parseInt(value) || 0), 'number')}
                            </>
                        )}
                    </div>
                );

            case 'contact':
                if (itemType === 'owner') {
                    return (
                        <div className="space-y-6">
                            {renderFormField('טלפון', localData?.contact?.phone, (value) => handleNestedFieldUpdate('contact.phone', value))}
                            {renderFormField('אימייל', localData?.contact?.email, (value) => handleNestedFieldUpdate('contact.email', value))}
                            {renderFormField('אמצעי קשר מועדף', localData?.contact?.preferredContactMethod, (value) => handleNestedFieldUpdate('contact.preferredContactMethod', value), 'select', [
                                { value: 'phone', label: 'טלפון' },
                                { value: 'email', label: 'אימייל' },
                                { value: 'whatsapp', label: 'WhatsApp' }
                            ])}
                        </div>
                    );
                }
                break;

            case 'legal':
                if (itemType === 'owner') {
                    return (
                        <div className="space-y-6">
                            <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200">חתימות משפטיות</h4>
                            {renderFormField('הסכם', localData?.legalSignatures?.contract, (value) => handleNestedFieldUpdate('legalSignatures.contract', value), 'select', [
                                { value: 'V', label: 'חתום' },
                                { value: 'X', label: 'לא חתום' }
                            ])}
                            {renderFormField('ייפוי כוח מס', localData?.legalSignatures?.po_tax, (value) => handleNestedFieldUpdate('legalSignatures.po_tax', value), 'select', [
                                { value: 'V', label: 'חתום' },
                                { value: 'X', label: 'לא חתום' }
                            ])}
                            {renderFormField('ייפוי כוח כללי', localData?.legalSignatures?.po_general, (value) => handleNestedFieldUpdate('legalSignatures.po_general', value), 'select', [
                                { value: 'V', label: 'חתום' },
                                { value: 'X', label: 'לא חתום' }
                            ])}
                        </div>
                    );
                }
                break;

            case 'owners':
                if (itemType === 'unit') {
                    return (
                        <div className="space-y-4">
                            <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200">בעלי היחידה</h4>
                            {localData?.owners?.map((owner, index) => (
                                <div key={owner.id || index} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                                    <div>
                                        <p className="font-medium text-slate-800 dark:text-slate-200">{owner.name}</p>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">ת.ז. {owner.idNumber}</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            const updatedOwners = localData.owners.filter((_, i) => i !== index);
                                            handleFieldUpdate('owners', updatedOwners);
                                        }}
                                        className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded"
                                    >
                                        <Icon path={ICONS.trash} className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    );
                }
                break;

            default:
                return (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                        תוכן הכרטיסייה בפיתוח...
                    </div>
                );
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-fadeIn" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-slideUp">
                {/* Header */}
                <div className="sticky top-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {itemType === 'owner' ? 'פרטי בעלים' : 
                         itemType === 'unit' ? 'פרטי יחידה' : 
                         'פרטי פריט'}
                    </h2>
                    <button 
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                        <Icon path={ICONS.xMark} className="w-6 h-6 text-slate-600 dark:text-slate-300" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex overflow-x-auto bg-slate-50 dark:bg-slate-700">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                                activeTab === tab.id
                                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                            }`}
                        >
                            <Icon path={tab.icon} className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    {renderTabContent()}
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-slate-50 dark:bg-slate-800/50 p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
                    <button 
                        onClick={onClose}
                        className="px-6 py-2.5 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 transition-colors"
                    >
                        ביטול
                    </button>
                    <button 
                        onClick={handleSave}
                        className="px-6 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        שמור
                    </button>
                </div>
            </div>
        </div>
    );
});

export default DetailModal;