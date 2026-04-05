from dataclasses import dataclass
import cv2
import mediapipe as mp
import ssl

ssl._create_default_https_context = ssl._create_unverified_context


@dataclass
class PoseAnalysis:
    frame: any
    landmarks: dict
    confidence: float
    used_cache: bool
    tracking_lost: bool
    processable: bool
    processed: bool


class PoseDetector:
    CORE_LANDMARK_IDS = (11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28)

    def __init__(
        self,
        static_image_mode=False,
        model_complexity=0,
        smooth_landmarks=True,
        min_detection_confidence=0.7,
        min_tracking_confidence=0.7,
        pose_instance=None,
        time_provider=None,
        max_tracking_gap_frames=5,
        interpolation_weight=0.65,
    ):
        self.mp_pose = mp.solutions.pose
        self.pose_connections = tuple(self.mp_pose.POSE_CONNECTIONS)
        self.time_provider = time_provider
        self.max_tracking_gap_frames = max_tracking_gap_frames
        self.interpolation_weight = interpolation_weight

        self.pose = pose_instance or self.mp_pose.Pose(
            static_image_mode=static_image_mode,
            model_complexity=model_complexity,
            smooth_landmarks=smooth_landmarks,
            min_detection_confidence=min_detection_confidence,
            min_tracking_confidence=min_tracking_confidence,
        )

        self.last_processed_at = None
        self.last_analysis = None
        self.last_valid_landmarks = None
        self.tracking_gap_frames = 0

    def analyze_frame(self, img, draw=True, max_fps=15, confidence_threshold=0.7):
        now = self._now()
        if self._should_throttle(now, max_fps):
            return self._build_cached_analysis(img, draw)

        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        results = self.pose.process(img_rgb)
        extracted_landmarks = self._extract_landmarks(results)
        confidence = self._calculate_pose_confidence(extracted_landmarks)

        processable = bool(extracted_landmarks) and confidence >= confidence_threshold
        tracking_lost = False
        used_cache = False

        if processable:
            landmarks = self._interpolate_landmarks(extracted_landmarks)
            self.last_valid_landmarks = landmarks
            self.tracking_gap_frames = 0
        else:
            landmarks = self._fallback_landmarks()
            tracking_lost = self.last_valid_landmarks is not None
            used_cache = landmarks is not None

        frame = img.copy()
        if draw and landmarks:
            self.draw_landmarks(frame, landmarks)

        analysis = PoseAnalysis(
            frame=frame,
            landmarks=landmarks or {},
            confidence=confidence,
            used_cache=used_cache,
            tracking_lost=tracking_lost,
            processable=processable,
            processed=True,
        )
        self.last_analysis = analysis
        self.last_processed_at = now
        return analysis

    def draw_landmarks(self, img, landmarks, connection_colors=None, point_color=(124, 58, 237)):
        h, w, _ = img.shape
        default_line_color = (34, 197, 94)

        for start_idx, end_idx in self.pose_connections:
            start = landmarks.get(start_idx)
            end = landmarks.get(end_idx)
            if not start or not end:
                continue

            color = default_line_color
            if connection_colors:
                color = connection_colors.get((start_idx, end_idx)) or connection_colors.get((end_idx, start_idx)) or default_line_color

            start_px = (int(start["x"] * w), int(start["y"] * h))
            end_px = (int(end["x"] * w), int(end["y"] * h))
            cv2.line(img, start_px, end_px, color, 2)

        for landmark in landmarks.values():
            point = (int(landmark["x"] * w), int(landmark["y"] * h))
            cv2.circle(img, point, 3, point_color, -1)

    def _extract_landmarks(self, results):
        if not results or not results.pose_landmarks:
            return {}

        return {
            idx: {"x": lm.x, "y": lm.y, "visibility": getattr(lm, "visibility", 0.0)}
            for idx, lm in enumerate(results.pose_landmarks.landmark)
        }

    def _calculate_pose_confidence(self, landmarks):
        if not landmarks:
            return 0.0

        visibilities = [landmarks[idx]["visibility"] for idx in self.CORE_LANDMARK_IDS if idx in landmarks]
        if not visibilities:
            return 0.0
        return round(sum(visibilities) / len(visibilities), 3)

    def _interpolate_landmarks(self, landmarks):
        if not self.last_valid_landmarks:
            return landmarks

        blended = {}
        alpha = self.interpolation_weight
        for idx, current in landmarks.items():
            previous = self.last_valid_landmarks.get(idx, current)
            blended[idx] = {
                "x": current["x"] * alpha + previous["x"] * (1 - alpha),
                "y": current["y"] * alpha + previous["y"] * (1 - alpha),
                "visibility": max(current["visibility"], previous.get("visibility", 0.0)),
            }
        return blended

    def _fallback_landmarks(self):
        if not self.last_valid_landmarks:
            return None
        if self.tracking_gap_frames >= self.max_tracking_gap_frames:
            return None
        self.tracking_gap_frames += 1
        return self.last_valid_landmarks

    def _should_throttle(self, now, max_fps):
        if not self.last_analysis or self.last_processed_at is None or not max_fps:
            return False
        frame_interval = 1 / max_fps
        return (now - self.last_processed_at) < frame_interval

    def _build_cached_analysis(self, img, draw):
        landmarks = self.last_analysis.landmarks if self.last_analysis else {}
        frame = img.copy()
        if draw and landmarks:
            self.draw_landmarks(frame, landmarks)
        return PoseAnalysis(
            frame=frame,
            landmarks=landmarks,
            confidence=self.last_analysis.confidence if self.last_analysis else 0.0,
            used_cache=True,
            tracking_lost=self.last_analysis.tracking_lost if self.last_analysis else False,
            processable=False,
            processed=False,
        )

    def _now(self):
        if self.time_provider:
            return self.time_provider()
        from time import time

        return time()
