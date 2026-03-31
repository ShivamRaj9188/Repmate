import numpy as np
import time


class RepCounter:
    """
    RepCounter supports PUSHUP and SQUAT exercise types.

    PUSHUP: counts using elbow angle (arm extension/flexion)
      - UP stage: elbow_angle > 160 (arms extended)
      - DOWN stage: elbow_angle < 90 (arms bent) → rep counted

    SQUAT: counts using knee angle (leg extension/flexion)
      - UP stage: knee_angle > 160 (legs extended / standing)
      - DOWN stage: knee_angle < 90 (legs bent / squatting) → rep counted
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
          - PUSHUP uses elbow angle
          - SQUAT uses knee angle
        Both use the same two-stage (UP → DOWN) state machine.
        """
        if self.exercise_type in ("PUSHUP", "SQUAT"):
            if joint_angle > 160:
                self.stage = "UP"
            if joint_angle < 90 and self.stage == "UP":
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
