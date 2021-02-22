module.exports = {
    devServer: {
        host: 'localhost',
        port: '8888',
        https: false,
        open: true,
        // proxy: {
        //     [process.env.VUE_APP_BASE_URL]: {
        //         target: process.env.VUE_APP_SERVICE_URL,
        //         changeOrigin: true,
        //         pathRewrite: {
        //             ['^' + process.env.VUE_APP_BASE_URL]: ''
        //         }
        //     }
        // }
    },
    lintOnSave: false,     
    productionSourceMap: false
}