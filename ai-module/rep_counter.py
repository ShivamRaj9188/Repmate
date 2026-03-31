import numpy as np
import time


class RepCounter:
    """
    RepCounter supports PUSHUP and SQUAT exercise types.

    PUSHUP: counts using elbow angle (arm extension/flexion)
      - DOWN stage: elbow_angle < 90 (arms bent)
      - UP stage: elbow_angle > 160 (arms extended) → rep counted

    SQUAT: counts using knee angle (leg extension/flexion)
      - DOWN stage: knee_angle < 90 (legs bent / squatting)
      - UP stage: knee_angle > 160 (legs extended / standing) → rep counted

    CURL: counts using elbow angle (bicep flexion)
      - UP stage: elbow_angle < 45 (arms curled)
      - DOWN stage: elbow_angle > 160 (arms extended) → rep counted

    PULLUP: counts using elbow angle (arm flexion/extension)
      - UP stage: elbow_angle < 70 (chin above bar)
      - DOWN stage: elbow_angle > 160 (arms fully extended) → rep counted
    """

    def __init__(self, exercise_type="PUSHUP"):
        self.exercise_type = exercise_type.upper()
        self.stage = None
        self.counter = 0
        self.prev_time = time.time()
        self.history_speeds = []

    def calculate_angle(self, a, b, c):
        """Calculate angle (degrees) at vertex b formed by points a, b, c."""
        a = np.array(a)
        b = np.array(b)
        c = np.array(c)

        radians = np.arctan2(c[1] - b[1], c[0] - b[0]) - \
                  np.arctan2(a[1] - b[1], a[0] - b[0])

        angle = np.abs(radians * 180.0 / np.pi)
        if angle > 180.0:
            angle = 360 - angle

        return angle

    def check_posture(self, shoulder, hip, ankle):
        """
        Checks if body alignment is straight (good for pushups and squats).
        Shoulder→Hip→Ankle should be close to 180° for a straight posture.
        """
        angle = self.calculate_angle(shoulder, hip, ankle)
        return "GOOD" if angle > 160 else "FIX FORM"

    def count_rep(self, joint_angle):
        """
        Counts a rep based on the primary joint angle for the exercise type.
        Supports: PUSHUP, SQUAT, CURL, PULLUP.
        """
        # --- EMA Smoothing ---
        alpha = 0.3 # 30% new value, 70% history for strong stability
        if not hasattr(self, 'smoothed_angle') or self.smoothed_angle is None:
            self.smoothed_angle = joint_angle
        else:
            self.smoothed_angle = alpha * joint_angle + (1 - alpha) * self.smoothed_angle
            
        angle = self.smoothed_angle

        # --- Logic: Count on full range completion ---
        if self.exercise_type == "PUSHUP":
            if angle < 90:
                self.stage = "DOWN"
            if angle > 160 and self.stage == "DOWN":
                self.stage = "UP"
                self.counter += 1
                self._record_speed()

        elif self.exercise_type == "SQUAT":
            if angle < 90:
                self.stage = "DOWN"
            if angle > 160 and self.stage == "DOWN":
                self.stage = "UP"
                self.counter += 1
                self._record_speed()

        elif self.exercise_type == "CURL":
            if angle < 45:
                self.stage = "UP"
            if angle > 160 and self.stage == "UP":
                self.stage = "DOWN"
                self.counter += 1
                self._record_speed()

        elif self.exercise_type == "PULLUP":
            if angle < 70:
                self.stage = "UP"
            if angle > 160 and self.stage == "UP":
                self.stage = "DOWN"
                self.counter += 1
                self._record_speed()
        return self.counter

    def _record_speed(self):
        current_time = time.time()
        elapsed = current_time - self.prev_time
        self.prev_time = current_time
        self.history_speeds.append(round(elapsed, 2))

    def get_avg_speed(self):
        if not self.history_speeds:
            return 0
        return round(sum(self.history_speeds) / len(self.history_speeds), 2)
