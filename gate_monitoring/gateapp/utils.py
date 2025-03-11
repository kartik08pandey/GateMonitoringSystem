import numpy as np
import ast
from .models import Student

def load_known_encodings():
    students = Student.objects.exclude(face_encoding=None)
    known_encodings = []
    known_roll_numbers = []

    for student in students:
        try:
            # Convert string to actual list
            encoding_list = ast.literal_eval(student.face_encoding)
            encoding_array = np.array(encoding_list, dtype=np.float64)

            known_encodings.append(encoding_array)
            known_roll_numbers.append(student.studentId)  # Use correct field
        except Exception as e:
            print(f"[ERROR] Failed to parse encoding for {student.studentId}: {e}")

    return known_encodings, known_roll_numbers

from .models import AttendanceRecord
from django.utils import timezone

def log_attendance(student, action='arrival'):
    now = timezone.now()

    # Optional: Prevent duplicate marking in the last X minutes
    recent_time_window = now - timezone.timedelta(minutes=60)
    if AttendanceRecord.objects.filter(student=student, action=action, timestamp__gte=recent_time_window).exists():
        return False  # Already marked recently

    AttendanceRecord.objects.create(student=student, action=action)
    return True
