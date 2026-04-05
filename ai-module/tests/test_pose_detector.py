import unittest

import numpy as np

from pose_detector import PoseDetector


class FakeClock:
    def __init__(self, start=0.0, step=0.01):
        self.value = start
        self.step = step

    def __call__(self):
        current = self.value
        self.value += self.step
        return current


class FakeLandmark:
    def __init__(self, x, y, visibility=0.9):
        self.x = x
        self.y = y
        self.visibility = visibility


class FakeResult:
    def __init__(self, landmarks):
        self.pose_landmarks = type('PoseLandmarks', (), {'landmark': landmarks})() if landmarks is not None else None


class FakePose:
    def __init__(self, results):
        self.results = list(results)
        self.process_calls = 0

    def process(self, _img_rgb):
        self.process_calls += 1
        if not self.results:
            return FakeResult(None)
        return self.results.pop(0)


def build_landmarks(visibility=0.95, x_offset=0.0):
    landmarks = []
    for idx in range(33):
        landmarks.append(FakeLandmark(0.1 + x_offset + idx * 0.01, 0.2 + idx * 0.005, visibility))
    return landmarks


class PoseDetectorTests(unittest.TestCase):
    def test_throttles_to_cached_result_inside_fps_window(self):
        pose = FakePose([FakeResult(build_landmarks())])
        detector = PoseDetector(pose_instance=pose, time_provider=FakeClock(step=0.01))
        frame = np.zeros((32, 32, 3), dtype=np.uint8)

        first = detector.analyze_frame(frame, draw=False, max_fps=15, confidence_threshold=0.7)
        second = detector.analyze_frame(frame, draw=False, max_fps=15, confidence_threshold=0.7)

        self.assertTrue(first.processed)
        self.assertFalse(second.processed)
        self.assertTrue(second.used_cache)
        self.assertEqual(pose.process_calls, 1)

    def test_low_confidence_uses_cached_landmarks_without_processing_metrics(self):
        pose = FakePose([
            FakeResult(build_landmarks(visibility=0.92, x_offset=0.0)),
            FakeResult(build_landmarks(visibility=0.45, x_offset=0.1)),
        ])
        detector = PoseDetector(pose_instance=pose, time_provider=FakeClock(step=0.08), max_tracking_gap_frames=3)
        frame = np.zeros((32, 32, 3), dtype=np.uint8)

        first = detector.analyze_frame(frame, draw=False, max_fps=15, confidence_threshold=0.7)
        second = detector.analyze_frame(frame, draw=False, max_fps=15, confidence_threshold=0.7)

        self.assertTrue(first.processable)
        self.assertFalse(second.processable)
        self.assertTrue(second.tracking_lost)
        self.assertTrue(second.used_cache)
        self.assertEqual(second.landmarks[11]['x'], first.landmarks[11]['x'])

    def test_interpolates_new_landmarks_with_previous_cache(self):
        pose = FakePose([
            FakeResult(build_landmarks(visibility=0.95, x_offset=0.0)),
            FakeResult(build_landmarks(visibility=0.95, x_offset=0.2)),
        ])
        detector = PoseDetector(pose_instance=pose, time_provider=FakeClock(step=0.08), interpolation_weight=0.5)
        frame = np.zeros((32, 32, 3), dtype=np.uint8)

        first = detector.analyze_frame(frame, draw=False, max_fps=15, confidence_threshold=0.7)
        second = detector.analyze_frame(frame, draw=False, max_fps=15, confidence_threshold=0.7)

        self.assertAlmostEqual(first.landmarks[11]['x'], 0.21, places=2)
        self.assertAlmostEqual(second.landmarks[11]['x'], 0.31, places=2)


if __name__ == '__main__':
    unittest.main()
