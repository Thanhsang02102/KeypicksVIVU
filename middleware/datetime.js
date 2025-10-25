/**
 * Middleware to ensure consistent datetime handling
 * All datetime values are stored and transmitted in UTC using ISO8601 format
 * 
 * DETECTION STRATEGY:
 * - Pure format-based detection using ISO8601 pattern matching
 * - No field name guessing or hardcoded field lists
 * - Any string matching ISO8601 format is automatically parsed/serialized
 * 
 * @example Request Parsing (Client -> Server)
 * // Automatically parses ANY ISO8601 strings from all sources:
 * 
 * // Query params: GET /flights?from=2025-10-25T10:00:00Z&to=2025-10-26
 * req.query.from  // Date object (detected by ISO8601 format)
 * req.query.to    // Date object (YYYY-MM-DD is valid ISO8601)
 * 
 * // Path params: GET /bookings/:date where date=2025-10-25
 * req.params.date // Date object (format-based detection)
 * 
 * // Body: POST /bookings with { anyFieldName: "2025-10-25T10:00:00Z" }
 * req.body.anyFieldName // Date object (field name doesn't matter)
 * 
 * @example Response Serialization (Server -> Client)
 * // Automatically serializes ALL Date objects to ISO8601:
 * 
 * res.json({
 *   booking: {
 *     someDate: new Date(),       // Becomes "2025-10-25T10:00:00.000Z"
 *     flights: [
 *       { anyDate: new Date() }   // Nested dates also serialized
 *     ]
 *   }
 * });
 * 
 * @example Manual Usage
 * const { parseQueryParams, serializeDateTime, isISO8601 } = require('./middleware/datetime');
 * 
 * // Check if string is ISO8601
 * isISO8601("2025-10-25T10:00:00Z");  // true
 * isISO8601("2025-10-25");            // true
 * isISO8601("not a date");            // false
 * 
 * // Parse manually
 * const parsed = parseQueryParams({ anyKey: "2025-10-25T10:00:00Z" });
 * 
 * // Serialize manually
 * const serialized = serializeDateTime({ anyKey: new Date() });
 */

/**
 * Middleware to parse datetime strings from all request sources
 * Converts ISO8601 strings to Date objects before processing
 * Handles: body, query, params, and optionally headers
 */
const parseDateTimeFields = (req, res, next) => {
    try {
        // Parse request body (POST, PUT, PATCH)
        // Use deep recursive parsing for nested objects
        if (req.body && typeof req.body === 'object') {
            req.body = parseDateTime(req.body);
        }
        
        // Parse query parameters (GET ?date=2025-10-25T10:00:00Z&from=2025-10-25)
        // Use specialized query parser (usually flat structures)
        if (req.query && typeof req.query === 'object' && Object.keys(req.query).length > 0) {
            req.query = parseQueryParams(req.query);
        }
        
        // Parse path parameters (GET /bookings/:date/:time)
        // Usually simple strings, but might contain dates
        if (req.params && typeof req.params === 'object' && Object.keys(req.params).length > 0) {
            req.params = parseQueryParams(req.params);
        }
        
        // Optional: Parse date headers (If-Modified-Since, etc.)
        // Uncomment if needed
        // if (req.headers && typeof req.headers === 'object') {
        //     req.headers = parseDateHeaders(req.headers);
        // }
        
        next();
    } catch (error) {
        // Log error but don't break the request
        console.error('Error parsing datetime fields:', error);
        next();
    }
};

/**
 * Recursively parse datetime fields in an object
 * Uses pure ISO8601 format detection - no field name assumptions
 * Any string value matching ISO8601 pattern will be converted to Date object
 * 
 * @param {Object} obj - Object to parse
 * @returns {Object} - Parsed object with ISO8601 strings converted to Date objects
 */
function parseDateTime(obj) {
    // Handle null/undefined
    if (obj == null) {
        return obj;
    }

    // Handle primitive types
    if (typeof obj !== 'object') {
        return obj;
    }

    // Handle Date objects (already parsed)
    if (obj instanceof Date) {
        return obj;
    }

    // Handle arrays
    if (Array.isArray(obj)) {
        return obj.map(item => parseDateTime(item));
    }

    // Handle plain objects
    const parsed = {};
    
    for (const key in obj) {
        // Skip prototype properties
        if (!obj.hasOwnProperty(key)) {
            continue;
        }

        const value = obj[key];

        // Handle nested objects/arrays recursively
        if (value && typeof value === 'object') {
            parsed[key] = parseDateTime(value);
        }
        // Parse ISO8601 datetime strings to Date objects
        // Pure format-based detection - no field name guessing
        else if (typeof value === 'string' && isISO8601(value)) {
            try {
                const date = new Date(value);
                // Validate the parsed date
                parsed[key] = isNaN(date.getTime()) ? value : date;
            } catch (e) {
                parsed[key] = value;
            }
        }
        else {
            parsed[key] = value;
        }
    }

    return parsed;
}

/**
 * Parse query parameters (usually flat objects with string values)
 * Uses pure ISO8601 format detection without field name guessing
 * @param {Object} query - Query parameters object
 * @returns {Object} - Parsed query object
 */
function parseQueryParams(query) {
    if (!query || typeof query !== 'object') {
        return query;
    }

    const parsed = {};
    
    for (const key in query) {
        if (!query.hasOwnProperty(key)) {
            continue;
        }

        const value = query[key];

        // Handle array values (e.g., ?dates[]=2025-10-25&dates[]=2025-10-26)
        if (Array.isArray(value)) {
            parsed[key] = value.map(item => {
                if (typeof item === 'string' && isISO8601(item)) {
                    try {
                        const date = new Date(item);
                        return isNaN(date.getTime()) ? item : date;
                    } catch (e) {
                        return item;
                    }
                }
                return item;
            });
        }
        // Handle string values - pure format-based detection
        else if (typeof value === 'string' && isISO8601(value)) {
            try {
                const date = new Date(value);
                parsed[key] = isNaN(date.getTime()) ? value : date;
            } catch (e) {
                parsed[key] = value;
            }
        }
        else {
            parsed[key] = value;
        }
    }

    return parsed;
}

/**
 * Check if a string is in ISO8601 format
 * Supports multiple ISO8601 variants:
 * - YYYY-MM-DD (date only)
 * - YYYY-MM-DDTHH:mm:ss (datetime without timezone)
 * - YYYY-MM-DDTHH:mm:ssZ (datetime with UTC)
 * - YYYY-MM-DDTHH:mm:ss.sssZ (datetime with milliseconds)
 * - YYYY-MM-DDTHH:mm:ss+00:00 (datetime with timezone offset)
 * - YYYY-MM-DDTHH:mm:ss.sss+00:00 (full format with offset)
 * 
 * @param {string} str - String to check
 * @returns {boolean}
 */
function isISO8601(str) {
    if (typeof str !== 'string') return false;
    
    // Enhanced ISO8601 pattern to catch more variants
    // Date part: YYYY-MM-DD
    // Time part (optional): THH:mm:ss or THH:mm:ss.sss
    // Timezone (optional): Z or +HH:mm or -HH:mm or +HH:MM or -HH:MM
    const iso8601Pattern = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{1,3})?(Z|[+-]\d{2}:\d{2})?)?$/;
    
    if (!iso8601Pattern.test(str)) {
        return false;
    }
    
    // Additional validation: try to parse and check if valid
    // This catches edge cases like 2025-13-45 (invalid month/day)
    try {
        const date = new Date(str);
        return !isNaN(date.getTime());
    } catch (e) {
        return false;
    }
}

/**
 * Middleware to ensure response datetime fields are in ISO8601 format
 * This is a safety net in case toJSON transforms don't work
 * Uses both recursive serialization and JSON replacer for comprehensive handling
 */
const serializeDateTimeFields = (req, res, next) => {
    const originalJson = res.json;
    
    res.json = function(data) {
        // Ensure all Date objects are serialized to ISO8601
        const serialized = serializeDateTime(data);
        return originalJson.call(this, serialized);
    };
    
    next();
};

/**
 * JSON replacer function for JSON.stringify
 * Converts Date objects to ISO8601 strings
 * @param {string} key - Object key
 * @param {*} value - Object value
 * @returns {*} - Serialized value
 */
function dateReplacer(key, value) {
    // Handle Date objects
    if (value instanceof Date) {
        return value.toISOString();
    }
    return value;
}

/**
 * Recursively serialize datetime fields to ISO8601
 * Handles all types properly: primitives, objects, arrays, and Date instances
 * @param {*} obj - Value to serialize
 * @returns {*} - Serialized value
 */
function serializeDateTime(obj) {
    // Handle null/undefined
    if (obj == null) {
        return obj;
    }

    // Handle primitive types (string, number, boolean, symbol, bigint)
    const objType = typeof obj;
    if (objType !== 'object' && objType !== 'function') {
        return obj;
    }

    // Handle functions (should not be in JSON, but just in case)
    if (objType === 'function') {
        return undefined;
    }

    // Handle Date objects - convert to ISO8601 string
    if (obj instanceof Date) {
        return obj.toISOString();
    }

    // Handle arrays
    if (Array.isArray(obj)) {
        return obj.map(item => serializeDateTime(item));
    }

    // Handle Buffer (Node.js specific)
    if (Buffer && obj instanceof Buffer) {
        return obj;
    }

    // Handle Mongoose documents - use toObject() if available
    if (obj.toObject && typeof obj.toObject === 'function') {
        const plain = obj.toObject();
        return serializeDateTime(plain);
    }

    // Handle plain objects and other object types
    if (objType === 'object') {
        const serialized = {};
        
        // Use Object.keys to avoid prototype chain issues
        // Also handles non-enumerable properties if needed
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const value = obj[key];
                const serializedValue = serializeDateTime(value);
                
                // Skip undefined values (like JSON.stringify does)
                if (serializedValue !== undefined) {
                    serialized[key] = serializedValue;
                }
            }
        }
        
        return serialized;
    }

    // Fallback for any other types
    return obj;
}

/**
 * Alternative serialization using JSON.stringify with replacer
 * More performant for large objects, but may not handle all edge cases
 * @param {*} data - Data to serialize
 * @returns {string} - JSON string with dates serialized
 */
function serializeDateTimeToJSON(data) {
    return JSON.stringify(data, dateReplacer);
}

/**
 * Helper function to get current UTC datetime
 * @returns {Date} - Current datetime in UTC
 */
const now = () => {
    return new Date();
};

/**
 * Helper function to parse date string to Date object
 * @param {string} dateString - Date string in ISO8601 format
 * @returns {Date|null} - Parsed Date object or null if invalid
 */
const parseDate = (dateString) => {
    if (!dateString) return null;
    try {
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? null : date;
    } catch (e) {
        return null;
    }
};

/**
 * Helper function to format Date object to ISO8601 string
 * @param {Date} date - Date object
 * @returns {string|null} - ISO8601 formatted string or null if invalid
 */
const toISO = (date) => {
    if (!date) return null;
    try {
        return date.toISOString();
    } catch (e) {
        return null;
    }
};

module.exports = {
    // Middleware
    parseDateTimeFields,
    serializeDateTimeFields,
    
    // Parsing functions (request -> Date objects)
    parseDateTime,          // Deep recursive parsing for nested objects (body)
    parseQueryParams,       // Flat parsing for query/path params
    
    // Serialization functions (Date objects -> ISO8601 strings)
    serializeDateTime,      // Deep recursive serialization
    dateReplacer,           // JSON.stringify replacer
    serializeDateTimeToJSON, // Convenience wrapper
    
    // Utility functions
    now,
    parseDate,
    toISO,
    isISO8601              // Export for validation
};

