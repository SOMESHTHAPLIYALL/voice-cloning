import { useState, useRef } from "react";
import { motion } from "framer-motion";
import axios from "axios";

const VoiceModal = ({ isOpen, onClose }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [conversionProgress, setConversionProgress] = useState(0);
  const [modelName, setModelName] = useState("");
  const [result, setResult] = useState(null);
  const [songCoverResult, setSongCoverResult] = useState(null);
  const [status, setStatus] = useState("idle"); // "idle", "uploading", "converting", "generating", "done"
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [isPlayingSongCover, setIsPlayingSongCover] = useState(false);
  const fileInputRef = useRef(null);
  const voiceAudioRef = useRef(null);
  const songCoverAudioRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      setStatus("uploading");
      const response = await axios.post(
        "http://127.0.0.1:8000/upload/audio",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const progress = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadProgress(progress);
            }
          },
        }
      );

      if (response.data.success) {
        await convertVoice(response.data.file_path);
      }
    } catch (error) {
      console.error("Upload failed:", error);
      setStatus("idle");
    }
  };

  const convertVoice = async (filePath) => {
    if (!modelName.trim()) {
      alert("Please enter a model name");
      setStatus("idle");
      return;
    }

    try {
      setStatus("converting");
      const response = await axios.post(
        "http://127.0.0.1:8000/generate/convert-voice",
        {
          voice_file: filePath,
          output_directory: "./outputs",
          model_name: modelName,
        }
      );

      if (response.data.success) {
        setResult(response.data);
        await generateSongCover(filePath);
      }
    } catch (error) {
      console.error("Conversion failed:", error);
      setStatus("idle");
    }
  };

  const generateSongCover = async (filePath) => {
    try {
      setStatus("generating");
      const response = await axios.post(
        "http://127.0.0.1:8000/generate/song-cover",
        {
          source: filePath,
          model_name: modelName,
          options: {
            n_octaves: 0,
            n_semitones: 0,
            f0_method: "rmvpe",
            index_rate: 0.3,
            rms_mix_rate: 1.0,
            protect_rate: 0.33,
            hop_length: 128,
            split_vocals: false,
            autotune_vocals: true,
            autotune_strength: 1.0,
            clean_vocals: true,
            clean_strength: 0.7,
            embedder_model: "contentvec",
            custom_embedder_model: null,
            sid: 0,
            room_size: 0.15,
            wet_level: 0.2,
            dry_level: 0.8,
            damping: 0.7,
            main_gain: 0,
            inst_gain: 0,
            backup_gain: 0,
            output_sr: 44100,
            output_format: "mp3",
            output_name: "song_cover",
          },
        }
      );

      if (response.data.success) {
        setSongCoverResult(response.data);
        setStatus("done");
      }
    } catch (error) {
      console.error("Song cover generation failed:", error);
      setStatus("idle");
    }
  };

  const handleDownload = (fileUrl, filename) => {
    if (fileUrl) {
      const downloadUrl = `http://127.0.0.1:8000${fileUrl}`;
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handlePlayVoiceAudio = () => {
    if (result?.file_url) {
      const audioUrl = `http://127.0.0.1:8000${result.file_url}`;

      if (!voiceAudioRef.current) {
        voiceAudioRef.current = new Audio(audioUrl);
      }

      if (isPlayingVoice) {
        voiceAudioRef.current.pause();
        setIsPlayingVoice(false);
      } else {
        // Stop song cover if playing
        if (isPlayingSongCover && songCoverAudioRef.current) {
          songCoverAudioRef.current.pause();
          setIsPlayingSongCover(false);
        }

        voiceAudioRef.current
          .play()
          .then(() => setIsPlayingVoice(true))
          .catch((e) => console.error("Audio playback failed:", e));

        // Set up event listener for when audio ends
        voiceAudioRef.current.onended = () => {
          setIsPlayingVoice(false);
        };
      }
    }
  };

  const handlePlaySongCoverAudio = () => {
    if (songCoverResult?.file_url) {
      const audioUrl = `http://127.0.0.1:8000${songCoverResult.file_url}`;

      if (!songCoverAudioRef.current) {
        songCoverAudioRef.current = new Audio(audioUrl);
      }

      if (isPlayingSongCover) {
        songCoverAudioRef.current.pause();
        setIsPlayingSongCover(false);
      } else {
        // Stop voice if playing
        if (isPlayingVoice && voiceAudioRef.current) {
          voiceAudioRef.current.pause();
          setIsPlayingVoice(false);
        }

        songCoverAudioRef.current
          .play()
          .then(() => setIsPlayingSongCover(true))
          .catch((e) => console.error("Audio playback failed:", e));

        // Set up event listener for when audio ends
        songCoverAudioRef.current.onended = () => {
          setIsPlayingSongCover(false);
        };
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-4xl bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-700"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="p-8">
          <h2 className="text-2xl font-bold text-white mb-6">
            Voice Conversion & Song Cover Generation
          </h2>

          {status === "idle" && (
            <div className="space-y-6">
              <div
                onClick={() => fileInputRef.current.click()}
                className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-indigo-500 transition-colors"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="audio/*"
                  className="hidden"
                />
                {selectedFile ? (
                  <div className="text-white">
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-gray-400 mt-2">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-800 mb-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-indigo-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                        />
                      </svg>
                    </div>
                    <p className="text-white font-medium">
                      Click to upload audio file
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      MP3, WAV, or other audio formats
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="modelName"
                  className="block text-sm font-medium text-gray-300"
                >
                  Convert to (Model Name)
                </label>
                <input
                  type="text"
                  id="modelName"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  placeholder="E.g. Eminem, CartoonCharacter, etc."
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                onClick={handleUpload}
                disabled={!selectedFile || !modelName.trim()}
                className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
                  !selectedFile || !modelName.trim()
                    ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white"
                }`}
              >
                Convert Voice & Generate Song Cover
              </button>
            </div>
          )}

          {(status === "uploading" ||
            status === "converting" ||
            status === "generating") && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gray-800 mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-indigo-500 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">
                  {status === "uploading" && "Uploading File"}
                  {status === "converting" && "Converting Voice"}
                  {status === "generating" && "Generating Song Cover"}
                </h3>
                <p className="text-gray-400">
                  {status === "uploading" &&
                    "Please wait while we upload your audio file..."}
                  {status === "converting" &&
                    `Transforming voice to ${modelName}...`}
                  {status === "generating" && "Creating your song cover..."}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-400">
                  <span>
                    {status === "uploading" && "Upload Progress"}
                    {status === "converting" && "Conversion Progress"}
                    {status === "generating" && "Generation Progress"}
                  </span>
                  <span>
                    {status === "uploading" && `${uploadProgress}%`}
                    {(status === "converting" || status === "generating") &&
                      `${conversionProgress}%`}
                  </span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2.5">
                  <div
                    className="bg-indigo-600 h-2.5 rounded-full"
                    style={{
                      width: `${
                        status === "uploading"
                          ? uploadProgress
                          : conversionProgress
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {status === "done" && result && songCoverResult && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-900/20 mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">
                  Processing Complete!
                </h3>
                <p className="text-gray-400">
                  Your voice has been successfully converted and song cover
                  generated.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-white mb-4">
                    Voice Conversion
                  </h4>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">File Name:</span>
                      <span className="text-sm text-white">
                        {result.filename}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">
                        Processing Time:
                      </span>
                      <span className="text-sm text-white">
                        {result.processing_time}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Format:</span>
                      <span className="text-sm text-white">
                        {result.details.format}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={handlePlayVoiceAudio}
                      className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium transition-colors flex items-center justify-center"
                    >
                      {isPlayingVoice ? (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Pause
                        </>
                      ) : (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Play
                        </>
                      )}
                    </button>
                    <button
                      onClick={() =>
                        handleDownload(result.file_url, result.filename)
                      }
                      className="flex-1 py-2 px-3 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium transition-colors flex items-center justify-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Download
                    </button>
                  </div>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-white mb-4">
                    Song Cover
                  </h4>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">File Name:</span>
                      <span className="text-sm text-white">
                        {songCoverResult.filename}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">
                        Processing Time:
                      </span>
                      <span className="text-sm text-white">
                        {songCoverResult.processing_time}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Format:</span>
                      <span className="text-sm text-white">
                        {songCoverResult.details.format}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={handlePlaySongCoverAudio}
                      className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium transition-colors flex items-center justify-center"
                    >
                      {isPlayingSongCover ? (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Pause
                        </>
                      ) : (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Play
                        </>
                      )}
                    </button>
                    <button
                      onClick={() =>
                        handleDownload(
                          songCoverResult.file_url,
                          songCoverResult.filename
                        )
                      }
                      className="flex-1 py-2 px-3 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium transition-colors flex items-center justify-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Download
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-md font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default VoiceModal;
