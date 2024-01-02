module.exports = {
    apps: [{
        name: "Ganty",
        script: "./index.js",
        env: {
            NODE_ENV: "development",
        },
        env_production: {
            NODE_ENV: "production",
        }
    }
    ]
}