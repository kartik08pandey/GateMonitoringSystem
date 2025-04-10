from django.urls import path
from .views import FaceEncodingView, RegisterStudentView, CombinedRecordView, StudentListAPIView
from . import views

urlpatterns = [
    path('api/face/encode/', FaceEncodingView.as_view(), name='face-encode'),
    path('api/register/student/', RegisterStudentView.as_view(), name='register-student'),
    path('api/combined-records/', CombinedRecordView.as_view(), name='combined-records'),
    path('api/arrival-feed/', views.arrival_feed),
    path('api/departure-feed/', views.departure_feed),
    path('api/student-count/', views.get_student_count, name='student-count'),
     path("api/students/", StudentListAPIView.as_view()),
]