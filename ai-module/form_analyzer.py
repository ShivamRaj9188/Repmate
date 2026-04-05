"""
form_analyzer.py — Real-time pose correction rules for RepMate.

Each exercise has a set of rules. Each rule checks one joint angle and
returns: status ("GOOD" | "WARN" | "BAD"), a coaching cue string, and the
joint name (used to colour the skeleton overlay).

Rules are checked only when the rep is in the relevant phase (e.g. knee
angle at the bottom of a squat), so noisy top-of-movement frames don't
produce false warnings.
"""

from dataclasses import dataclass
from typing import Optional
import numpy as np


@dataclass
class JointFeedback:
    joint: str          # e.g. "left_knee"
    status: str         # "GOOD" | "WARN" | "BAD"
    cue: str            # human-readable coaching message
    angle: float        # actual measured angle


@dataclass
class FormAnalysis:
    feedbacks: list     # list[JointFeedback]
    form_score: float   # 0-100, average greenness this frame
    stage: str          # current movement stage


def _angle(a, b, c) -> float:
    """Angle in degrees at vertex b formed by points a→b→c."""
    a, b, c = np.array(a), np.array(b), np.array(c)
    radians = np.arctan2(c[1] - b[1], c[0] - b[0]) - np.arctan2(a[1] - b[1], a[0] - b[0])
    angle = abs(radians * 180.0 / np.pi)
    return 360 - angle if angle > 180 else angle


# ─── MediaPipe landmark indices (used in app.py) ──────────────────────────
# 11=left_shoulder, 12=right_shoulder
# 13=left_elbow, 14=right_elbow
# 15=left_wrist, 16=right_wrist
# 23=left_hip, 24=right_hip
# 25=left_knee, 26=right_knee
# 27=left_ankle, 28=right_ankle
# 0=nose

IDEAL_FORM = {
    "PUSHUP": [
        # Elbow angle: at the bottom should be ~90°
        {
            "id": "elbow",
            "joint_label": "elbow",
            "phase": "DOWN",          # only check this rule in the DOWN phase
            "good_min": 70, "good_max": 110,
            "warn_min": 55, "warn_max": 130,
            "cue_good": "✅ Elbow angle — great depth!",
            "cue_warn": "⚠️ Lower a bit more — aim for 90° elbow bend",
            "cue_bad": "⚠️ Don't lock your elbows — keep a slight bend",
        },
        # Spine alignment: shoulder-hip-ankle should stay straight (~170-180°)
        {
            "id": "spine",
            "joint_label": "hip",
            "phase": None,            # check in all phases
            "good_min": 160, "good_max": 195,
            "warn_min": 145, "warn_max": 200,
            "cue_good": "✅ Back is straight — great form!",
            "cue_warn": "⚠️ Keep your hips level — don't sag or pike",
            "cue_bad": "⚠️ Body is not aligned — straighten your core",
        },
    ],
    "SQUAT": [
        # Knee angle at bottom: should be ≤ 100° (deep squat)
        {
            "id": "knee",
            "joint_label": "knee",
            "phase": "DOWN",
            "good_min": 60, "good_max": 100,
            "warn_min": 55, "warn_max": 120,
            "cue_good": "✅ Great squat depth!",
            "cue_warn": "⚠️ Lower your hips more for full depth",
            "cue_bad": "⚠️ Go deeper — hip crease should pass the knee",
        },
        # Hip angle at bottom: hip-knee-ankle line should open smoothly (~90-120°)
        {
            "id": "hip",
            "joint_label": "hip",
            "phase": "DOWN",
            "good_min": 80, "good_max": 130,
            "warn_min": 65, "warn_max": 150,
            "cue_good": "✅ Hip position — looking good!",
            "cue_warn": "⚠️ Keep your chest up and back straight",
            "cue_bad": "⚠️ Torso is too far forward — brace your core",
        },
    ],
    "CURL": [
        # Elbow angle at top: should be fully curled ~40-60°
        {
            "id": "elbow_top",
            "joint_label": "elbow",
            "phase": "UP",
            "good_min": 30, "good_max": 65,
            "warn_min": 20, "warn_max": 80,
            "cue_good": "✅ Full curl — great range of motion!",
            "cue_warn": "⚠️ Curl a little higher for full contraction",
            "cue_bad": "⚠️ Don't swing — keep elbows pinned to your sides",
        },
        # Elbow angle at bottom: should be fully extended ~160-180°
        {
            "id": "elbow_bottom",
            "joint_label": "elbow",
            "phase": "DOWN",
            "good_min": 155, "good_max": 185,
            "warn_min": 140, "warn_max": 185,
            "cue_good": "✅ Full extension — nice!",
            "cue_warn": "⚠️ Extend your arm fully at the bottom",
            "cue_bad": "⚠️ Don't unlock your elbows or swing your shoulders",
        },
    ],
    "PULLUP": [
        # Elbow angle at top: fully pulled up should be ~60-85°
        {
            "id": "elbow_top",
            "joint_label": "elbow",
            "phase": "UP",
            "good_min": 55, "good_max": 90,
            "warn_min": 45, "warn_max": 105,
            "cue_good": "✅ Great pull — chin over bar!",
            "cue_warn": "⚠️ Pull higher — chin should clear the bar",
            "cue_bad": "⚠️ Keep elbows tucked — avoid flaring",
        },
        # Dead hang at bottom: ~155-175°
        {
            "id": "elbow_bottom",
            "joint_label": "elbow",
            "phase": "DOWN",
            "good_min": 155, "good_max": 180,
            "warn_min": 140, "warn_max": 180,
            "cue_good": "✅ Full hang — good dead hang position",
            "cue_warn": "⚠️ Fully extend your arms at the bottom",
            "cue_bad": "⚠️ You're not fully extending — risk of injury",
        },
    ],
}


class FormAnalyzer:
    """
    Evaluates joint angles against per-exercise ideal form rules and
    returns structured feedback for each joint.
    """

    # Running history: list of 0/0.5/1 scores (BAD/WARN/GOOD) per frame
    def __init__(self):
        self._score_history: list[float] = []

    def analyze(self, lm: dict, exercise: str, stage: str) -> FormAnalysis:
        """
        lm: dict of {landmark_id: {"x": float, "y": float}}
        exercise: "PUSHUP" | "SQUAT" | "CURL" | "PULLUP"
        stage: "NEUTRAL" | "DOWN" | "UP"
        """
        rules = IDEAL_FORM.get(exercise.upper(), [])
        feedbacks = []

        for rule in rules:
            # Only evaluate rule when in the correct phase (or phase=None = always)
            if rule["phase"] is not None and rule["phase"] != stage:
                continue

            angle = self._compute_angle_for_rule(lm, exercise, rule["id"])
            if angle is None:
                continue

            if rule["good_min"] <= angle <= rule["good_max"]:
                status = "GOOD"
                cue = rule["cue_good"]
            elif rule["warn_min"] <= angle <= rule["warn_max"]:
                status = "WARN"
                cue = rule["cue_warn"]
            else:
                status = "BAD"
                cue = rule["cue_bad"]

            feedbacks.append(JointFeedback(
                joint=rule["joint_label"],
                status=status,
                cue=cue,
                angle=round(angle, 1),
            ))

        # Score this frame
        frame_score = self._score_frame(feedbacks)
        self._score_history.append(frame_score)

        return FormAnalysis(
            feedbacks=feedbacks,
            form_score=round(frame_score * 100, 1),
            stage=stage,
        )

    def get_set_score(self) -> float:
        """Average form score across the whole set (0–100)."""
        if not self._score_history:
            return 0.0
        return round(sum(self._score_history) / len(self._score_history) * 100, 1)

    def get_most_common_mistake(self) -> Optional[str]:
        """Returns the most frequently triggered BAD/WARN cue this set."""
        # Stored as list of (cue, score) per frame — simplified: track externally
        return None  # extended in app.py via mistake_counter

    def reset(self):
        self._score_history = []

    # ─── Internal helpers ───────────────────────────────────────────────────

    def _score_frame(self, feedbacks: list) -> float:
        if not feedbacks:
            return 1.0
        total = 0.0
        for f in feedbacks:
            if f.status == "GOOD":
                total += 1.0
            elif f.status == "WARN":
                total += 0.5
            else:
                total += 0.0
        return total / len(feedbacks)

    def _get_point(self, lm: dict, idx: int) -> Optional[list]:
        pt = lm.get(idx)
        if pt is None:
            return None
        return [pt["x"], pt["y"]]

    def _compute_angle_for_rule(self, lm: dict, exercise: str, rule_id: str) -> Optional[float]:
        """Map rule IDs to the correct landmark triplets."""
        g = self._get_point

        mappings = {
            # PUSHUP
            ("PUSHUP", "elbow"): (g(lm, 11), g(lm, 13), g(lm, 15)),   # shoulder-elbow-wrist
            ("PUSHUP", "spine"): (g(lm, 11), g(lm, 23), g(lm, 27)),   # shoulder-hip-ankle
            # SQUAT
            ("SQUAT", "knee"):   (g(lm, 23), g(lm, 25), g(lm, 27)),   # hip-knee-ankle
            ("SQUAT", "hip"):    (g(lm, 11), g(lm, 23), g(lm, 25)),   # shoulder-hip-knee
            # CURL
            ("CURL", "elbow_top"):    (g(lm, 11), g(lm, 13), g(lm, 15)),
            ("CURL", "elbow_bottom"): (g(lm, 11), g(lm, 13), g(lm, 15)),
            # PULLUP
            ("PULLUP", "elbow_top"):    (g(lm, 11), g(lm, 13), g(lm, 15)),
            ("PULLUP", "elbow_bottom"): (g(lm, 11), g(lm, 13), g(lm, 15)),
        }

        triplet = mappings.get((exercise.upper(), rule_id))
        if triplet is None or any(p is None for p in triplet):
            return None

        a, b, c = triplet
        return _angle(a, b, c)
