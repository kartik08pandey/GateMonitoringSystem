# arrival_camera.py
import cv2
import face_recognition
import time
import threading
import os
import django
import numpy as np

# Django setup
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gate_monitoring.settings')
django.setup()

from gateapp.models import Student
from gateapp.utils import load_known_encodings, log_attendance

# Load encodings
known_encodings, known_roll_numbers = load_known_encodings()

# Configs
process_every_n_frames = 5
resize_scale = 0.25
frame_lock = threading.Lock()
latest_frame = None  # Shared buffer between threads

def recognition_worker():
    global latest_frame
    video_capture = cv2.VideoCapture(0)
    video_capture.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    video_capture.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    video_capture.set(cv2.CAP_PROP_FPS, 30)

    frame_count = 0

    while True:
        ret, frame = video_capture.read()
        if not ret:
            continue

        frame_count += 1
        display_frame = frame.copy()

        if frame_count % process_every_n_frames == 0:
            # Resize for face recognition
            small_frame = cv2.resize(frame, (0, 0), fx=resize_scale, fy=resize_scale)
            rgb_small = cv2.cvtColor(small_frame, cv2.COLOR_BGR2RGB)

            face_locations = face_recognition.face_locations(rgb_small)
            face_encodings = face_recognition.face_encodings(rgb_small, face_locations)

            for face_encoding, face_location in zip(face_encodings, face_locations):
                matches = face_recognition.compare_faces(known_encodings, face_encoding)
                face_distances = face_recognition.face_distance(known_encodings, face_encoding)

                best_match_index = face_distances.argmin() if matches else None

                if best_match_index is not None and matches[best_match_index]:
                    roll_number = known_roll_numbers[best_match_index]
                    try:
                        student = Student.objects.get(studentId=roll_number)
                        if log_attendance(student, 'arrival'):
                            print(f"[MARKED] Arrival for {student.name}")
                        else:
                            print(f"[SKIPPED] Already marked for {student.name}")

                        # Scale face location back up
                        top, right, bottom, left = [int(coord / resize_scale) for coord in face_location]

                        # Draw box and name
                        cv2.rectangle(display_frame, (left, top), (right, bottom), (0, 255, 0), 2)
                        cv2.putText(display_frame, student.name, (left, top - 10),
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)

                    except Student.DoesNotExist:
                        pass

        # Update latest frame safely
        with frame_lock:
            latest_frame = display_frame

        time.sleep(0.01)  # Control CPU usage

def gen_arrival():
    global latest_frame
    # Start recognition thread once
    recognition_thread = threading.Thread(target=recognition_worker, daemon=True)
    recognition_thread.start()

    print("[INFO] Streaming arrival camera feed...")

    while True:
        if latest_frame is not None:
            with frame_lock:
                ret, buffer = cv2.imencode('.jpg', latest_frame)
                if not ret:
                    continue
                frame_bytes = buffer.tobytes()

            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
        else:
            # Show black frame until ready
            black = cv2.imencode('.jpg', 255 * np.zeros((480, 640, 3), dtype=np.uint8))[1].tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + black + b'\r\n')
            time.sleep(0.1)
