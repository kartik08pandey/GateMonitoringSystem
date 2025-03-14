import base64
import numpy as np
import cv2
import face_recognition
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

class FaceEncodingView(APIView):
    def post(self, request):
        try:
            image_data = request.data.get("image")
            if not image_data:
                return Response({"error": "No image provided"}, status=status.HTTP_400_BAD_REQUEST)

            # Remove header (e.g., "data:image/jpeg;base64,...")
            header, encoded = image_data.split(",", 1)
            image_bytes = base64.b64decode(encoded)

            # Convert bytes to numpy array and decode image
            np_arr = np.frombuffer(image_bytes, np.uint8)
            img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
            rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

            # Detect and encode face
            face_locations = face_recognition.face_locations(rgb_img)
            if len(face_locations) != 1:
                return Response({"error": "Ensure only one face is visible in the photo."}, status=status.HTTP_400_BAD_REQUEST)

            face_encoding = face_recognition.face_encodings(rgb_img, face_locations)[0]

            return Response({"encoding": face_encoding.tolist()}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# views.py (continued)

from .models import Student
from .serializers import StudentSerializer

class RegisterStudentView(APIView):
    def post(self, request):
        name = request.data.get("name")
        studentId = request.data.get("studentId")
        encoding = request.data.get("encoding")

        if not (name and studentId and encoding):
            return Response({"error": "Missing fields"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            student = Student(
                name=name,
                studentId=studentId,
                face_encoding=encoding
            )
            student.set_face_encoding(encoding)
            student.save()
            return Response({"message": "Student registered successfully!"}, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import AttendanceRecord
from collections import defaultdict

class CombinedRecordView(APIView):
    def get(self, request):
        date = request.GET.get("date")
        student_id = request.GET.get("studentId")

        # Filter records
        records = AttendanceRecord.objects.all().order_by('timestamp')
        if date:
            records = records.filter(timestamp__date=date)
        if student_id:
            records = records.filter(student__studentId=student_id)

        # Group records by (student_id, date)
        grouped_records = defaultdict(list)
        for record in records:
            key = (record.student.studentId, record.timestamp.date())
            grouped_records[key].append(record)

        result = []
        sno = 1

        for (studentId, record_date), actions in grouped_records.items():
            student_name = actions[0].student.name if actions else ""
            entry_no = 1
            i = 0
            while i < len(actions):
                if actions[i].action == "arrival":
                    arrival_time = actions[i].timestamp.strftime("%I:%M %p")
                    i += 1

                    # Find next departure
                    departure_time = None
                    while i < len(actions):
                        if actions[i].action == "departure":
                            departure_time = actions[i].timestamp.strftime("%I:%M %p")
                            i += 1
                            break
                        else:
                            # Skip invalid second arrival
                            i += 1

                    result.append({
                        "sno": sno,
                        "studentId": studentId,
                        "name": student_name,
                        "date": record_date,
                        "arrival": arrival_time,
                        "departure": departure_time,  # May be None (still count it)
                        "entry_no": entry_no
                    })
                    sno += 1
                    entry_no += 1
                else:
                    # Skip unpaired departure
                    i += 1

        return Response(result)




from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Student

class StudentListAPIView(APIView):
    def get(self, request):
        students = Student.objects.all().values("studentId", "name")
        return Response(students)


from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.utils import timezone
from gateapp.models import AttendanceRecord

# views.py (Django backend)
from django.http import JsonResponse
from .models import AttendanceRecord
from django.utils import timezone
from django.db.models import Max

def get_student_count(request):
    today = timezone.now().date()

    # Step 1: Get latest timestamp for each student for today
    latest_records = (
        AttendanceRecord.objects
        .filter(timestamp__date=today)
        .values('student')
        .annotate(latest_time=Max('timestamp'))
    )

    # Step 2: For each student, get their latest action (arrival or departure)
    present_count = 0
    for record in latest_records:
        student_id = record['student']
        latest_time = record['latest_time']

        latest_entry = AttendanceRecord.objects.filter(
            student_id=student_id,
            timestamp=latest_time
        ).first()

        if latest_entry and latest_entry.action == 'arrival':
            present_count += 1

    return JsonResponse({'count': present_count})



from django.http import StreamingHttpResponse
from .arrival_camera import gen_arrival
from .departure_camera import gen_departure

def arrival_feed(request):
    return StreamingHttpResponse(gen_arrival(), content_type='multipart/x-mixed-replace; boundary=frame')

def departure_feed(request):
    return StreamingHttpResponse(gen_departure(), content_type='multipart/x-mixed-replace; boundary=frame')

from django.utils import timezone
from .models import Student, AttendanceRecord

def log_attendance(student):
    now = timezone.localtime()
    today = now.date()
    time_now = now.time()

    # Check for latest record with no departure
    last_record = AttendanceRecord.objects.filter(
        student=student,
        date=today,
        departure_time__isnull=True
    ).order_by('-arrival_time').first()

    if last_record:
        # Mark departure for last active arrival
        last_record.departure_time = time_now
        last_record.save()
    else:
        # No active session, create new arrival
        AttendanceRecord.objects.create(
            student=student,
            date=today,
            arrival_time=time_now
        )
