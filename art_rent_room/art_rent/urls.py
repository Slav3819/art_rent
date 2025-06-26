"""
URL configuration for art_rent project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.urls import re_path as url
from backend_api.views import *
from django.urls import path
from users.views import RegisterView, LoginView, UserView, LogoutView



urlpatterns = [
    path('admin/', admin.site.urls),
    path('users', UserRentView.as_view(), name='oh shit'),
    path('', DeviceRentView.as_view(), name='oh shit'),
    path('api/', include('users.urls')),
    path('registration', RegisterView.as_view()),
    path('login', LoginView.as_view()),
    path('user', UserView.as_view()),
    path('logout', LogoutView.as_view()),
    path('basket/', BasketAPIView.as_view(), name='basket-list'),
    path('basket/<int:pk>/', BasketDetailAPIView.as_view(), name='basket-detail'),
    path('basket/clear/', ClearBasketAPIView.as_view(), name='basket-clear'),
    path('api/orders/', OrderCreateView.as_view(), name='order-create'),
    path('api/orders_list/', OrderListView.as_view(), name='order-list'),
    path('api/orders/<int:pk>/', OrderDetailView.as_view(), name='order-detail'),
    path('api/orders/<int:pk>/status/', OrderStatusUpdateView.as_view(), name='order-status-update'),
]
