const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const path = require('path');
const fs = require('fs');

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const processVideo = (inputPath, outputDir, videoId) => {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const masterPlaylistPath = path.join(outputDir, 'master.m3u8');

        ffmpeg(inputPath, { timeout: 432000 })
            .addOptions([
                '-profile:v baseline',
                '-level 3.0',
                '-start_number 0',
                '-hls_time 10',
                '-hls_list_size 0',
                '-f hls'
            ])
            .output(path.join(outputDir, '1080p.m3u8'))
            .videoCodec('libx264')
            .audioCodec('aac')
            .size('1920x1080')
            .output(path.join(outputDir, '720p.m3u8'))
            .videoCodec('libx264')
            .audioCodec('aac')
            .size('1280x720')
            .output(path.join(outputDir, '480p.m3u8'))
            .videoCodec('libx264')
            .audioCodec('aac')
            .size('854x480')
            .output(path.join(outputDir, '360p.m3u8'))
            .videoCodec('libx264')
            .audioCodec('aac')
            .size('640x360')
            .output(path.join(outputDir, '144p.m3u8'))
            .videoCodec('libx264')
            .audioCodec('aac')
            .size('256x144')
            .on('end', () => {
                // Create master playlist with all quality levels
                const masterContent = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-STREAM-INF:BANDWIDTH=5000000,RESOLUTION=1920x1080
1080p.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=2800000,RESOLUTION=1280x720
720p.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=1400000,RESOLUTION=854x480
480p.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=640x360
360p.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=200000,RESOLUTION=256x144
144p.m3u8`;
                fs.writeFileSync(masterPlaylistPath, masterContent);
                resolve(masterPlaylistPath);
            })
            .on('error', (err) => {
                console.error('Error processing video:', err);
                reject(err);
            })
            .run();
    });
};

module.exports = { processVideo };
