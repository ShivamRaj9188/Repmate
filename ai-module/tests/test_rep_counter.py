import unittest

from rep_counter import RepCounter


class FakeClock:
    def __init__(self):
        self.now = 0.0

    def __call__(self):
        self.now += 0.25
        return self.now


class RepCounterTests(unittest.TestCase):
    def build_counter(self, exercise="PUSHUP"):
        return RepCounter(
            exercise_type=exercise,
            smoothing_alpha=1.0,
            debounce_frames=2,
            min_rep_time=0.0,
            time_provider=FakeClock(),
        )

    def feed(self, counter, angles):
        for angle in angles:
            counter.count_rep(angle)
        return counter.counter, counter.stage

    def test_pushup_counts_only_after_full_down_to_up_cycle(self):
        counter = self.build_counter("PUSHUP")
        count, stage = self.feed(counter, [140, 140, 85, 85, 165, 165])
        self.assertEqual(count, 1)
        self.assertEqual(stage, "UP")

    def test_returning_to_neutral_from_down_does_not_count_half_rep(self):
        counter = self.build_counter("PUSHUP")
        count, stage = self.feed(counter, [140, 140, 88, 88, 130, 130])
        self.assertEqual(count, 0)
        self.assertEqual(stage, "NEUTRAL")

    def test_jitter_near_threshold_does_not_trigger_count(self):
        counter = self.build_counter("SQUAT")
        count, stage = self.feed(counter, [141, 141, 97, 99, 96, 98, 153, 156, 157])
        self.assertEqual(count, 0)
        self.assertEqual(stage, "NEUTRAL")

    def test_full_second_cycle_requires_new_down_before_counting_again(self):
        counter = self.build_counter("PUSHUP")
        self.feed(counter, [140, 140, 82, 82, 165, 165])
        count, stage = self.feed(counter, [165, 165, 150, 150, 84, 84, 166, 166])
        self.assertEqual(count, 2)
        self.assertEqual(stage, "UP")

    def test_curl_counts_on_full_extension_to_contraction_cycle(self):
        counter = self.build_counter("CURL")
        count, stage = self.feed(counter, [160, 160, 48, 48])
        self.assertEqual(count, 1)
        self.assertEqual(stage, "UP")


if __name__ == "__main__":
    unittest.main()
