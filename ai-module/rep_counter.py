import numpy as np
import time

class RepCounter:
    def __init__(self, exercise_type="PUSHUP"):
        self.exercise_type = exercise_type
        self.stage = None
        self.counter = 0
        self.prev_time = time.time()
        self.history_speeds = []

    def calculate_angle(self, a, b, c):
        """Calculate angle between three points (a, b, c). Point b is the vertex."""
        a = np.array(a) # First
        b = np.array(b) # Mid
        c = np.array(c) # End
        
        # Calculate angle
        radians = np.arctan2(c[1]-b[1], c[0]-b[0]) - \
                  np.arctan2(a[1]-b[1], a[0]-b[0])
        
        angle = np.abs(radians * 180.0 / np.pi)
        
        if angle > 180.0:
            angle = 360 - angle
            
        return angle

    def check_posture(self, shoulder, hip, ankle):
        """Checks if posture is straight for pushups/planks."""
        angle = self.calculate_angle(shoulder, hip, ankle)
        # Should be a straight line (~180 degrees)
        return "GOOD" if angle > 160 else "FIX FORM"

    def count_rep(self, elbow_angle):
        """Logic for counting pushups currently."""
        if self.exercise_type == "PUSHUP":
            if elbow_angle > 160:
                self.stage = "UP"
            if elbow_angle < 90 and self.stage == "UP":
                self.stage = "DOWN"
                self.counter += 1
                self._record_speed()

        return self.counter

    def _record_speed(self):
        current_time = time.time()
        speed = current_time - self.prev_time
        self.prev_time = current_time
        self.history_speeds.append(round(speed, 2))

    def get_avg_speed(self):
        if not self.history_speeds:
            return 0
        return round(sum(self.history_speeds) / len(self.history_speeds), 2)
