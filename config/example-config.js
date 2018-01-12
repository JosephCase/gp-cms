module.exports = {
    port: 8888,
    reqTimeout: 600000,
    apiHost: "http://localhost:8081",
    contentDirectory: '/content/',
    imagePreviewSize: '500',
    videoFormats: [{"ext": "mp4", "codec": "libx264"}, {"ext": "webm", "codec": "libvpx"}],
}
