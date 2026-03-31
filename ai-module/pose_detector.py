import cv2
import mediapipe as mp
import numpy as np
import ssl
ssl._create_default_https_context = ssl._create_unverified_context

class PoseDetector:
    def __init__(self, static_image_mode=False, model_complexity=0, 
                 smooth_landmarks=True, min_detection_confidence=0.5, 
                 min_tracking_confidence=0.5):
        self.mp_pose = mp.solutions.pose
        self.mp_drawing = mp.solutions.drawing_utils
        self.mp_drawing_styles = mp.solutions.drawing_styles
        
        self.pose = self.mp_pose.Pose(
            static_image_mode=static_image_mode,
            model_complexity=model_complexity,
            smooth_landmarks=smooth_landmarks,
            min_detection_confidence=min_detection_confidence,
            min_tracking_confidence=min_tracking_confidence
        )

    def find_pose(self, img, draw=True):
        """Processes an image and returns landmarks and the image with drawn skeletons."""
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        self.results = self.pose.process(img_rgb)
        
        if self.results.pose_landmarks and draw:
            # Custom styling for neon-like dark theme compatibility
            custom_style = self.mp_drawing.DrawingSpec(color=(124, 58, 237), thickness=2, circle_radius=2)
            custom_connections = self.mp_drawing.DrawingSpec(color=(34, 197, 94), thickness=2, circle_radius=2)
            
            self.mp_drawing.draw_landmarks(
                img, 
                self.results.pose_landmarks, 
                self.mp_pose.POSE_CONNECTIONS,
                custom_style,
                custom_connections
            )
        return img

    def get_landmarks(self, img):
        """Returns a list of specific landmark coordinates."""
        landmarks = []
        if self.results.pose_landmarks:
            for id, lm in enumerate(self.results.pose_landmarks.landmark):
                h, w, c = img.shape
                # Store normalized coordinates
                landmarks.append([id, lm.x, lm.y, lm.visibility])
        return landmarks
