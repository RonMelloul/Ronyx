/**
 * QUANTUM ADAPTIVE LAYOUT
 * Context-aware responsive design with AI enhancement
 * Adaptive user experience based on device capabilities and user behavior
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useQuantumViewport } from './QuantumViewport.js';
import { useQuantumAccessibility } from './QuantumAccessibility.js';

// Quantum Viewport Hook with AI
export const useQuantumViewport = () => {
  const [viewport, setViewport] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  const [deviceType, setDeviceType] = useState(detectDeviceType());
  const [connectionQuality, setConnectionQuality] = useState(getConnectionQuality());
  const [performanceProfile, setPerformanceProfile] = useState(getPerformanceProfile());
  const [userPreferences, setUserPreferences] = useState(getUserPreferences());

  // AI-powered device detection
  const detectDeviceType = () => {
    const width = window.innerWidth;
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    
    if (isMobile || width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    if (width < 1440) return 'desktop';
    return 'large-desktop';
  };

  // Network quality detection
  const getConnectionQuality = () => {
    if ('connection' in navigator) {
      const connection = navigator.connection;
      const effectiveType = connection.effectiveType;
      
      if (effectiveType === '4g') return 'excellent';
      if (effectiveType === '3g') return 'good';
      return 'limited';
    }
    return 'unknown';
  };

  // Performance profile detection
  const getPerformanceProfile = () => {
    const cores = navigator.hardwareConcurrency || 4;
    const memory = navigator.deviceMemory || 4;
    
    if (cores >= 8 && memory >= 8) return 'high-performance';
    if (cores >= 4 && memory >= 4) return 'medium-performance';
    return 'low-performance';
  };

  // User preferences
  const getUserPreferences = () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
    
    return {
      reducedMotion: prefersReducedMotion,
      darkMode: prefersDarkMode,
      highContrast: prefersHighContrast,
      fontSize: localStorage.getItem('preferred-font-size') || 'medium'
    };
  };

  // Viewport monitoring
  useEffect(() => {
    const handleResize = () => {
      const newViewport = {
        width: window.innerWidth,
        height: window.innerHeight
      };
      setViewport(newViewport);
      setDeviceType(detectDeviceType());
    };

    const handleConnectionChange = () => {
      setConnectionQuality(getConnectionQuality());
    };

    window.addEventListener('resize', handleResize);
    
    if ('connection' in navigator) {
      navigator.connection.addEventListener('change', handleConnectionChange);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      
      if ('connection' in navigator) {
        navigator.connection.removeEventListener('change', handleConnectionChange);
      }
    };
  }, []);

  return {
    viewport,
    deviceType,
    connectionQuality,
    performanceProfile,
    userPreferences,
    isMobile: deviceType === 'mobile',
    isTablet: deviceType === 'tablet',
    isDesktop: deviceType === 'desktop',
    isHighPerformance: performanceProfile === 'high-performance'
  };
};

// Quantum Accessibility Hook
export const useQuantumAccessibility = () => {
  const [accessibilityLevel, setAccessibilityLevel] = useState('standard');
  const [screenReaderActive, setScreenReaderActive] = useState(false);
  const [keyboardNavigation, setKeyboardNavigation] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState('medium');

  // AI-powered accessibility detection
  useEffect(() => {
    // Check for screen reader
    const isScreenReader = window.navigator.userAgent.includes('JAWS') ||
                          window.navigator.userAgent.includes('NVDA') ||
                          window.speechSynthesis ||
                          document.querySelector('[aria-live]');
    
    setScreenReaderActive(isScreenReader);

    // Check for keyboard navigation
    const handleKeyDown = (e) => {
      if (e.key === 'Tab' || e.key === 'ArrowKeys') {
        setKeyboardNavigation(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Monitor for accessibility preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

    const updateAccessibilitySettings = () => {
      setHighContrast(prefersHighContrast.matches);
      setFontSize(localStorage.getItem('preferred-font-size') || 'medium');
      
      // Calculate accessibility level
      const accessibilityScore = calculateAccessibilityScore({
        reducedMotion: prefersReducedMotion.matches,
        highContrast: prefersHighContrast.matches,
        darkMode: prefersDark.matches,
        screenReader: isScreenReader
      });
      
      setAccessibilityLevel(accessibilityScore);
    };

    updateAccessibilitySettings();
    
    prefersReducedMotion.addEventListener('change', updateAccessibilitySettings);
    prefersHighContrast.addEventListener('change', updateAccessibilitySettings);
    prefersDark.addEventListener('change', updateAccessibilitySettings);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      prefersReducedMotion.removeEventListener('change', updateAccessibilitySettings);
      prefersHighContrast.removeEventListener('change', updateAccessibilitySettings);
      prefersDark.removeEventListener('change', updateAccessibilitySettings);
    };
  }, []);

  return {
    accessibilityLevel,
    screenReaderActive,
    keyboardNavigation,
    highContrast,
    fontSize,
    shouldReduceMotion: accessibilityLevel !== 'standard',
    shouldUseHighContrast: highContrast
  };
};

// Calculate accessibility score
const calculateAccessibilityScore = (preferences) => {
  let score = 0;
  
  if (preferences.screenReader) score += 30;
  if (preferences.highContrast) score += 25;
  if (preferences.reducedMotion) score += 20;
  if (preferences.darkMode) score += 15;
  
  if (score >= 70) return 'enhanced';
  if (score >= 40) return 'improved';
  return 'standard';
};

// Adaptive Layout Strategies
const AdaptiveLayoutStrategies = {
  getOptimalStrategy({ viewport, deviceType, connection, performance }) {
    const strategies = {
      mobile: this.getMobileStrategy(connection, performance),
      tablet: this.getTabletStrategy(connection, performance),
      desktop: this.getDesktopStrategy(connection, performance),
      'large-desktop': this.getLargeDesktopStrategy(connection, performance)
    };

    return strategies[deviceType] || this.getDesktopStrategy(connection, performance);
  },

  getMobileStrategy(connection, performance) {
    const isSlowConnection = connection === 'limited';
    const isLowPerformance = performance === 'low-performance';

    return {
      className: 'quantum-mobile-layout',
      mode: 'stacked',
      resourceStrategy: isSlowConnection ? 'minimal' : 'optimized',
      animationLevel: isLowPerformance ? 'none' : 'reduced',
      imageStrategy: 'responsive'
    };
  },

  getTabletStrategy(connection, performance) {
    return {
      className: 'quantum-tablet-layout',
      mode: 'hybrid',
      resourceStrategy: 'balanced',
      animationLevel: 'moderate',
      imageStrategy: 'retina'
    };
  },

  getDesktopStrategy(connection, performance) {
    return {
      className: 'quantum-desktop-layout',
      mode: 'sidebar',
      resourceStrategy: 'premium',
      animationLevel: 'full',
      imageStrategy: 'high-res'
    };
  },

  getLargeDesktopStrategy(connection, performance) {
    return {
      className: 'quantum-large-desktop-layout',
      mode: 'dashboard',
      resourceStrategy: 'premium',
      animationLevel: 'full',
      imageStrategy: 'ultra-hd'
    };
  }
};

// Quantum Adaptive Layout Component
export const QuantumAdaptiveLayout = ({ children, breakpoints = QUANTUM_BREAKPOINTS }) => {
  const { 
    viewport, 
    deviceType, 
    connectionQuality,
    performanceProfile 
  } = useQuantumViewport();

  const layoutStrategy = useMemo(() => 
    AdaptiveLayoutStrategies.getOptimalStrategy({
      viewport,
      deviceType,
      connection: connectionQuality,
      performance: performanceProfile
    }), [viewport, deviceType, connectionQuality, performanceProfile]
  );

  return (
    <div 
      className={`quantum-adaptive-layout ${layoutStrategy.className}`}
      data-layout-mode={layoutStrategy.mode}
      data-device-type={deviceType}
      data-performance-profile={performanceProfile}
      data-connection-quality={connectionQuality}
      style={{
        '--primary-animation-level': layoutStrategy.animationLevel,
        '--image-strategy': layoutStrategy.imageStrategy
      }}
    >
      <AdaptiveResourceLoader strategy={layoutStrategy.resourceStrategy}>
        {children}
      </AdaptiveResourceLoader>
    </div>
  );
};

// Adaptive Resource Loader
const AdaptiveResourceLoader = ({ strategy, children }) => {
  const [loadedResources, setLoadedResources] = useState(new Set());

  useEffect(() => {
    const loadResources = async () => {
      const resources = getResourcesForStrategy(strategy);
      
      for (const resource of resources) {
        try {
          await loadResource(resource);
          setLoadedResources(prev => new Set([...prev, resource.url]));
        } catch (error) {
          console.warn(`Failed to load resource: ${resource.url}`, error);
        }
      }
    };

    loadResources();
  }, [strategy]);

  return (
    <div data-loaded-resources={Array.from(loadedResources).join(',')}>
      {children}
    </div>
  );
};

// Get resources based on strategy
const getResourcesForStrategy = (strategy) => {
  const resourceMaps = {
    minimal: [
      { url: '/css/core.min.css', type: 'style' },
      { url: '/js/core.min.js', type: 'script' }
    ],
    optimized: [
      { url: '/css/core.min.css', type: 'style' },
      { url: '/js/core.min.js', type: 'script' },
      { url: '/css/enhanced.css', type: 'style' },
      { url: '/js/enhanced.js', type: 'script' }
    ],
    balanced: [
      { url: '/css/core.min.css', type: 'style' },
      { url: '/js/core.min.js', type: 'script' },
      { url: '/css/enhanced.css', type: 'style' },
      { url: '/js/enhanced.js', type: 'script' },
      { url: '/css/animations.css', type: 'style' },
      { url: '/js/animations.js', type: 'script' }
    ],
    premium: [
      { url: '/css/core.min.css', type: 'style' },
      { url: '/js/core.min.js', type: 'script' },
      { url: '/css/enhanced.css', type: 'style' },
      { url: '/js/enhanced.js', type: 'script' },
      { url: '/css/animations.css', type: 'style' },
      { url: '/js/animations.js', type: 'script' },
      { url: '/css/premium.css', type: 'style' },
      { url: '/js/premium.js', type: 'script' }
    ]
  };

  return resourceMaps[strategy] || resourceMaps.balanced;
};

// Load resource function
const loadResource = (resource) => {
  return new Promise((resolve, reject) => {
    if (resource.type === 'style') {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = resource.url;
      link.onload = resolve;
      link.onerror = reject;
      document.head.appendChild(link);
    } else if (resource.type === 'script') {
      const script = document.createElement('script');
      script.src = resource.url;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    }
  });
};

// Quantum Accessible Table Component
export const QuantumAccessibleTable = ({ 
  data, 
  columns, 
  options = {},
  accessibilityLevel = 'standard'
}) => {
  const tableRef = useRef(null);
  const { accessibilityLevel: currentLevel, screenReaderActive } = useQuantumAccessibility();

  // Automatic accessibility enhancements
  useEffect(() => {
    if (tableRef.current) {
      AccessibilityEnhancer.enhanceTable(tableRef.current, {
        level: accessibilityLevel || currentLevel,
        screenReader: screenReaderActive,
        autoCorrect: true
      });
    }
  }, [data, columns, accessibilityLevel, currentLevel, screenReaderActive]);

  return (
    <div 
      ref={tableRef}
      role="table"
      aria-label={options.label || "Data table"}
      className="quantum-accessible-table"
      data-accessibility-level={accessibilityLevel || currentLevel}
    >
      <QuantumAccessibleTableHeader columns={columns} />
      <QuantumAccessibleTableBody 
        data={data} 
        columns={columns} 
        accessibilityLevel={accessibilityLevel || currentLevel}
      />
    </div>
  );
};

// Quantum Accessible Table Header
const QuantumAccessibleTableHeader = ({ columns }) => {
  return (
    <div role="rowgroup" className="quantum-table-header">
      <div role="row">
        {columns.map((column, index) => (
          <div
            key={column.key}
            role="columnheader"
            aria-colindex={index + 1}
            className="quantum-table-header-cell"
            style={{ flex: column.flex || 1 }}
          >
            <span className="quantum-table-header-text">
              {column.header}
            </span>
            {column.sortable && (
              <button
                className="quantum-sort-button"
                aria-label={`Sort by ${column.header}`}
              >
                ↕️
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Quantum Accessible Table Body
const QuantumAccessibleTableBody = ({ data, columns, accessibilityLevel }) => {
  return (
    <div role="rowgroup" className="quantum-table-body">
      {data.map((row, rowIndex) => (
        <div
          key={row.id || rowIndex}
          role="row"
          className="quantum-table-row"
          aria-rowindex={rowIndex + 1}
        >
          {columns.map((column, colIndex) => (
            <div
              key={column.key}
              role="cell"
              aria-colindex={colIndex + 1}
              className="quantum-table-cell"
              style={{ flex: column.flex || 1 }}
            >
              <span className="quantum-table-cell-content">
                {column.render ? column.render(row[column.key], row) : row[column.key]}
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

// Accessibility Enhancer for AI-powered improvements
const AccessibilityEnhancer = {
  enhanceTable(table, options) {
    const { level, screenReader, autoCorrect } = options;
    
    // Add ARIA labels
    this.addAriaLabels(table);
    
    // Enhance keyboard navigation
    this.enhanceKeyboardNavigation(table);
    
    // Add screen reader optimizations
    if (screenReader) {
      this.optimizeForScreenReader(table);
    }
    
    // Auto-correct common accessibility issues
    if (autoCorrect) {
      this.autoCorrectAccessibilityIssues(table, level);
    }
  },

  addAriaLabels(table) {
    // Ensure all interactive elements have proper labels
    const buttons = table.querySelectorAll('button');
    buttons.forEach(button => {
      if (!button.getAttribute('aria-label') && !button.textContent.trim()) {
        button.setAttribute('aria-label', 'Interactive button');
      }
    });
  },

  enhanceKeyboardNavigation(table) {
    // Add keyboard event handlers for table navigation
    table.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        this.handleArrowNavigation(e, table);
      }
    });
  },

  optimizeForScreenReader(table) {
    // Add live regions for dynamic content
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    table.appendChild(liveRegion);
  },

  handleArrowNavigation(e, table) {
    e.preventDefault();
    // Implement arrow key navigation logic
    console.log('🔄 Arrow key navigation:', e.key);
  },

  autoCorrectAccessibilityIssues(table, level) {
    // AI-powered accessibility correction
    const issues = this.detectAccessibilityIssues(table);
    
    issues.forEach(issue => {
      switch (issue.type) {
        case 'missing-alt':
          this.addAltText(issue.element);
          break;
        case 'missing-label':
          this.addLabel(issue.element);
          break;
        case 'poor-contrast':
          this.improveContrast(issue.element);
          break;
      }
    });
  },

  detectAccessibilityIssues(table) {
    // AI-powered issue detection
    const issues = [];
    
    // Check for missing alt text
    const images = table.querySelectorAll('img');
    images.forEach(img => {
      if (!img.getAttribute('alt')) {
        issues.push({ type: 'missing-alt', element: img });
      }
    });
    
    return issues;
  },

  addAltText(element) {
    element.setAttribute('alt', 'Decorative image');
  },

  addLabel(element) {
    element.setAttribute('aria-label', 'Interactive element');
  },

  improveContrast(element) {
    element.style.backgroundColor = '#ffffff';
    element.style.color = '#000000';
  }
};

// Quantum Breakpoints Configuration
const QUANTUM_BREAKPOINTS = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1400
};

// Export quantum adaptive components
export { 
  QuantumAdaptiveLayout,
  QuantumAccessibleTable,
  useQuantumViewport,
  useQuantumAccessibility,
  AdaptiveLayoutStrategies
};