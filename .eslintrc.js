module.exports = {
    // "extends": "airbnb-base",
    // "plugins": [
    //     "import"
    // ],
    "env": {
        "es6": true,
        "browser": true,
        "node": true
    },
    "globals": {
        "PIXI": true,
        "Stats": true
    },
    "rules": {
        "no-debugger": 1,
        "no-dupe-args": 1,
        "no-dupe-keys": 1,
        "no-dupe-class-members": 1,
        "no-var": 0,
        "semi": [0, "always"],
        "prefer-const": 1,
        "no-undef": 1,
        "no-undef-init": 1,

    //     "no-console": [
    //         0
    //     ],
    //     "space-before-function-paren": [
    //         0
    //     ]
    }
};
