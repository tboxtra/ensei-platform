/**
 * PostMessage Utilities
 * 
 * Handles cross-origin messaging with proper origin validation
 * for Twitter/X embeds and other external widgets
 */

// Allowed origins for postMessage communication
const ALLOWED_ORIGINS = new Set([
    'https://platform.twitter.com',
    'https://x.com',
    'https://mobile.x.com',
    'https://twitter.com',
    'https://mobile.twitter.com'
]);

/**
 * Validate postMessage origin
 */
export function isValidOrigin(origin: string): boolean {
    return ALLOWED_ORIGINS.has(origin);
}

/**
 * Send postMessage with origin validation
 */
export function sendPostMessage(
    target: Window | MessagePort | ServiceWorker,
    message: any,
    targetOrigin: string = '*'
): void {
    try {
        if (target && typeof target.postMessage === 'function') {
            target.postMessage(message, targetOrigin);
        }
    } catch (error) {
        console.warn('Failed to send postMessage:', error);
    }
}

/**
 * Create a postMessage listener with origin validation
 */
export function createPostMessageListener(
    handler: (event: MessageEvent) => void,
    allowedOrigins: string[] = Array.from(ALLOWED_ORIGINS)
): (event: MessageEvent) => void {
    return (event: MessageEvent) => {
        // Validate origin
        if (!isValidOrigin(event.origin)) {
            console.debug('Ignoring postMessage from invalid origin:', event.origin);
            return;
        }

        // Call the handler
        try {
            handler(event);
        } catch (error) {
            console.error('Error in postMessage handler:', error);
        }
    };
}

/**
 * Wait for bridge initialization with timeout
 */
export function waitForBridge<T>(
    getter: () => T | undefined,
    timeout: number = 5000
): Promise<T> {
    return new Promise((resolve, reject) => {
        const start = Date.now();
        const interval = setInterval(() => {
            const value = getter();
            if (value) {
                clearInterval(interval);
                resolve(value);
            } else if (Date.now() - start > timeout) {
                clearInterval(interval);
                reject(new Error('Bridge initialization timeout'));
            }
        }, 50);
    });
}

/**
 * Safe bridge initialization
 */
export function safeBridgeInit(
    bridgeName: string,
    initFn: (bridge: any) => void,
    timeout: number = 5000
): void {
    const bridge = (window as any)[bridgeName];

    if (bridge?.register) {
        try {
            initFn(bridge);
        } catch (error) {
            console.error(`Error initializing ${bridgeName}:`, error);
        }
    } else {
        console.debug(`${bridgeName} not ready, waiting...`);

        waitForBridge(() => (window as any)[bridgeName])
            .then((bridge) => {
                if (bridge?.register) {
                    initFn(bridge);
                }
            })
            .catch((error) => {
                console.debug(`${bridgeName} initialization failed:`, error.message);
            });
    }
}
