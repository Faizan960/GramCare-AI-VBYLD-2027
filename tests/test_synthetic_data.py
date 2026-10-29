#!/usr/bin/env python3
"""
GramCare AI - Automated Validation Test for Synthetic Cohort
Verifies minimum patient count, unique IDs, valid village references, valid dates,
canonical aggregation, and reporting personnel (Doctor & Health Worker) relationships.
Uses Python standard library `unittest` for zero-dependency execution.
"""

import json
import unittest
from pathlib import Path
from datetime import datetime
from collections import Counter

FIXTURE_PATH = Path(__file__).parent.parent / "data" / "canonical_demo_scenario.json"

class TestSyntheticCohort(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        with open(FIXTURE_PATH, "r", encoding="utf-8") as f:
            cls.data = json.load(f)

    def test_minimum_patient_count(self):
        patients = self.data["patients"]
        self.assertGreaterEqual(len(patients), 120, f"Expected at least 120 patients, got {len(patients)}")
        self.assertEqual(len(patients), 125)

    def test_unique_patient_ids(self):
        patients = self.data["patients"]
        ids = [p["patient_id"] for p in patients]
        self.assertEqual(len(ids), len(set(ids)), "Found duplicate patient IDs")
        for p_id in ids:
            self.assertTrue(p_id.startswith("GC-P"), f"Invalid ID format: {p_id}")

    def test_no_real_phi_attributes(self):
        patients = self.data["patients"]
        forbidden_keys = {"name", "phone", "email", "ssn", "aadhar", "address"}
        for p in patients:
            keys = set(k.lower() for k in p.keys())
            self.assertFalse(keys & forbidden_keys, f"Disallowed PHI key found: {keys & forbidden_keys}")

    def test_valid_village_references(self):
        valid_villages = {"Village A", "Village B", "Village C", "Village D"}
        patients = self.data["patients"]
        visits = self.data["visits"]

        for p in patients:
            self.assertIn(p["village"], valid_villages, f"Invalid village in patient: {p['village']}")
        for v in visits:
            self.assertIn(v["village"], valid_villages, f"Invalid village in visit: {v['village']}")

    def test_valid_dates(self):
        for p in self.data["patients"]:
            dt = datetime.strptime(p["registered_date"], "%Y-%m-%d")
            self.assertIn(dt.year, [2026, 2027])
        for v in self.data["visits"]:
            dt = datetime.strptime(v["visit_date"], "%Y-%m-%d")
            self.assertIn(dt.year, [2026, 2027])

    def test_multiple_visits_for_demonstrating_trends(self):
        visits = self.data["visits"]
        patient_counts = Counter(v["patient_id"] for v in visits)
        multi_visit_patients = [p_id for p_id, cnt in patient_counts.items() if cnt > 1]
        self.assertGreaterEqual(len(multi_visit_patients), 20, f"Expected >=20 repeat patients, got {len(multi_visit_patients)}")

    def test_canonical_weekly_surveillance_oracle(self):
        visits = self.data["visits"]
        active_visits = [v for v in visits if v.get("is_active_surveillance")]

        self.assertEqual(len(active_visits), 27, f"Expected 27 active surveillance visits, got {len(active_visits)}")

        w1 = [v for v in active_visits if v["week"] == "Week 1"]
        w2 = [v for v in active_visits if v["week"] == "Week 2"]
        w3 = [v for v in active_visits if v["week"] == "Week 3"]

        self.assertEqual(len(w1), 5, f"Expected 5 cases in Week 1, got {len(w1)}")
        self.assertEqual(len(w2), 7, f"Expected 7 cases in Week 2, got {len(w2)}")
        self.assertEqual(len(w3), 15, f"Expected 15 cases in Week 3, got {len(w3)}")

        act_a = [v for v in active_visits if v["village"] == "Village A"]
        act_b = [v for v in active_visits if v["village"] == "Village B"]
        act_c = [v for v in active_visits if v["village"] == "Village C"]
        act_d = [v for v in active_visits if v["village"] == "Village D"]

        self.assertEqual(len(act_a), 3, f"Expected 3 cases in Village A, got {len(act_a)}")
        self.assertEqual(len(act_b), 4, f"Expected 4 cases in Village B, got {len(act_b)}")
        self.assertEqual(len(act_c), 18, f"Expected 18 cases in Village C, got {len(act_c)}")
        self.assertEqual(len(act_d), 2, f"Expected 2 cases in Village D, got {len(act_d)}")

    def test_reporting_personnel_and_visit_attribution(self):
        reporters = self.data["reporters"]
        visits = self.data["visits"]

        self.assertEqual(len(reporters), 8, f"Expected 8 reporters, got {len(reporters)}")
        rep_ids = set(r["worker_id"] for r in reporters)

        # Distinguish doctors from CHWs
        doctors = [r for r in reporters if "Doctor" in r["role"] or "Physician" in r["role"] or "Medical Officer" in r["role"]]
        chws = [r for r in reporters if "ASHA" in r["role"] or "ANM" in r["role"]]
        self.assertGreaterEqual(len(doctors), 3)
        self.assertGreaterEqual(len(chws), 3)

        # Check every visit has valid reporter
        for v in visits:
            self.assertIn("reported_by", v)
            self.assertIn(v["reported_by"], rep_ids)
            self.assertEqual(v["reported_by"], v["worker_id"])

        # Check unique patients count per reporter
        for r in reporters:
            w_id = r["worker_id"]
            r_visits = [v for v in visits if v["reported_by"] == w_id]
            r_patients = set(v["patient_id"] for v in r_visits)
            self.assertEqual(r["total_encounters"], len(r_visits))
            self.assertEqual(r["unique_patients"], len(r_patients))
            self.assertLessEqual(r["unique_patients"], r["total_encounters"])

        # Confirm some patients have visits recorded by different reporters
        patient_reporters = {}
        for v in visits:
            p_id = v["patient_id"]
            patient_reporters.setdefault(p_id, set()).add(v["reported_by"])

        cross_reporter_patients = [p_id for p_id, reps in patient_reporters.items() if len(reps) > 1]
        self.assertGreaterEqual(len(cross_reporter_patients), 5, "Expected at least 5 cross-reporter patients")

if __name__ == "__main__":
    unittest.main()
