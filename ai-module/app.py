from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import cv2
import base64
import numpy as np
from pose_detector import PoseDetector
from rep_counter import RepCounter
from pydantic import BaseModel
import time

app = FastAPI()

# Security: CORS for frontend connection + Rate limiting (middleware placeholder)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # TODO: Restrict in prod to frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class FrameData(BaseModel):
    # Base64 encoded image
    frame: str
    exercise: str

detector = PoseDetector()

@app.get("/")
def health_check():
    return {"status": "AI Module Online", "version": "1.0.0"}

# WebSocket approach to ensure MINIMAL LATENCY (user requested)
@app.websocket("/ws/workout")
async def websocket_workout(websocket: WebSocket):
    await websocket.accept()
    
    # Initialize a clean session
    rep_counter = RepCounter("PUSHUP")
    
    try:
        while True:
            # Receive base64 frame from Frontend
            data = await websocket.receive_text()
            
            # Usually front end sends data:image/jpeg;base64,...
            if "," in data:
                b64_data = data.split(",")[1]
            else:
                b64_data = data
                
            img_data = base64.b64decode(b64_data)
            nparr = np.frombuffer(img_data, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if img is not None:
                # Process the frame via MediaPipe
                processed_img = detector.find_pose(img, draw=True)
                landmarks = detector.get_landmarks(processed_img)

                # Initialize defaults
                count = rep_counter.counter
                posture = "NO DETECTION"
                speed = rep_counter.get_avg_speed()
                stage = rep_counter.stage

                # If body is detected, calculate angles
                if len(landmarks) > 0:
                    # MediaPipe indexing for key points
                    # Shoulders(11, 12), Elbows(13, 14), Wrists(15, 16), Hips(23, 24), Ankles(27, 28)
                    
                    # Compute using left arm for now: 11 (Shoulder), 13 (Elbow), 15 (Wrist)
                    l_shoulder = [landmarks[11][1], landmarks[11][2]]
                    l_elbow = [landmarks[13][1], landmarks[13][2]]
                    l_wrist = [landmarks[15][1], landmarks[15][2]]
                    
                    # Hip and Ankle for posture check
                    l_hip = [landmarks[23][1], landmarks[23][2]]
                    l_ankle = [landmarks[27][1], landmarks[27][2]]
                    
                    # 1. Posture Check
                    posture = rep_counter.check_posture(l_shoulder, l_hip, l_ankle)
                    
                    # 2. Count Reps based on Elbow angle
                    elbow_angle = rep_counter.calculate_angle(l_shoulder, l_elbow, l_wrist)
                    count = rep_counter.count_rep(elbow_angle)
                    stage = rep_counter.stage
                    
                # Convert processed frame back to base64
                _, buffer = cv2.imencode('.jpg', processed_img)
                response_b64 = base64.b64encode(buffer).decode('utf-8')
                
                # Send result directly back to React
                await websocket.send_json({
                    "frame": f"data:image/jpeg;base64,{response_b64}",
                    "count": count,
                    "posture_status": posture,  # 'GOOD' / 'FIX FORM'
                    "speed": speed,
                    "stage": stage
                })

    except WebSocketDisconnect:
        print("Frontend Client Disconnected!")
        # We can trigger final statistics push to Spring Boot API here using an API client later
