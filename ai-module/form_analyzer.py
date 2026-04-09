"""
form_analyzer.py — Real-time pose correction rules for RepMate.

Each exercise has a set of rules. Each rule checks one joint angle and
returns: status ("GOOD" | "WARN" | "BAD"), a coaching cue string, and the
joint name (used to colour the skeleton overlay).

In addition, it runs a Random Forest ML model on a 5-frame temporal window
to provide an overarching `ml_form_correct` and `ml_score` (probabilistic).
"""

from dataclasses import dataclass
from typing import Optional
from collections import deque
import numpy as np
import joblib
import os


@dataclass
class JointFeedback:
    joint: str          # e.g. "left_knee"
    status: str         # "GOOD" | "WARN" | "BAD"
    cue: str            # human-readable coaching message
    angle: float        # actual measured angle


@dataclass
class FormAnalysis:
    feedbacks: list     # list[JointFeedback]
    form_score: float   # 0-100, average greenness this frame (heuristic)
    stage: str          # current movement stage
    ml_form_correct: bool
    ml_score: float     # 0-100%


def _angle(a, b, c) -> float:
    """Angle in degrees at vertex b formed by points a→b→c."""
    a, b, c = np.array(a), np.array(b), np.array(c)
    radians = np.arctan2(c[1] - b[1], c[0] - b[0]) - np.arctan2(a[1] - b[1], a[0] - b[0])
    angle = abs(radians * 180.0 / np.pi)
    return 360 - angle if angle > 180 else angle


IDEAL_FORM = {
    "PUSHUP": [
        {
            "id": "elbow",
            "joint_label": "elbow",
            "phase": "DOWN",
            "good_min": 70, "good_max": 110,
            "warn_min": 55, "warn_max": 130,
            "cue_good": "✅ Elbow angle — great depth!",
            "cue_warn": "⚠️ Lower a bit more — aim for 90° elbow bend",
            "cue_bad": "⚠️ Don't lock your elbows — keep a slight bend",
        },
        {
            "id": "spine",
            "joint_label": "hip",
            "phase": None,
            "good_min": 160, "good_max": 195,
            "warn_min": 145, "warn_max": 200,
            "cue_good": "✅ Back is straight — great form!",
            "cue_warn": "⚠️ Keep your hips level — don't sag or pike",
            "cue_bad": "⚠️ Body is not aligned — straighten your core",
        },
    ],
    "SQUAT": [
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

    def __init__(self):
        self._score_history: list[float] = []
        self._ml_score_history: list[float] = []
        self._window_buffer = deque(maxlen=5)
        self.models = {}
        
        # Load ML models
        model_path = os.path.join(os.path.dirname(__file__), 'exercise_model.pkl')
        if os.path.exists(model_path):
            try:
                self.models = joblib.load(model_path)
            except Exception as e:
                print(f"[AI] Could not load ML model: {e}")

    def analyze(self, lm: dict, exercise: str, stage: str) -> FormAnalysis:
        # Evaluate heuristic rules
        rules = IDEAL_FORM.get(exercise.upper(), [])
        feedbacks = []

        for rule in rules:
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

        frame_score = self._score_frame(feedbacks)
        self._score_history.append(frame_score)
        
        # --- ML Prediction ---
        ml_score_pct = 100.0
        ml_form_correct = True
        
        # Extract 6 global joints for ML
        g = self._get_point
        try:
            l_elbow = _angle(g(lm, 11), g(lm, 13), g(lm, 15)) if g(lm,11) and g(lm,13) and g(lm,15) else 160
            r_elbow = _angle(g(lm, 12), g(lm, 14), g(lm, 16)) if g(lm,12) and g(lm,14) and g(lm,16) else 160
            l_hip = _angle(g(lm, 11), g(lm, 23), g(lm, 25)) if g(lm,11) and g(lm,23) and g(lm,25) else 175
            r_hip = _angle(g(lm, 12), g(lm, 24), g(lm, 26)) if g(lm,12) and g(lm,24) and g(lm,26) else 175
            l_knee = _angle(g(lm, 23), g(lm, 25), g(lm, 27)) if g(lm,23) and g(lm,25) and g(lm,27) else 170
            r_knee = _angle(g(lm, 24), g(lm, 26), g(lm, 28)) if g(lm,24) and g(lm,26) and g(lm,28) else 170
            
            stage_encoded = {"NEUTRAL": 0, "DOWN": 1, "UP": 2}.get(stage, 0)
            
            self._window_buffer.append([l_elbow, r_elbow, l_hip, r_hip, l_knee, r_knee, stage_encoded])
            
            if len(self._window_buffer) == 5:
                # We have enough frames to build features
                w_np = np.array(self._window_buffer)
                angles = w_np[:, :6]
                st = w_np[-1, 6]
                
                mean_angles = np.mean(angles, axis=0) # 6
                velocity = angles[-1] - angles[0] # 6
                variance = np.var(angles, axis=0) # 6
                sym_elbow = abs(mean_angles[0] - mean_angles[1])
                sym_hip = abs(mean_angles[2] - mean_angles[3])
                sym_knee = abs(mean_angles[4] - mean_angles[5])
                symmetry = np.array([sym_elbow, sym_hip, sym_knee]) # 3
                
                features = np.concatenate([mean_angles, velocity, variance, symmetry, [st]])
                
                model = self.models.get(exercise.upper())
                if model is not None:
                    probs = model.predict_proba([features])[0]
                    # Class 1 is "GOOD"
                    confidence = probs[1]
                    ml_form_correct = confidence >= 0.5
                    ml_score_pct = float(confidence * 100.0)
                    self._ml_score_history.append(ml_score_pct)
        except Exception as e:
            # Fallback if any math fails
            pass

        return FormAnalysis(
            feedbacks=feedbacks,
            form_score=round(frame_score * 100, 1),
            stage=stage,
            ml_form_correct=bool(ml_form_correct),
            ml_score=round(float(ml_score_pct), 1),
        )

    def get_set_score(self) -> float:
        """Average ML score across the whole set (0–100). If no ML, fall back to heuristic."""
        if self._ml_score_history:
            return round(sum(self._ml_score_history) / len(self._ml_score_history), 1)
        if not self._score_history:
            return 0.0
        return round(sum(self._score_history) / len(self._score_history) * 100, 1)

    def get_most_common_mistake(self) -> Optional[str]:
        return None

    def reset(self):
        self._score_history = []
        self._ml_score_history = []
        self._window_buffer.clear()

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
        g = self._get_point
        mappings = {
            ("PUSHUP", "elbow"): (g(lm, 11), g(lm, 13), g(lm, 15)),
            ("PUSHUP", "spine"): (g(lm, 11), g(lm, 23), g(lm, 27)),
            ("SQUAT", "knee"):   (g(lm, 23), g(lm, 25), g(lm, 27)),
            ("SQUAT", "hip"):    (g(lm, 11), g(lm, 23), g(lm, 25)),
            ("CURL", "elbow_top"):    (g(lm, 11), g(lm, 13), g(lm, 15)),
            ("CURL", "elbow_bottom"): (g(lm, 11), g(lm, 13), g(lm, 15)),
            ("PULLUP", "elbow_top"):    (g(lm, 11), g(lm, 13), g(lm, 15)),
            ("PULLUP", "elbow_bottom"): (g(lm, 11), g(lm, 13), g(lm, 15)),
        }
        triplet = mappings.get((exercise.upper(), rule_id))
        if triplet is None or any(p is None for p in triplet):
            return None

        a, b, c = triplet
        return _angle(a, b, c)
