import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { APP_CONFIG } from './constants';

// Optimized Local Storage Hook
export const useLocalStorage = (key, initialValue) => {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.warn(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    const setValue = useCallback((value) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.warn(`Error setting localStorage key "${key}":`, error);
        }
    }, [key, storedValue]);

    return [storedValue, setValue];
};

// Debounce Hook for optimized search and filtering
export const useDebounce = (value, delay = APP_CONFIG.SEARCH.DEBOUNCE_DELAY) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

// Intersection Observer Hook for lazy loading and virtual scrolling
export const useIntersectionObserver = (ref, options = {}) => {
    const [isIntersecting, setIsIntersecting] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsIntersecting(entry.isIntersecting);
            },
            {
                threshold: options.threshold || 0.1,
                rootMargin: options.rootMargin || '0px'
            }
        );

        observer.observe(element);

        return () => {
            observer.unobserve(element);
        };
    }, [ref, options.threshold, options.rootMargin]);

    return isIntersecting;
};

// Virtual Scrolling Hook
export const useVirtualScroll = (data, itemHeight, containerHeight) => {
    const [scrollTop, setScrollTop] = useState(0);

    const visibleRange = useMemo(() => {
        if (!data || data.length === 0) return { start: 0, end: 0 };
        
        const startIndex = Math.floor(scrollTop / itemHeight);
        const visibleCount = Math.ceil(containerHeight / itemHeight) + 1;
        const endIndex = Math.min(startIndex + visibleCount, data.length);
        
        return { start: startIndex, end: endIndex };
    }, [scrollTop, itemHeight, containerHeight, data]);

    const totalHeight = data ? data.length * itemHeight : 0;
    const offsetY = visibleRange.start * itemHeight;

    const scrollToIndex = useCallback((index) => {
        const newScrollTop = index * itemHeight;
        setScrollTop(newScrollTop);
    }, [itemHeight]);

    return {
        visibleData: data?.slice(visibleRange.start, visibleRange.end) || [],
        totalHeight,
        offsetY,
        scrollToIndex,
        setScrollTop,
        visibleRange
    };
};

// Optimized Fetch Hook with caching
export const useOptimizedFetch = (url, options = {}) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const abortControllerRef = useRef(null);

    const fetchData = useCallback(async () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(url, {
                ...options,
                signal: abortControllerRef.current.signal,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            setData(result);
        } catch (err) {
            if (err.name !== 'AbortError') {
                setError(err.message);
                console.error('Fetch error:', err);
            }
        } finally {
            setLoading(false);
        }
    }, [url, options]);

    useEffect(() => {
        if (options.immediate !== false) {
            fetchData();
        }

        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [fetchData, options.immediate]);

    return { data, loading, error, refetch: fetchData };
};

// Performance Monitoring Hook
export const usePerformanceMonitor = (componentName) => {
    const renderCountRef = useRef(0);
    const lastRenderTimeRef = useRef(performance.now());

    useEffect(() => {
        renderCountRef.current += 1;
        
        if (APP_CONFIG.PERFORMANCE.ENABLE_PERFORMANCE_MONITORING) {
            const now = performance.now();
            const renderTime = now - lastRenderTimeRef.current;
            
            console.log(`${componentName} render #${renderCountRef.current} - Time: ${renderTime.toFixed(2)}ms`);
            
            if (renderTime > APP_CONFIG.PERFORMANCE.RENDER_TIME_THRESHOLD) {
                console.warn(`${componentName} slow render detected: ${renderTime.toFixed(2)}ms`);
            }
            
            lastRenderTimeRef.current = now;
        }
    });

    return {
        renderCount: renderCountRef.current,
        lastRenderTime: lastRenderTimeRef.current
    };
};

// Optimized State Hook with batching
export const useOptimizedState = (initialState) => {
    const [state, setState] = useState(initialState);
    const batchedUpdatesRef = useRef([]);
    const isBatchingRef = useRef(false);

    const setOptimizedState = useCallback((update) => {
        if (isBatchingRef.current) {
            batchedUpdatesRef.current.push(update);
        } else {
            setState(update);
        }
    }, []);

    const startBatch = useCallback(() => {
        isBatchingRef.current = true;
        batchedUpdatesRef.current = [];
    }, []);

    const endBatch = useCallback(() => {
        isBatchingRef.current = false;
        if (batchedUpdatesRef.current.length > 0) {
            const combinedUpdate = batchedUpdatesRef.current.reduce(
                (acc, update) => {
                    const newValue = typeof update === 'function' ? update(acc) : update;
                    return typeof newValue === 'object' && newValue !== null 
                        ? { ...acc, ...newValue } 
                        : newValue;
                },
                state
            );
            setState(combinedUpdate);
            batchedUpdatesRef.current = [];
        }
    }, [state]);

    return [state, setOptimizedState, startBatch, endBatch];
};

// Memory Usage Monitoring Hook
export const useMemoryMonitor = () => {
    const [memoryInfo, setMemoryInfo] = useState(null);

    const checkMemory = useCallback(() => {
        if ('memory' in performance) {
            const memory = performance.memory;
            setMemoryInfo({
                used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
                total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
                limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
            });
        }
    }, []);

    useEffect(() => {
        checkMemory();
        const interval = setInterval(checkMemory, 10000); // Check every 10 seconds
        
        return () => clearInterval(interval);
    }, [checkMemory]);

    return memoryInfo;
};

// Resize Observer Hook
export const useResizeObserver = (ref) => {
    const [size, setSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                setSize({ width, height });
            }
        });

        observer.observe(element);

        return () => {
            observer.disconnect();
        };
    }, [ref]);

    return size;
};

// Event Listener Hook with cleanup
export const useEventListener = (target, event, handler, options = {}) => {
    const savedHandler = useRef(handler);

    useEffect(() => {
        savedHandler.current = handler;
    }, [handler]);

    useEffect(() => {
        const targetElement = typeof target === 'object' ? target.current : target;
        if (!targetElement || !targetElement.addEventListener) return;

        const eventListener = (event) => savedHandler.current(event);
        targetElement.addEventListener(event, eventListener, options);

        return () => {
            targetElement.removeEventListener(event, eventListener, options);
        };
    }, [target, event, options]);
};

// Optimized Animation Frame Hook
export const useAnimationFrame = (callback, deps = []) => {
    const requestRef = useRef();
    const previousTimeRef = useRef();

    const animate = useCallback((time) => {
        if (previousTimeRef.current !== undefined) {
            callback(time - previousTimeRef.current);
        }
        previousTimeRef.current = time;
        requestRef.current = requestAnimationFrame(animate);
    }, [callback]);

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(requestRef.current);
    }, [animate, ...deps]);
};

// Keyboard Navigation Hook
export const useKeyboardNavigation = (items, onSelect, options = {}) => {
    const [focusIndex, setFocusIndex] = useState(options.initialIndex || 0);

    const handleKeyDown = useCallback((event) => {
        if (!items || items.length === 0) return;

        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                setFocusIndex(prev => Math.min(prev + 1, items.length - 1));
                break;
            case 'ArrowUp':
                event.preventDefault();
                setFocusIndex(prev => Math.max(prev - 1, 0));
                break;
            case 'Enter':
            case ' ':
                event.preventDefault();
                onSelect?.(items[focusIndex], focusIndex);
                break;
            case 'Home':
                event.preventDefault();
                setFocusIndex(0);
                break;
            case 'End':
                event.preventDefault();
                setFocusIndex(items.length - 1);
                break;
        }
    }, [items, focusIndex, onSelect]);

    return { focusIndex, setFocusIndex, handleKeyDown };
};

// Optimized Form Hook
export const useOptimizedForm = (initialValues = {}, validationRules = {}) => {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    const setValue = useCallback((name, value) => {
        setValues(prev => ({ ...prev, [name]: value }));
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    }, [errors]);

    const setTouched = useCallback((name, isTouched = true) => {
        setTouched(prev => ({ ...prev, [name]: isTouched }));
    }, []);

    const validate = useCallback(() => {
        const newErrors = {};
        Object.keys(validationRules).forEach(field => {
            const rule = validationRules[field];
            const value = values[field];
            
            if (rule.required && (!value || value.toString().trim() === '')) {
                newErrors[field] = `${rule.label || field} הוא שדה חובה`;
            } else if (rule.pattern && !rule.pattern.test(value)) {
                newErrors[field] = rule.message || `${rule.label || field} לא תקין`;
            }
        });
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [values, validationRules]);

    const reset = useCallback(() => {
        setValues(initialValues);
        setErrors({});
        setTouched({});
    }, [initialValues]);

    return {
        values,
        errors,
        touched,
        setValue,
        setTouched,
        validate,
        reset,
        isValid: Object.keys(errors).length === 0
    };
};

// Custom hook for optimized computed values
export const useOptimizedComputed = (computeFn, dependencies) => {
    return useMemo(() => {
        if (APP_CONFIG.PERFORMANCE.ENABLE_PERFORMANCE_MONITORING) {
            const start = performance.now();
            const result = computeFn();
            const end = performance.now();
            console.log(`Computed value calculated in ${(end - start).toFixed(2)}ms`);
            return result;
        }
        return computeFn();
    }, dependencies);
};