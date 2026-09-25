import requests

BASE_URL = "http://127.0.0.1:8000"

def test_full_loop():
    # 1. Reset Demo
    print("1. Resetting demo seed...")
    res = requests.post(f"{BASE_URL}/demo/reset-seed")
    assert res.status_code == 200, res.text
    demo_data = res.json()
    course_id = demo_data["course_id"]
    print(f"   -> Demo Course: {demo_data['course_name']} ({course_id})")

    # 2. Get Concepts
    print("\n2. Fetching course concepts...")
    res = requests.get(f"{BASE_URL}/courses/{course_id}/concepts")
    assert res.status_code == 200
    concepts = res.json()
    cq = next((c for c in concepts if c["name"] == "Circular Queue"), None)
    assert cq is not None, "Circular Queue not found!"
    print(f"   -> Circular Queue initial status: {cq['status']}")
    assert cq["status"] == "NOT_STARTED", f"Expected NOT_STARTED, got {cq['status']}"

    # 3. Get Questions
    print("\n3. Fetching questions for Circular Queue...")
    res = requests.get(f"{BASE_URL}/concepts/{cq['id']}/questions")
    assert res.status_code == 200
    questions = res.json()
    print(f"   -> Loaded {len(questions)} questions")
    assert len(questions) >= 3

    # 4. Submit Practice with 3 wrong answers
    print("\n4. Submitting practice with 3 mistakes on Circular Queue...")
    answers = []
    for idx, q in enumerate(questions):
        if idx < 3:
            wrong_opt = next((opt for opt in q["options"] if opt != q["correct_answer"]), q["options"][0])
            answers.append({"question_id": q["id"], "selected_answer": wrong_opt})
        else:
            answers.append({"question_id": q["id"], "selected_answer": q["correct_answer"]})

    res = requests.post(
        f"{BASE_URL}/concepts/{cq['id']}/practice",
        json={"concept_id": cq["id"], "answers": answers}
    )
    assert res.status_code == 200, res.text
    result = res.json()
    print(f"   -> Accuracy: {result['accuracy']}%")
    print(f"   -> Previous status: {result['previous_status']}")
    print(f"   -> New status: {result['new_status']}")
    print(f"   -> Map changed: {result['map_changed']}")
    print(f"   -> Weakness detected: {result['weakness_detected']}")
    print(f"   -> Weakness reason: {result['weakness_reason']}")
    print(f"   -> Recommendation: {result['recommendation']}")

    assert result["new_status"] == "NEEDS_ATTENTION", f"Expected NEEDS_ATTENTION, got {result['new_status']}"
    assert result["map_changed"] is True
    assert result["weakness_detected"] is True

    # 5. Verify Next Recommendation Endpoint
    print("\n5. Checking Course Recommendation Endpoint...")
    res = requests.get(f"{BASE_URL}/courses/{course_id}/recommendations/next")
    assert res.status_code == 200
    rec = res.json()
    print(f"   -> Recommended Action: {rec['reason']}")
    print(f"   -> Based on: {rec['based_on']}")

    # 6. Verify LearnMap graph state reflects new status
    print("\n6. Checking Live React Flow LearnMap output...")
    res = requests.get(f"{BASE_URL}/courses/{course_id}/map")
    assert res.status_code == 200
    map_data = res.json()
    cq_node = next((n for n in map_data["nodes"] if n["data"]["label"] == "Circular Queue"), None)
    assert cq_node is not None
    print(f"   -> Node {cq_node['data']['label']} status in graph: {cq_node['data']['status']}")
    assert cq_node["data"]["status"] == "NEEDS_ATTENTION"

    print("\n[SUCCESS] ALL TESTS PASSED! End-to-end LearnMap loop is 100% verified.")

if __name__ == "__main__":
    test_full_loop()

