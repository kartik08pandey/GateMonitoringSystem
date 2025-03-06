# departure_camera.py
import cv2
import face_recognition
from django.utils import timezone
import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gate_monitoring.settings')
django.setup()

from gateapp.models import Student, AttendanceRecord
from gateapp.utils import load_known_encodings

# Load encodings
known_encodings, known_roll_numbers = load_known_encodings()

def gen_departure():
    # Use the appropriate camera index (adjust if needed)
    video_capture = cv2.VideoCapture(2)

    # Set frame size
    video_capture.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    video_capture.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

    print("[INFO] Starting departure stream...")

    while True:
        ret, frame = video_capture.read()
        if not ret:
            break

        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        face_locations = face_recognition.face_locations(rgb_frame)
        face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)

        for face_encoding, face_location in zip(face_encodings, face_locations):
            matches = face_recognition.compare_faces(known_encodings, face_encoding)
            face_distances = face_recognition.face_distance(known_encodings, face_encoding)

            best_match_index = None
            if matches:
                best_match_index = face_distances.argmin()
                if matches[best_match_index]:
                    roll_number = known_roll_numbers[best_match_index]
                    try:
                        student = Student.objects.get(studentId=roll_number)

                        # Check if already marked within last 1 hour
                        from gateapp.utils import log_attendance  # Add at the top

                        # Inside loop after student match
                        if log_attendance(student, action='departure'):
                            print(f"[MARKED] departure'): for {student.name}")
                        else:
                            print(f"[SKIPPED] Already marked recently for {student.name}")


                        # Draw name on frame (optional)
                        top, right, bottom, left = face_location
                        cv2.rectangle(frame, (left, top), (right, bottom), (255, 0, 0), 2)
                        cv2.putText(frame, student.name, (left, top - 10),
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 0, 0), 2)

                    except Student.DoesNotExist:
                        pass

        # Encode frame as JPEG
        ret, buffer = cv2.imencode('.jpg', frame)
        frame_bytes = buffer.tobytes()

        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

    video_capture.release()
