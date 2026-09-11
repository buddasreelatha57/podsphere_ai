import { spawn } from "child_process";
import ffmpegPath from "ffmpeg-static";

/**
 * Extracts audio from a video (or copies audio from an audio file) to mp3.
 * Uses spawnSync directly instead of fluent-ffmpeg to avoid Windows path issues.
 */
export const extractAudio = (
    video: string,
    output: string
): Promise<void> => {
    return new Promise((resolve, reject) => {
        const args = [
            "-y",               // overwrite output without prompting
            "-i", video,        // input file
            "-vn",              // no video stream
            "-acodec", "libmp3lame",
            "-q:a", "2",        // quality
            output,             // output file
        ];

        const proc = spawn(ffmpegPath!, args, { stdio: ["ignore", "ignore", "pipe"] });

        let errOutput = "";
        proc.stderr?.on("data", (chunk: Buffer) => {
            errOutput += chunk.toString();
        });

        proc.on("close", (code) => {
            if (code === 0) {
                resolve();
            } else if (errOutput.includes("Output file does not contain any stream") || errOutput.includes("does not contain any stream")) {
                console.log("[FFmpeg] No audio stream found in video. Generating a silent dummy audio file.");
                // Generate a 1-second silent MP3 so the pipeline doesn't crash
                const silentArgs = [
                    "-y",
                    "-f", "lavfi",
                    "-i", "anullsrc=r=44100:cl=mono",
                    "-t", "1",
                    "-q:a", "9",
                    "-acodec", "libmp3lame",
                    output
                ];
                const silentProc = spawn(ffmpegPath!, silentArgs, { stdio: ["ignore", "ignore", "ignore"] });
                silentProc.on("close", (silentCode) => {
                    if (silentCode === 0) resolve();
                    else reject(new Error(`ffmpeg silent gen failed with code ${silentCode}`));
                });
            } else {
                reject(new Error(`ffmpeg exited with code ${code}: ${errOutput.slice(-500)}`));
            }
        });

        proc.on("error", (err) => {
            reject(new Error(`Failed to start ffmpeg: ${err.message}`));
        });
    });
};

/**
 * Compresses a video to 720p and lowers the bitrate to save space.
 * Uses spawn directly to avoid fluent-ffmpeg path issues.
 */
export const compressVideo = (
    input: string,
    output: string
): Promise<void> => {
    return new Promise((resolve, reject) => {
        const args = [
            "-y",                   // overwrite output without prompting
            "-i", input,            // input file
            "-vf", "scale=-2:720",  // scale to 720p keeping aspect ratio
            "-vcodec", "libx264",   // h264 codec
            "-crf", "28",           // compression rate (higher = more compression, lower quality)
            "-preset", "fast",      // encoding speed
            "-acodec", "aac",       // standard audio codec
            "-b:a", "128k",         // standard audio bitrate
            output                  // output file
        ];

        const proc = spawn(ffmpegPath!, args, { stdio: ["ignore", "ignore", "pipe"] });

        let errOutput = "";
        proc.stderr?.on("data", (chunk: Buffer) => {
            errOutput += chunk.toString();
        });

        proc.on("close", (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`ffmpeg compression exited with code ${code}: ${errOutput.slice(-500)}`));
            }
        });

        proc.on("error", (err) => {
            reject(new Error(`Failed to start ffmpeg compression: ${err.message}`));
        });
    });
};