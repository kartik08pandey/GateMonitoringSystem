from django.db import models
from django.utils import timezone
from django.db import models
import json

class Student(models.Model):
    name = models.CharField(max_length=100)
    studentId = models.CharField(max_length=20, unique=True, null=True)
    face_encoding = models.JSONField(null=True)  # Face encoding

    def set_face_encoding(self, encoding):
        self.face_encoding = json.dumps(encoding)

    def get_face_encoding(self):
        return json.loads(self.face_encoding)
    
    def __str__(self):
        return f"{self.name} ({self.studentId})"


class AttendanceRecord(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(default=timezone.now)
    action = models.CharField(max_length=10, choices=[('arrival', 'Arrival'), ('departure', 'Departure')])

    def __str__(self):
        return f"{self.student.name} - {self.action} at {self.timestamp.strftime('%Y-%m-%d %H:%M:%S')}"

    # Method to get date
    def get_date(self):
        return self.timestamp.strftime('%Y-%m-%d')
    
    # Method to get time
    def get_time(self):
        return self.timestamp.strftime("%H:%M:%S")
