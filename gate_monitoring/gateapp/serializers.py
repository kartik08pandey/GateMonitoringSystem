from rest_framework import serializers
from .models import Student, AttendanceRecord

class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ['id', 'name', 'studentId', 'face_encoding']
        read_only_fields = ['face_encoding']

class CombinedRecordSerializer(serializers.Serializer):
    student_id = serializers.CharField()
    name = serializers.CharField()
    date = serializers.DateField()
    arrival_time = serializers.TimeField(allow_null=True)
    departure_time = serializers.TimeField(allow_null=True)
