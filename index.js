import express from "express";
import dotenv from "dotenv";
import multer from "multer";
import parseMeetingNotes from "./utils/extract.js";
import timeout from "connect-timeout";

dotenv.config();

const server = express();
const port = process.env.port;
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.originalname.endsWith(".txt")) {
      cb(null, true);
    } else {
      cb(new multer.MulterError("File type mismatch"), false);
    }
  },
});

server.use(express.json());

// Home Route
server.get("/", (req, res) => {
  res.send("hello world");
});

function haltOnTimedout(req, res, next) {
  if (req.timedout) {
    return res.status(408).json({
      error: "Request Timeout",
      message: "Request timed out",
    });
  }
  next();
}

// Meeting processing Route
server.post(
  "/process-meeting",
  timeout("150s"),
  upload.single("file"),
  haltOnTimedout,
  async (req, res) => {
    try {
      // const filecontent = req.file.buffer.toString("utf-8");
      let filecontent = "";

      if (req.file) {
        filecontent = req.file.buffer.toString("utf-8");
      } else if (req.body && req.body.file) {
        filecontent = req.body.file;
      }

      if (!filecontent.trim()) {
        return res.status(400).json({
          error: "Empty input",
          message: "The provided file is empty",
        });
      }

      const response = await parseMeetingNotes(filecontent);

      let parsedResponse;
      try {
        parsedResponse =
          typeof response === "string" ? JSON.parse(response) : response;
      } catch (parseError) {
        throw new Error("Failed to parse response:", parseError);
      }
      return res.status(200).send(parsedResponse);
    } catch (error) {
      if (req.timedout) {
        return;
      }
      console.log(error);

      if (error.message.includes("Token limit exceeded")) {
        return res.status(400).json({
          error: "Content too large",
          message: error.message,
        });
      }
      if (error.message.includes("Failed to count tokens")) {
        return res.status(400).json({
          error: "Failed to count tokens",
          message: error.message,
        });
      }

      if (error.message.includes("Failed to parse")) {
        return res.status(500).json({
          error: "Response parsing failed",
          message: "Invalid response generated ",
        });
      }

      if (error.message.includes("Bad Request")) {
        return res.status(400).json({
          error: "Bad request",
          message: error.message,
        });
      }
      if (error.message.includes("Rate limit exceeded")) {
        return res.status(429).json({
          error: "Rate limit exceeded",
          message: "Too many requests. Please try again later.",
        });
      }
      if (error.message.includes("Request was cancelled")) {
        return res.status(499).json({
          error: "Request cancelled",
          message: "Request was cancelled by client.",
        });
      }

      if (error.message.includes("Internal server error")) {
        return res.status(500).json({
          error: "Internal server error",
          message: "Internal server error. Please retry after a few seconds.",
        });
      }
      if (error.message.includes("Network error")) {
        return res.status(503).json({
          error: "Service unavailable",
          message: "Unable to connect. Please try again later.",
        });
      }

      if (error.message.includes("Request timeout")) {
        return res.status(504).send({
          error: "Request Timeout",
          message: "Request timeout",
        });
      }
      return res.status(500).json({
        error: "Processing failed",
        message:
          "An unexpected error occurred while processing your meeting notes.",
      });
    }
  }
);

server.use((error, req, res, next) => {
  console.log(error);
  if (error instanceof multer.MulterError) {
    if (error.code === "File type mismatch") {
      return res.status(400).send({
        error: "Invalid file type",
        message: "The provided file must be of .txt format",
      });
    }
  }
  if (error.code == "ETIMEDOUT") {
    return res.status(408).send({
      error: "Request Timeout",
      message: "Check your internet connection",
    });
  }

  return res.status(500).json({ error: "Internal server error" });
});

server.listen(port, () => {
  console.log(`Server started at PORT: ${port}`);
});
