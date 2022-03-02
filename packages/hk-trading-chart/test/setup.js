const navigator = {}

Object.defineProperty(window, 'navigator', {
    value: navigator,
    writable: true
})

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // Deprecated
        removeListener: jest.fn(), // Deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
})

// Object.defineProperty(window, 'getComputedStyle', {
//     value: () => {
//       return {
//         getPropertyValue: () => {}
//       }
//     }
//   })