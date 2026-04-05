import os
import json
import time
from collections import Counter, defaultdict
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import cv2
import base64
import numpy as np
from pose_detector import PoseDetector
from rep_counter import RepCounter
from form_analyzer import FormAnalyzer

app = FastAPI()

# ─── SECURITY: In-memory rate limiter ────────────────────────────────────────
# Sliding-window counter per IP. Stores list of request timestamps.
# Limits:
#   WebSocket /ws/workout → 10 connections/min per IP
#   HTTP endpoints        → 30 requests/min per IP
_rate_store: dict = defaultdict(list)

def _is_rate_limited(ip: str, limit: int, window_secs: int = 60) -> bool:
    """Sliding window rate limiter. Returns True if the request should be blocked."""
    now = time.monotonic()
    # Keep only timestamps within the current window
    _rate_store[ip] = [t for t in _rate_store[ip] if now - t < window_secs]
    if len(_rate_store[ip]) >= limit:
        return True
    _rate_store[ip].append(now)
    return False



ALLOWED_ORIGIN = os.getenv("ALLOWED_ORIGIN", "http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[ALLOWED_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Skeleton connection colors based on joint feedback ──────────────────────
# MediaPipe connection pairs that relate to each joint label
JOINT_CONNECTION_MAP = {
    "elbow":  [(11, 13), (13, 15), (12, 14), (14, 16)],
    "knee":   [(23, 25), (25, 27), (24, 26), (26, 28)],
    "hip":    [(11, 23), (12, 24), (23, 25), (24, 26)],
    "spine":  [(11, 23), (12, 24), (23, 27), (24, 28)],
    "shoulder": [(11, 12), (11, 13), (12, 14)],
}

STATUS_COLOR = {
    "GOOD": (34, 197, 94),   # green
    "WARN": (245, 158, 11),  # amber
    "BAD":  (239, 68, 68),   # red
}


def build_connection_colors(feedbacks: list) -> dict:
    """Map skeleton connection pairs to their joint status color."""
    colors = {}
    for fb in feedbacks:
        color = STATUS_COLOR.get(fb.status, (34, 197, 94))
        for pair in JOINT_CONNECTION_MAP.get(fb.joint, []):
            colors[pair] = color
    return colors


@app.get("/")
def health_check(request: Request):
    # SECURITY: Rate limit health checks to prevent info-gathering probes
    ip = request.client.host if request.client else "unknown"
    if _is_rate_limited(ip, limit=30, window_secs=60):
        raise HTTPException(status_code=429, detail="Rate limit exceeded. Please wait before retrying.")
    return {"status": "AI Module Online", "version": "2.0.0"}


@app.websocket("/ws/workout")
async def websocket_workout(websocket: WebSocket):
    """
    WebSocket endpoint for real-time rep counting + pose correction.

    Protocol:
    1. Client sends first message as JSON handshake:
       {"type": "init", "exercise": "PUSHUP" | "SQUAT" | "CURL" | "PULLUP"}
    2. All subsequent messages are raw base64 image frames.
    3. Server responds with extended JSON including form_feedback and form_score.
    """
    # SECURITY: Rate limit before accepting the WebSocket upgrade
    # 10 connections per minute per IP prevents WebSocket flood attacks
    ip = websocket.client.host if websocket.client else "unknown"
    if _is_rate_limited(ip, limit=10, window_secs=60):
        # 1008 = Policy Violation — the correct WS close code for rate limiting (RFC 6455)
        await websocket.close(code=1008, reason="Rate limit exceeded")
        return

    await websocket.accept()

    exercise_type = "PUSHUP"
    rep_counter = None
    detector = PoseDetector()
    form_analyzer = FormAnalyzer()
    mistake_counter: Counter = Counter()

    try:
        while True:
            data = await websocket.receive_text()

            # ── Handshake ──────────────────────────────────────────────────
            try:
                parsed = json.loads(data)
                if parsed.get("type") == "init":
                    exercise_type = parsed.get("exercise", "PUSHUP").upper()
                    rep_counter = RepCounter(exercise_type)
                    form_analyzer.reset()
                    mistake_counter.clear()
                    print(f"[AI] Session initialised for exercise: {exercise_type}")
                    await websocket.send_json({"type": "ack", "exercise": exercise_type})
                    continue

                # Client can request set summary
                if parsed.get("type") == "set_summary":
                    set_score = form_analyzer.get_set_score()
                    most_common = mistake_counter.most_common(1)
                    tip = most_common[0][0] if most_common else "Keep pushing — great work!"
                    await websocket.send_json({
                        "type": "set_summary",
                        "set_score": set_score,
                        "most_common_mistake": tip,
                    })
                    continue

            except (json.JSONDecodeError, TypeError):
                pass  # Not JSON → treat as a frame

            # Lazily initialise rep_counter
            if rep_counter is None:
                rep_counter = RepCounter(exercise_type)

            # ── Frame processing ───────────────────────────────────────────
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

            # Run pose detection (throttled to 15fps internally)
            analysis = detector.analyze_frame(img, draw=False, max_fps=15, confidence_threshold=0.7)
            landmarks = analysis.landmarks

            # Defaults
            count = rep_counter.counter if rep_counter else 0
            posture = "NO DETECTION"
            speed = rep_counter.get_avg_speed() if rep_counter else 0
            stage = rep_counter.stage if rep_counter else "NEUTRAL"
            form_feedbacks = []
            form_score = 0.0
            connection_colors = {}

            if landmarks and analysis.processable:
                l_shoulder = [landmarks[11]["x"], landmarks[11]["y"]]
                l_elbow    = [landmarks[13]["x"], landmarks[13]["y"]]
                l_wrist    = [landmarks[15]["x"], landmarks[15]["y"]]
                l_hip      = [landmarks[23]["x"], landmarks[23]["y"]]
                l_knee     = [landmarks[25]["x"], landmarks[25]["y"]]
                l_ankle    = [landmarks[27]["x"], landmarks[27]["y"]]

                posture = rep_counter.check_posture(l_shoulder, l_hip, l_ankle)

                # Rep counting
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
                speed = rep_counter.get_avg_speed()

                # ── Form correction ─────────────────────────────────────────
                form_result = form_analyzer.analyze(landmarks, exercise_type, stage)
                form_feedbacks = [
                    {"joint": fb.joint, "status": fb.status, "cue": fb.cue, "angle": fb.angle}
                    for fb in form_result.feedbacks
                ]
                form_score = form_result.form_score

                # Track most common mistakes for post-set summary
                for fb in form_result.feedbacks:
                    if fb.status in ("WARN", "BAD"):
                        mistake_counter[fb.cue] += 1

                # Build per-connection color map for skeleton overlay
                connection_colors = build_connection_colors(form_result.feedbacks)

            elif analysis.tracking_lost:
                posture = "TRACKING LOST"
            else:
                posture = "LOW CONFIDENCE"

            # ── Draw skeleton with correction colors ────────────────────────
            processed_img = img.copy()
            if landmarks:
                detector.draw_landmarks(processed_img, landmarks, connection_colors=connection_colors)

            _, buffer = cv2.imencode(".jpg", processed_img)
            response_b64 = base64.b64encode(buffer).decode("utf-8")

            await websocket.send_json({
                "frame": f"data:image/jpeg;base64,{response_b64}",
                "count": count,
                "posture_status": posture,
                "speed": speed,
                "stage": stage,
                "pose_confidence": analysis.confidence,
                "tracking_lost": analysis.tracking_lost,
                "used_cached_landmarks": analysis.used_cache,
                "processed_frame": analysis.processed,
                # New form correction fields
                "form_feedback": form_feedbacks,
                "form_score": form_score,
            })

    except WebSocketDisconnect:
        print(f"[AI] Client disconnected (exercise: {exercise_type})")
