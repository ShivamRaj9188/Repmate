from dataclasses import dataclass
import numpy as np
import time


@dataclass(frozen=True)
class ExerciseThresholds:
    down_enter: float
    up_enter: float
    neutral_min: float
    neutral_max: float
    down_when: str


class RepCounter:
    """
    Counts reps with a debounced state machine.

    State machine:
      NEUTRAL -> DOWN -> UP -> +1 rep

    A rep is only counted when the movement reaches the full completion phase.
    Returning to NEUTRAL or dropping back into DOWN never increments the counter.
    """

    EXERCISE_THRESHOLDS = {
        "PUSHUP": ExerciseThresholds(down_enter=92, up_enter=158, neutral_min=115, neutral_max=150, down_when="low"),
        "SQUAT": ExerciseThresholds(down_enter=95, up_enter=162, neutral_min=118, neutral_max=150, down_when="low"),
        "CURL": ExerciseThresholds(down_enter=152, up_enter=52, neutral_min=80, neutral_max=132, down_when="high"),
        "PULLUP": ExerciseThresholds(down_enter=155, up_enter=72, neutral_min=92, neutral_max=138, down_when="high"),
    }

    def __init__(
        self,
        exercise_type="PUSHUP",
        smoothing_alpha=0.35,
        debounce_frames=2,
        min_rep_time=0.45,
        time_provider=None,
    ):
        self.exercise_type = exercise_type.upper()
        if self.exercise_type not in self.EXERCISE_THRESHOLDS:
            raise ValueError(f"Unsupported exercise type: {self.exercise_type}")

        self.stage = "NEUTRAL"
        self.counter = 0
        self.prev_time = None
        self.history_speeds = []
        self.smoothed_angle = None
        self.current_angle = None

        self.smoothing_alpha = smoothing_alpha
        self.debounce_frames = debounce_frames
        self.min_rep_time = min_rep_time
        self.time_provider = time_provider or time.time

        self._candidate_stage = None
        self._candidate_frames = 0
        self._last_rep_timestamp = None

    def calculate_angle(self, a, b, c):
        """Calculate angle (degrees) at vertex b formed by points a, b, c."""
        a = np.array(a)
        b = np.array(b)
        c = np.array(c)

        radians = np.arctan2(c[1] - b[1], c[0] - b[0]) - np.arctan2(a[1] - b[1], a[0] - b[0])
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
        """Update the movement state machine and return the current rep count."""
        if joint_angle is None:
            return self.counter

        angle = self._smooth_angle(joint_angle)
        self.current_angle = angle

        classified_stage = self._classify_stage(angle)
        if classified_stage is None:
            self._reset_candidate_stage()
            return self.counter

        self._update_candidate_stage(classified_stage)
        if self._candidate_frames < self.debounce_frames:
            return self.counter

        self._transition_to(classified_stage)
        return self.counter

    def _smooth_angle(self, joint_angle):
        if self.smoothed_angle is None:
            self.smoothed_angle = joint_angle
        else:
            alpha = self.smoothing_alpha
            self.smoothed_angle = alpha * joint_angle + (1 - alpha) * self.smoothed_angle
        return self.smoothed_angle

    def _classify_stage(self, angle):
        thresholds = self.EXERCISE_THRESHOLDS[self.exercise_type]
        if thresholds.down_when == "low":
            if angle <= thresholds.down_enter:
                return "DOWN"
            if angle >= thresholds.up_enter:
                return "UP"
        else:
            if angle >= thresholds.down_enter:
                return "DOWN"
            if angle <= thresholds.up_enter:
                return "UP"

        if thresholds.neutral_min <= angle <= thresholds.neutral_max:
            return "NEUTRAL"
        return None

    def _update_candidate_stage(self, classified_stage):
        if classified_stage == self.stage:
            self._reset_candidate_stage()
            return

        if classified_stage == self._candidate_stage:
            self._candidate_frames += 1
        else:
            self._candidate_stage = classified_stage
            self._candidate_frames = 1

    def _reset_candidate_stage(self):
        self._candidate_stage = None
        self._candidate_frames = 0

    def _transition_to(self, next_stage):
        if next_stage == self.stage:
            self._reset_candidate_stage()
            return

        if self.stage == "NEUTRAL":
            if next_stage == "DOWN":
                self.stage = "DOWN"
        elif self.stage == "DOWN":
            if next_stage == "UP" and self._can_count_rep():
                self.stage = "UP"
                self.counter += 1
                self._record_speed()
            elif next_stage == "NEUTRAL":
                self.stage = "NEUTRAL"
        elif self.stage == "UP":
            if next_stage in {"NEUTRAL", "DOWN"}:
                self.stage = next_stage

        self._reset_candidate_stage()

    def _can_count_rep(self):
        now = self.time_provider()
        if self._last_rep_timestamp is None:
            self._last_rep_timestamp = now
            return True
        if now - self._last_rep_timestamp < self.min_rep_time:
            return False
        self._last_rep_timestamp = now
        return True

    def _record_speed(self):
        current_time = self.time_provider()
        if self.prev_time is not None:
            elapsed = current_time - self.prev_time
            self.history_speeds.append(round(elapsed, 2))
        self.prev_time = current_time

    def get_avg_speed(self):
        if not self.history_speeds:
            return 0
        return round(sum(self.history_speeds) / len(self.history_speeds), 2)
