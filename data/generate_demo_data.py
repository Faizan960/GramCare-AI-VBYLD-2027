#!/usr/bin/env python3
"""
GramCare AI - Deterministic Synthetic Demonstration Data Generator
Generates >=120 fictional patients, associated health records with multiple visits,
and 8 reporting personnel (Doctors & Health Workers) with explicit visit attribution.
Preserves the canonical 3-week surveillance trajectory: 5 -> 7 -> 15 cases (A:3, B:4, C:18, D:2).
All generated records are strictly synthetic and for demonstration / testing only (D-008, NFR-05).
"""

import json
import random
from pathlib import Path
from datetime import datetime, timedelta
from collections import Counter

def generate_synthetic_cohort(seed=42):
    random.seed(seed)

    # 1. Monitored Villages configuration
    villages_meta = [
        {"id": "VIL-01", "name": "Village A", "lat": 19.185, "lng": 72.865, "role": "Normal background", "status": "Normal", "baseline": 3},
        {"id": "VIL-02", "name": "Village B", "lat": 19.192, "lng": 72.845, "role": "Normal background", "status": "Normal", "baseline": 4},
        {"id": "VIL-03", "name": "Village C", "lat": 19.145, "lng": 72.935, "role": "Sudden increase", "status": "Potential Hotspot", "baseline": 4},
        {"id": "VIL-04", "name": "Village D", "lat": 19.155, "lng": 72.948, "role": "Symptom-similarity cluster near Village C", "status": "Cluster Monitored", "baseline": 2},
    ]

    # 2. Fictional Reporting Personnel (Doctors vs Community Health Workers)
    reporters = [
        {
            "worker_id": "DOC-001",
            "name": "Dr. Rajesh Sharma",
            "role": "Medical Officer",
            "qualification": "MBBS, DPH (Public Health)",
            "primary_village": "Village C",
            "assigned_location": "Village C Primary Health Centre",
            "review_activity": "Lead reviewer for ALT-001 acute diarrhea alert",
            "contact": "rajesh.sharma@phc.gramcare.demo",
        },
        {
            "worker_id": "DOC-002",
            "name": "Dr. Anita Desai",
            "role": "Staff Physician",
            "qualification": "MBBS",
            "primary_village": "Village A",
            "assigned_location": "Village A Community Health Post",
            "review_activity": "Field clinical surveillance & routine checkups",
            "contact": "anita.desai@chp.gramcare.demo",
        },
        {
            "worker_id": "DOC-003",
            "name": "Dr. Suresh Patil",
            "role": "Staff Physician",
            "qualification": "MBBS, DCH",
            "primary_village": "Village B",
            "assigned_location": "Village B Rural Health Post",
            "review_activity": "Respiratory symptom surveillance & pediatric care",
            "contact": "suresh.patil@rhp.gramcare.demo",
        },
        {
            "worker_id": "DOC-004",
            "name": "Dr. Meera Kulkarni",
            "role": "Visiting Medical Officer",
            "qualification": "MD (Community Medicine)",
            "primary_village": "Village D",
            "assigned_location": "Village D Sub-Centre & Mobile Clinic",
            "review_activity": "Cluster coordination with Village C team",
            "contact": "meera.kulkarni@phc.gramcare.demo",
        },
        {
            "worker_id": "HW-001",
            "name": "Sunita Kamble",
            "role": "Community Health Worker (ASHA)",
            "qualification": "ASHA Certified, Sector 1",
            "primary_village": "Village C",
            "assigned_location": "Village C Sub-Centre 1",
            "review_activity": "Field door-to-door case detection & surveillance",
            "contact": "sunita.kamble@asha.gramcare.demo",
        },
        {
            "worker_id": "HW-002",
            "name": "Pooja Jadhav",
            "role": "Community Health Worker (ASHA)",
            "qualification": "ASHA Certified, Sector 2",
            "primary_village": "Village C",
            "assigned_location": "Village C Sub-Centre 2",
            "review_activity": "Oral rehydration distribution & triage reporting",
            "contact": "pooja.jadhav@asha.gramcare.demo",
        },
        {
            "worker_id": "HW-003",
            "name": "Ramesh Shinde",
            "role": "Auxiliary Nurse Midwife (ANM)",
            "qualification": "ANM Registered",
            "primary_village": "Village A",
            "assigned_location": "Village A Primary Health Sub-Centre",
            "review_activity": "Maternal-child & community fever screening",
            "contact": "ramesh.shinde@anm.gramcare.demo",
        },
        {
            "worker_id": "HW-004",
            "name": "Kavita Rathod",
            "role": "Community Health Worker (ASHA)",
            "qualification": "ASHA Certified",
            "primary_village": "Village B",
            "assigned_location": "Village B Sub-Centre",
            "review_activity": "Community respiratory & seasonal illness tracking",
            "contact": "kavita.rathod@asha.gramcare.demo",
        },
    ]

    reporters_by_id = {r["worker_id"]: r for r in reporters}

    # 3. Target: 125 fictional patients across villages
    village_patient_counts = {
        "Village A": 28,
        "Village B": 30,
        "Village C": 45,
        "Village D": 22,
    }

    patients = []
    patient_id_counter = 1
    genders = ["Female", "Male"]

    base_reg_date = datetime(2026, 8, 1)
    patients_by_village = {"Village A": [], "Village B": [], "Village C": [], "Village D": []}

    for v_name, count in village_patient_counts.items():
        for _ in range(count):
            p_id = f"GC-P{patient_id_counter:04d}"
            age = random.randint(3, 76)
            gender = random.choice(genders)
            reg_days_offset = random.randint(0, 60)
            reg_date = (base_reg_date + timedelta(days=reg_days_offset)).strftime("%Y-%m-%d")

            p_obj = {
                "patient_id": p_id,
                "village": v_name,
                "age": age,
                "gender": gender,
                "registered_date": reg_date,
            }
            patients.append(p_obj)
            patients_by_village[v_name].append(p_obj)
            patient_id_counter += 1

    # 4. Canonical 27 Active Surveillance Visits
    # Exactly matching Week 1: 5 (A:1, B:1, C:2, D:1), Week 2: 7 (A:1, B:2, C:3, D:1), Week 3: 15 (A:1, B:1, C:13, D:0)
    canonical_active_specs = [
        # Week 1 (5 cases)
        {"village": "Village A", "p_idx": 0, "reporter": "HW-003", "symptoms": ["Fever", "Mild headache"], "condition": "Febrile Illness", "conf": 0.82, "date": "2026-10-03", "week": "Week 1", "sync": "Synced"},
        {"village": "Village B", "p_idx": 0, "reporter": "HW-004", "symptoms": ["Dry cough", "Sore throat"], "condition": "Upper Respiratory Infection", "conf": 0.78, "date": "2026-10-05", "week": "Week 1", "sync": "Synced"},
        {"village": "Village C", "p_idx": 0, "reporter": "HW-001", "symptoms": ["Acute watery diarrhoea", "Abdominal cramps"], "condition": "Acute Diarrheal Disease", "conf": 0.89, "date": "2026-10-06", "week": "Week 1", "sync": "Synced"},
        {"village": "Village C", "p_idx": 1, "reporter": "HW-002", "symptoms": ["Acute watery diarrhoea", "Nausea"], "condition": "Acute Diarrheal Disease", "conf": 0.85, "date": "2026-10-07", "week": "Week 1", "sync": "Synced"},
        {"village": "Village D", "p_idx": 0, "reporter": "DOC-004", "symptoms": ["Acute watery diarrhoea", "Abdominal cramps"], "condition": "Acute Diarrheal Disease", "conf": 0.88, "date": "2026-10-07", "week": "Week 1", "sync": "Synced"},

        # Week 2 (7 cases)
        {"village": "Village A", "p_idx": 1, "reporter": "DOC-002", "symptoms": ["Body ache", "Fatigue"], "condition": "Febrile Illness", "conf": 0.74, "date": "2026-10-09", "week": "Week 2", "sync": "Synced"},
        {"village": "Village B", "p_idx": 1, "reporter": "DOC-003", "symptoms": ["Runny nose", "Cough"], "condition": "Upper Respiratory Infection", "conf": 0.80, "date": "2026-10-10", "week": "Week 2", "sync": "Synced"},
        {"village": "Village B", "p_idx": 2, "reporter": "HW-004", "symptoms": ["Low-grade fever", "Headache"], "condition": "Febrile Illness", "conf": 0.77, "date": "2026-10-11", "week": "Week 2", "sync": "Synced"},
        {"village": "Village C", "p_idx": 2, "reporter": "HW-001", "symptoms": ["Acute watery diarrhoea", "Dehydration"], "condition": "Acute Diarrheal Disease", "conf": 0.91, "date": "2026-10-12", "week": "Week 2", "sync": "Synced"},
        {"village": "Village C", "p_idx": 3, "reporter": "DOC-001", "symptoms": ["Acute watery diarrhoea", "Vomiting"], "condition": "Acute Diarrheal Disease", "conf": 0.90, "date": "2026-10-13", "week": "Week 2", "sync": "Synced"},
        {"village": "Village C", "p_idx": 4, "reporter": "DOC-001", "symptoms": ["Acute watery diarrhoea", "Abdominal cramps", "Moderate fever"], "condition": "Acute Diarrheal Disease", "conf": 0.93, "date": "2026-10-14", "week": "Week 2", "sync": "Synced"},
        {"village": "Village D", "p_idx": 1, "reporter": "DOC-001", "symptoms": ["Acute watery diarrhoea", "Nausea"], "condition": "Acute Diarrheal Disease", "conf": 0.86, "date": "2026-10-14", "week": "Week 2", "sync": "Synced"},

        # Week 3 (15 cases)
        {"village": "Village A", "p_idx": 2, "reporter": "HW-003", "symptoms": ["Joint pain", "Mild fever"], "condition": "Febrile Illness", "conf": 0.72, "date": "2026-10-16", "week": "Week 3", "sync": "Synced"},
        {"village": "Village B", "p_idx": 3, "reporter": "DOC-003", "symptoms": ["Sore throat", "Cough"], "condition": "Upper Respiratory Infection", "conf": 0.81, "date": "2026-10-16", "week": "Week 3", "sync": "Synced"},
        {"village": "Village C", "p_idx": 5, "reporter": "DOC-001", "symptoms": ["Acute watery diarrhoea", "Vomiting", "Dehydration"], "condition": "Acute Diarrheal Disease", "conf": 0.94, "date": "2026-10-17", "week": "Week 3", "sync": "Synced"},
        {"village": "Village C", "p_idx": 6, "reporter": "DOC-001", "symptoms": ["Acute watery diarrhoea", "Abdominal cramps"], "condition": "Acute Diarrheal Disease", "conf": 0.89, "date": "2026-10-17", "week": "Week 3", "sync": "Synced"},
        {"village": "Village C", "p_idx": 7, "reporter": "DOC-001", "symptoms": ["Acute watery diarrhoea", "Dehydration"], "condition": "Acute Diarrheal Disease", "conf": 0.92, "date": "2026-10-18", "week": "Week 3", "sync": "Synced"},
        {"village": "Village C", "p_idx": 8, "reporter": "HW-001", "symptoms": ["Acute watery diarrhoea", "Vomiting"], "condition": "Acute Diarrheal Disease", "conf": 0.90, "date": "2026-10-18", "week": "Week 3", "sync": "Synced"},
        {"village": "Village C", "p_idx": 9, "reporter": "HW-001", "symptoms": ["Acute watery diarrhoea", "Abdominal cramps"], "condition": "Acute Diarrheal Disease", "conf": 0.89, "date": "2026-10-19", "week": "Week 3", "sync": "Synced"},
        {"village": "Village C", "p_idx": 10, "reporter": "DOC-001", "symptoms": ["Acute watery diarrhoea", "Severe weakness", "Dehydration"], "condition": "Acute Diarrheal Disease", "conf": 0.95, "date": "2026-10-19", "week": "Week 3", "sync": "Synced"},
        {"village": "Village C", "p_idx": 11, "reporter": "HW-002", "symptoms": ["Acute watery diarrhoea", "Abdominal cramps"], "condition": "Acute Diarrheal Disease", "conf": 0.88, "date": "2026-10-19", "week": "Week 3", "sync": "Synced"},
        {"village": "Village C", "p_idx": 12, "reporter": "DOC-001", "symptoms": ["Acute watery diarrhoea", "Moderate fever"], "condition": "Acute Diarrheal Disease", "conf": 0.87, "date": "2026-10-20", "week": "Week 3", "sync": "Synced"},
        {"village": "Village C", "p_idx": 13, "reporter": "DOC-001", "symptoms": ["Acute watery diarrhoea", "Vomiting", "Abdominal cramps"], "condition": "Acute Diarrheal Disease", "conf": 0.93, "date": "2026-10-20", "week": "Week 3", "sync": "Synced"},
        {"village": "Village C", "p_idx": 14, "reporter": "HW-001", "symptoms": ["Acute watery diarrhoea", "Dehydration"], "condition": "Acute Diarrheal Disease", "conf": 0.94, "date": "2026-10-20", "week": "Week 3", "sync": "Synced"},
        {"village": "Village C", "p_idx": 15, "reporter": "HW-002", "symptoms": ["Acute watery diarrhoea", "Abdominal cramps"], "condition": "Acute Diarrheal Disease", "conf": 0.89, "date": "2026-10-21", "week": "Week 3", "sync": "Pending"},
        {"village": "Village C", "p_idx": 16, "reporter": "DOC-001", "symptoms": ["Acute watery diarrhoea", "Nausea"], "condition": "Acute Diarrheal Disease", "conf": 0.86, "date": "2026-10-21", "week": "Week 3", "sync": "Pending"},
        {"village": "Village C", "p_idx": 17, "reporter": "DOC-001", "symptoms": ["Acute watery diarrhoea", "Vomiting"], "condition": "Acute Diarrheal Disease", "conf": 0.91, "date": "2026-10-21", "week": "Week 3", "sync": "Synced"},
    ]

    all_visits = []
    visit_id_counter = 1

    # Add canonical visits with explicit reporter references
    for spec in canonical_active_specs:
        v_name = spec["village"]
        patient = patients_by_village[v_name][spec["p_idx"]]
        rep_id = spec["reporter"]
        reporter_meta = reporters_by_id[rep_id]

        v_obj = {
            "id": f"GC-V{visit_id_counter:04d}",
            "patient_id": patient["patient_id"],
            "village": v_name,
            "age": patient["age"],
            "gender": patient["gender"],
            "reported_by": rep_id,
            "worker_id": rep_id,
            "reporter_name": reporter_meta["name"],
            "reporter_role": reporter_meta["role"],
            "symptoms": spec["symptoms"],
            "possible_condition": spec["condition"],
            "confidence": spec["conf"],
            "explanation": f"Influenced by: {', '.join(spec['symptoms'][:2])}",
            "visit_date": spec["date"],
            "week": spec["week"],
            "sync_status": spec["sync"],
            "is_active_surveillance": True,
        }
        all_visits.append(v_obj)
        visit_id_counter += 1

    # 5. Baseline & Historical visits across remaining patients and repeat visits
    routine_symptom_pool = [
        (["Mild fever", "Headache"], "Febrile Illness", 0.79),
        (["Cough", "Cold"], "Upper Respiratory Infection", 0.82),
        (["Body ache", "Weakness"], "General Malaise", 0.75),
        (["Joint pain"], "Musculoskeletal Pain", 0.73),
        (["Skin rash", "Itching"], "Dermatitis", 0.84),
        (["Mild stomach ache"], "Gastric Irritation", 0.76),
    ]

    village_default_reporters = {
        "Village A": ["DOC-002", "HW-003"],
        "Village B": ["DOC-003", "HW-004"],
        "Village C": ["DOC-001", "HW-001", "HW-002"],
        "Village D": ["DOC-004", "DOC-001"],
    }

    # Give every other patient at least one baseline / historical visit
    for v_name, p_list in patients_by_village.items():
        start_idx = 3 if v_name == "Village A" else (4 if v_name == "Village B" else (18 if v_name == "Village C" else 2))
        for p in p_list[start_idx:]:
            sym, cond, conf = random.choice(routine_symptom_pool)
            day = random.randint(1, 28)
            month = random.choice([8, 9])
            v_date = f"2026-{month:02d}-{day:02d}"
            rep_id = random.choice(village_default_reporters[v_name])
            rep_meta = reporters_by_id[rep_id]

            all_visits.append({
                "id": f"GC-V{visit_id_counter:04d}",
                "patient_id": p["patient_id"],
                "village": v_name,
                "age": p["age"],
                "gender": p["gender"],
                "reported_by": rep_id,
                "worker_id": rep_id,
                "reporter_name": rep_meta["name"],
                "reporter_role": rep_meta["role"],
                "symptoms": sym,
                "possible_condition": cond,
                "confidence": conf,
                "explanation": f"Influenced by: {', '.join(sym)}",
                "visit_date": v_date,
                "week": "Historical",
                "sync_status": "Synced",
                "is_active_surveillance": False,
            })
            visit_id_counter += 1

    # Add repeat visits for 28 patients across the cohort
    # Note: for cross-reporter demonstration, some repeat visits use a doctor if the initial visit was by a health worker
    repeat_candidates = random.sample(patients, 28)
    for p in repeat_candidates:
        sym, cond, conf = random.choice(routine_symptom_pool)
        v_date = f"2026-09-{random.randint(10, 30):02d}"
        v_reps = village_default_reporters[p["village"]]
        rep_id = v_reps[0] if len(v_reps) > 1 else v_reps[0]
        rep_meta = reporters_by_id[rep_id]

        all_visits.append({
            "id": f"GC-V{visit_id_counter:04d}",
            "patient_id": p["patient_id"],
            "village": p["village"],
            "age": p["age"],
            "gender": p["gender"],
            "reported_by": rep_id,
            "worker_id": rep_id,
            "reporter_name": rep_meta["name"],
            "reporter_role": rep_meta["role"],
            "symptoms": sym,
            "possible_condition": cond,
            "confidence": conf,
            "explanation": f"Follow-up consultation. Influenced by: {', '.join(sym)}",
            "visit_date": v_date,
            "week": "Historical",
            "sync_status": "Synced",
            "is_active_surveillance": False,
        })
        visit_id_counter += 1

    # 6. Weekly Trend (Canonical preservation)
    weekly_trend = [
        {"week": "Week 1", "period": "Oct 01 - Oct 07", "cases": 5, "baseline": 4},
        {"week": "Week 2", "period": "Oct 08 - Oct 14", "cases": 7, "baseline": 4},
        {"week": "Week 3", "period": "Oct 15 - Oct 21", "cases": 15, "baseline": 4},
    ]

    # 7. Potential Alerts (Village C flagged; Village A & B unflagged)
    alerts = [
        {
            "id": "ALT-001",
            "title": "Potential Cluster: Acute Diarrheal Pattern",
            "village": "Village C",
            "village_id": "VIL-03",
            "severity": "High",
            "cases": 18,
            "time": "Surveillance Week 3",
            "status": "Needs review",
            "dominant_symptoms": ["Acute watery diarrhoea", "Abdominal cramps", "Vomiting", "Dehydration"],
            "possible_condition": "Acute Diarrheal Disease",
            "supporting_evidence": "Sudden upward trajectory in Village C across 3 weeks (Week 1: 2 cases -> Week 2: 3 cases -> Week 3: 13 cases, contributing to 5 -> 7 -> 15 weekly surveillance rise). Total 18 cases exceed historical baseline of 4 cases by 4.5x. Strong spatial and symptom correlation with neighbouring Village D (reporting identical acute gastrointestinal symptoms). Flagged for medical officer review — decision support only, not confirmed outbreak.",
            "investigation_steps": [
                "Verify local water source chlorination levels in Village C and D.",
                "Dispatch rapid health response team for oral rehydration distribution.",
                "Review cross-village travel patterns between Village C and Village D."
            ],
        }
    ]

    # Calculate reporter aggregates for verification and fixture embedding
    for r in reporters:
        w_id = r["worker_id"]
        r_visits = [v for v in all_visits if v["reported_by"] == w_id]
        r_patients = set(v["patient_id"] for v in r_visits)
        dates = [v["visit_date"] for v in r_visits]
        r["total_encounters"] = len(r_visits)
        r["unique_patients"] = len(r_patients)
        r["latest_report"] = max(dates) if dates else "N/A"

    # Combine into full scenario structure
    scenario_data = {
        "scenario": "Canonical GramCare AI Demonstration Cohort",
        "disclaimer": "DEMO / SIMULATED DATA ONLY. Fictional patient and surveillance records. Decision support only, not clinical diagnosis (D-007, D-008).",
        "seed": seed,
        "metadata": {
            "total_patients": len(patients),
            "total_visits": len(all_visits),
            "total_reporters": len(reporters),
            "active_surveillance_cases": len(canonical_active_specs),
            "surveillance_period": "2026-10-01 to 2026-10-21 (Weeks 1 to 3)",
        },
        "patients": patients,
        "visits": all_visits,
        "reporters": reporters,
        "villages": villages_meta,
        "weekly_trend": weekly_trend,
        "alerts": alerts,
    }

    # Validation assertions
    assert len(patients) >= 120, f"Expected at least 120 patients, got {len(patients)}"
    patient_ids = [p["patient_id"] for p in patients]
    assert len(patient_ids) == len(set(patient_ids)), "Duplicate patient IDs found!"

    # Multi-visit check
    visit_patient_counts = Counter(v["patient_id"] for v in all_visits)
    multi_visit_count = sum(1 for cnt in visit_patient_counts.values() if cnt > 1)
    assert multi_visit_count >= 20, f"Expected at least 20 multi-visit patients, got {multi_visit_count}"

    # Reporter checks
    assert len(reporters) == 8, f"Expected 8 reporters, got {len(reporters)}"
    all_reporter_ids = set(r["worker_id"] for r in reporters)
    for v in all_visits:
        assert v["reported_by"] in all_reporter_ids, f"Invalid reporter in visit: {v['reported_by']}"
        assert v["worker_id"] == v["reported_by"]

    for r in reporters:
        assert r["total_encounters"] > 0, f"Reporter {r['worker_id']} has 0 encounters"
        assert r["unique_patients"] <= r["total_encounters"], "Unique patients cannot exceed encounters"

    # Active surveillance checks
    active_visits = [v for v in all_visits if v["is_active_surveillance"]]
    assert len(active_visits) == 27, f"Expected 27 active visits, got {len(active_visits)}"
    
    act_a = [v for v in active_visits if v["village"] == "Village A"]
    act_b = [v for v in active_visits if v["village"] == "Village B"]
    act_c = [v for v in active_visits if v["village"] == "Village C"]
    act_d = [v for v in active_visits if v["village"] == "Village D"]
    assert len(act_a) == 3, f"Expected 3 active cases in Village A, got {len(act_a)}"
    assert len(act_b) == 4, f"Expected 4 active cases in Village B, got {len(act_b)}"
    assert len(act_c) == 18, f"Expected 18 active cases in Village C, got {len(act_c)}"
    assert len(act_d) == 2, f"Expected 2 active cases in Village D, got {len(act_d)}"

    w1 = [v for v in active_visits if v["week"] == "Week 1"]
    w2 = [v for v in active_visits if v["week"] == "Week 2"]
    w3 = [v for v in active_visits if v["week"] == "Week 3"]
    assert len(w1) == 5, f"Expected 5 cases in Week 1, got {len(w1)}"
    assert len(w2) == 7, f"Expected 7 cases in Week 2, got {len(w2)}"
    assert len(w3) == 15, f"Expected 15 cases in Week 3, got {len(w3)}"

    # Save to canonical_demo_scenario.json
    out_file = Path(__file__).parent / "canonical_demo_scenario.json"
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(scenario_data, f, indent=2)

    print("=================================================================")
    print("GramCare AI: Deterministic Synthetic Cohort Generated")
    print(f"  Random Seed: {seed}")
    print(f"  Total Synthetic Patients: {len(patients)} (>=120)")
    print(f"  Total Health Encounters:  {len(all_visits)}")
    print(f"  Total Reporting Personnel: {len(reporters)}")
    print(f"  Patients with Multiple Visits: {multi_visit_count}")
    print("  Reporters Overview:")
    for r in reporters:
        print(f"    - {r['worker_id']}: {r['name']} ({r['role']}, {r['primary_village']}) -> {r['total_encounters']} visits, {r['unique_patients']} unique patients")
    print("  Canonical Active Surveillance Trajectory:")
    print(f"    - Week 1: {len(w1)} cases")
    print(f"    - Week 2: {len(w2)} cases")
    print(f"    - Week 3: {len(w3)} cases (Total: {len(active_visits)})")
    print("=================================================================")
    return scenario_data

if __name__ == "__main__":
    generate_synthetic_cohort()
