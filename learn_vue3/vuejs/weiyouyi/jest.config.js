module.exports = {
    transform: {
        '^.+\\.js$': 'babel-jest', // babel-jest处理js或jsx
    },
    testMatch: ['**/?(*.)+(spec).[jt]s?(x)'],
    collectCoverage: true,
    coverageReporters: ['json', 'html']
};
