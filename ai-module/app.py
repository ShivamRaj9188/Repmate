import os
import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import cv2
import base64
import numpy as np
from pose_detector import PoseDetector
from rep_counter import RepCounter

app = FastAPI()

# Security: restrict CORS to the frontend origin only.
# Set ALLOWED_ORIGIN env var in production to your deployed frontend URL.
ALLOWED_ORIGIN = os.getenv("ALLOWED_ORIGIN", "http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[ALLOWED_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

detector = PoseDetector()

@app.get("/")
def health_check():
    return {"status": "AI Module Online", "version": "1.1.0"}


@app.websocket("/ws/workout")
async def websocket_workout(websocket: WebSocket):
    """
    WebSocket endpoint for real-time rep counting.

    Protocol (fix: exercise type was hardcoded to PUSHUP):
    1. Client sends first message as JSON handshake:
       {"type": "init", "exercise": "PUSHUP" | "SQUAT"}
    2. All subsequent messages are raw base64 image frames.
    3. Server responds with JSON: {frame, count, posture_status, speed, stage}
    """
    await websocket.accept()

    # Default exercise, overridden by the init handshake from the client
    exercise_type = "PUSHUP"
    rep_counter = None

    try:
        while True:
            data = await websocket.receive_text()

            # --- Handshake: first JSON message sets the exercise type ---
            try:
                parsed = json.loads(data)
                if parsed.get("type") == "init":
                    exercise_type = parsed.get("exercise", "PUSHUP").upper()
                    rep_counter = RepCounter(exercise_type)
                    print(f"[AI] Session initialised for exercise: {exercise_type}")
                    await websocket.send_json({"type": "ack", "exercise": exercise_type})
                    continue
            except (json.JSONDecodeError, TypeError):
                pass  # Not JSON → treat as a frame

            # Lazily initialise rep_counter in case init message was skipped
            if rep_counter is None:
                rep_counter = RepCounter(exercise_type)

            # --- Frame processing ---
            # Frontend sends: data:image/jpeg;base64,<data>
            if "," in data:
                b64_data = data.split(",")[1]
            else:
                b64_data = data

            try:
                img_data = base64.b64decode(b64_data)
                nparr = np.frombuffer(img_data, np.uint8)
                img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            except Exception as e:
                print(f"[AI] Frame decode error: {e}")
                continue

            if img is None:
                continue

            # Process the frame via MediaPipe
            processed_img = detector.find_pose(img, draw=True)
            landmarks = detector.get_landmarks(processed_img)

            # Defaults
            count = rep_counter.counter
            posture = "NO DETECTION"
            speed = rep_counter.get_avg_speed()
            stage = rep_counter.stage

            if len(landmarks) > 0:
                # MediaPipe landmark indices:
                # Shoulders(11,12), Elbows(13,14), Wrists(15,16)
                # Hips(23,24), Knees(25,26), Ankles(27,28)
                l_shoulder = [landmarks[11][1], landmarks[11][2]]
                l_elbow    = [landmarks[13][1], landmarks[13][2]]
                l_wrist    = [landmarks[15][1], landmarks[15][2]]
                l_hip      = [landmarks[23][1], landmarks[23][2]]
                l_knee     = [landmarks[25][1], landmarks[25][2]]
                l_ankle    = [landmarks[27][1], landmarks[27][2]]

                posture = rep_counter.check_posture(l_shoulder, l_hip, l_ankle)

                if exercise_type == "PUSHUP":
                    elbow_angle = rep_counter.calculate_angle(l_shoulder, l_elbow, l_wrist)
                    count = rep_counter.count_rep(elbow_angle)
                elif exercise_type == "SQUAT":
                    knee_angle = rep_counter.calculate_angle(l_hip, l_knee, l_ankle)
                    count = rep_counter.count_rep(knee_angle)
                elif exercise_type in ("CURL", "PULLUP"):
                    elbow_angle = rep_counter.calculate_angle(l_shoulder, l_elbow, l_wrist)
                    count = rep_counter.count_rep(elbow_angle)

                stage = rep_counter.stage

            # Encode processed frame back to base64
            _, buffer = cv2.imencode(".jpg", processed_img)
            response_b64 = base64.b64encode(buffer).decode("utf-8")

            await websocket.send_json({
                "frame": f"data:image/jpeg;base64,{response_b64}",
                "count": count,
                "posture_status": posture,
                "speed": speed,
                "stage": stage,
            })

    except WebSocketDisconnect:
        print(f"[AI] Client disconnected (exercise: {exercise_type})")
