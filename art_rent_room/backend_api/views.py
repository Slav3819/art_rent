from rest_framework.views import APIView
from .models import UserRent, DeviceRent, Basket
from .serializer import UserRentSerializer, DeviceRentSerializer, BasketSerializer
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from rest_framework.pagination import PageNumberPagination
from rest_framework import status
from rest_framework.response import Response
from .models import Order
from .models import Favorite
from .serializer import FavoriteSerializer
from rest_framework.exceptions import AuthenticationFailed
from .authentication import get_user_from_token

from .serializer import (
    OrderCreateSerializer,
    OrderSerializer,
    OrderStatusSerializer
)

class OrderCreateView(APIView):
    def post(self, request):
        try:
            user = get_user_from_token(request)
        except AuthenticationFailed as e:
            return Response({'detail': str(e)}, status=status.HTTP_401_UNAUTHORIZED)

        # Добавляем email пользователя, если не указан
        if 'customerInfo' in request.data and 'email' not in request.data['customerInfo']:
            request.data['customerInfo']['email'] = user.email

        serializer = OrderCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Добавляем пользователя к данным заказа
        validated_data = serializer.validated_data
        validated_data['user'] = user

        order = serializer.save()

        response_serializer = OrderSerializer(order)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

class OrderListView(APIView):
    def get(self, request):
        try:
            user = get_user_from_token(request)
        except AuthenticationFailed as e:
            return Response({'detail': str(e)}, status=status.HTTP_401_UNAUTHORIZED)

        if user.is_staff:
            orders = Order.objects.all().order_by('-created_at')
        else:
            orders = Order.objects.filter(user=user).order_by('-created_at')

        serializer = OrderSerializer(orders, many=True)
        response = Response(serializer.data)
        response['Access-Control-Allow-Origin'] = 'http://localhost:3000'
        response['Access-Control-Allow-Credentials'] = 'true'
        return response

class OrderDetailView(APIView):
    def get(self, request, pk):
        try:
            user = get_user_from_token(request)
        except AuthenticationFailed as e:
            return Response({'detail': str(e)}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            if user.is_staff:
                order = Order.objects.get(pk=pk)
            else:
                order = Order.objects.get(pk=pk, user=user)
        except Order.DoesNotExist:
            return Response(
                {'detail': 'Заказ не найден'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = OrderSerializer(order)
        return Response(serializer.data)

class OrderStatusUpdateView(APIView):

    def patch(self, request, pk):
        try:
            user = get_user_from_token(request)
        except AuthenticationFailed as e:
            return Response({'detail': str(e)}, status=status.HTTP_401_UNAUTHORIZED)

        if not user.is_staff:
            return Response(
                {'detail': 'Недостаточно прав'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            order = Order.objects.get(pk=pk)
        except Order.DoesNotExist:
            return Response(
                {'detail': 'Заказ не найден'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = OrderStatusSerializer(order, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response({
            'status': 'success',
            'message': 'Статус заказа обновлен',
            'data': OrderSerializer(order).data
        })

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 6  # Количество элементов на странице
    page_size_query_param = 'page_size'
    max_page_size = 100

    def get_paginated_response(self, data):
        return Response({
            'links': {
                'next': self.get_next_link(),
                'previous': self.get_previous_link()
            },
            'count': self.page.paginator.count,
            'total_pages': self.page.paginator.num_pages,  # Добавляем общее количество страниц
            'current_page': self.page.number,  # Добавляем текущую страницу
            'results': data,
            'page_size': self.get_page_size(self.request)  # Добавляем текущий размер страницы
        })


# Create your views here.
class UserRentView(APIView):
    def get(self, request):
        output = [
            {
                "name": output.name,
                "title": output.title
            } for output in UserRent.objects.all()
        ]
        return Response(output)

    def post(self, request):
        serializer = UserRentSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response(serializer.data)

class DeviceRentView(APIView):
    def get(self, request):
        paginator = StandardResultsSetPagination()
        queryset = DeviceRent.objects.all()
        result_page = paginator.paginate_queryset(queryset, request)
        serializer = DeviceRentSerializer(result_page, many=True)
        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        serializer = DeviceRentSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response(serializer.data)


class BasketAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        baskets = Basket.objects.filter(user=request.user)
        serializer = BasketSerializer(baskets, many=True)
        return Response(serializer.data)

    def post(self, request):
        device_id = request.data.get('device')
        device = get_object_or_404(DeviceRent, id=device_id)

        # Проверяем, есть ли уже устройство в корзине
        basket_item, created = Basket.objects.get_or_create(
            user=request.user,
            device=device,
            defaults={'quantity': request.data.get('quantity', 1)}
        )

        if not created:
            basket_item.quantity += int(request.data.get('quantity', 1))
            basket_item.save()

        serializer = BasketSerializer(basket_item)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class BasketDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):

        basket_item = get_object_or_404(Basket, pk=pk, user=request.user)
        basket_item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def patch(self, request, pk):

        basket_item = get_object_or_404(Basket, pk=pk, user=request.user)
        quantity = request.data.get('quantity')

        if quantity and quantity.isdigit():
            basket_item.quantity = int(quantity)
            basket_item.save()
            serializer = BasketSerializer(basket_item)
            return Response(serializer.data)

        return Response(
            {"error": "Invalid quantity"},
            status=status.HTTP_400_BAD_REQUEST
        )


class ClearBasketAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):

        Basket.objects.filter(user=request.user).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class FavoriteView(APIView):
    def get(self, request):

        try:
            user = get_user_from_token(request)
        except AuthenticationFailed as e:
            return Response({'detail': str(e)}, status=status.HTTP_401_UNAUTHORIZED)

        if user.is_staff:
            favorites = Favorite.objects.all()
        else:
            favorites = Favorite.objects.filter(user=user)

        serializer = FavoriteSerializer(favorites, many=True)
        return Response(serializer.data)

    def post(self, request):

        try:
            user = get_user_from_token(request)
        except AuthenticationFailed as e:
            return Response({'detail': str(e)}, status=status.HTTP_401_UNAUTHORIZED)

        device_id = request.data.get('device')
        if not device_id:
            return Response({'detail': 'Device ID is required'}, status=status.HTTP_400_BAD_REQUEST)

        device = get_object_or_404(DeviceRent, id=device_id)

        favorite, created = Favorite.objects.get_or_create(
            user=user,
            device=device,
        )

        serializer = FavoriteSerializer(favorite)
        return Response(serializer.data,
                       status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    def delete(self, request):

        try:
            user = get_user_from_token(request)
        except AuthenticationFailed as e:
            return Response({'detail': str(e)}, status=status.HTTP_401_UNAUTHORIZED)

        device_id = request.data.get('device_id')
        if not device_id:
            return Response({'detail': 'Device ID is required'}, status=status.HTTP_400_BAD_REQUEST)

        favorite = get_object_or_404(Favorite, user=user, device_id=device_id)
        favorite.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)